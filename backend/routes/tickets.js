const express = require('express');
const { supabase } = require('../lib/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { generateQRDataURL, generateSerial } = require('../lib/qrGenerator');
const { createOrder, verifyPayment } = require('../lib/razorpay');
const { sendTicketEmail, generateTicketPDF } = require('../lib/emailService');

const router = express.Router();

// POST /api/tickets/sell — Initiate ticket sale
router.post('/sell', authMiddleware, requireRole('SELLER', 'ADMIN'), async (req, res) => {
  try {
    const { event_id, type_id, buyer_name, buyer_email, buyer_phone, payment_method } = req.body;

    if (!event_id || !type_id || !buyer_name || !buyer_email || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get ticket type for price
    const { data: ticketType, error: ttError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', type_id)
      .single();

    if (ttError || !ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    // Get event info
    const { data: event, error: evError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (evError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (payment_method === 'cash') {
      // Cash sale — create ticket immediately
      let serial = generateSerial();

      // Ensure serial is unique
      let exists = true;
      while (exists) {
        const { data } = await supabase
          .from('tickets')
          .select('id')
          .eq('serial', serial)
          .single();
        if (!data) {
          exists = false;
        } else {
          serial = generateSerial();
        }
      }

      const qrDataURL = await generateQRDataURL(serial);

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id,
          type_id,
          serial,
          qr_data: qrDataURL,
          buyer_name,
          buyer_email,
          buyer_phone: buyer_phone || null,
          payment_method: 'cash',
          status: 'sold',
          sold_by: req.user.id,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create payment record
      await supabase.from('payments').insert({
        ticket_id: ticket.id,
        method: 'cash',
        status: 'paid',
        amount: ticketType.price,
      });

      // Send email (async — don't block response)
      const ticketData = {
        eventName: event.name,
        venue: event.venue,
        eventDate: new Date(event.start_time).toLocaleString(),
        buyerName: buyer_name,
        buyerEmail: buyer_email,
        buyerPhone: buyer_phone,
        ticketType: ticketType.name,
        amount: ticketType.price,
        serial,
        qrDataURL,
        paymentMethod: 'Cash',
      };

      sendTicketEmail(buyer_email, ticketData).catch((err) =>
        console.error('Email send failed:', err)
      );

      res.status(201).json({
        ticket: { ...ticket, ticket_type: ticketType, event },
        message: 'Ticket created successfully',
      });
    } else if (payment_method === 'razorpay') {
      // Online sale — create Razorpay order
      const amountInPaise = Math.round(ticketType.price * 100);
      const receipt = `rcpt_${Date.now()}`;

      const order = await createOrder(amountInPaise, receipt);

      // Store pending ticket info in a temporary way (we'll create ticket on confirmation)
      // We return the order_id and necessary info for frontend
      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        buyer_name,
        buyer_email,
        event_name: event.name,
        ticket_type_name: ticketType.name,
        // Pass these back so frontend can send them on confirmation
        _meta: { event_id, type_id, buyer_name, buyer_email, buyer_phone },
      });
    } else {
      res.status(400).json({ error: 'Invalid payment method. Use "cash" or "razorpay"' });
    }
  } catch (err) {
    console.error('Ticket sell error:', err);
    res.status(500).json({ error: 'Failed to process ticket sale' });
  }
});

// POST /api/tickets/sell/confirm — Confirm online payment and create ticket
router.post('/sell/confirm', authMiddleware, requireRole('SELLER', 'ADMIN'), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      event_id,
      type_id,
      buyer_name,
      buyer_email,
      buyer_phone,
    } = req.body;

    // Verify payment signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Get ticket type and event info
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', type_id)
      .single();

    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (!ticketType || !event) {
      return res.status(404).json({ error: 'Event or ticket type not found' });
    }

    // Generate serial and QR
    let serial = generateSerial();
    let exists = true;
    while (exists) {
      const { data } = await supabase
        .from('tickets')
        .select('id')
        .eq('serial', serial)
        .single();
      if (!data) exists = false;
      else serial = generateSerial();
    }

    const qrDataURL = await generateQRDataURL(serial);

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        event_id,
        type_id,
        serial,
        qr_data: qrDataURL,
        buyer_name,
        buyer_email,
        buyer_phone: buyer_phone || null,
        payment_method: 'razorpay',
        status: 'sold',
        sold_by: req.user.id,
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Create payment record
    await supabase.from('payments').insert({
      ticket_id: ticket.id,
      method: 'razorpay',
      status: 'paid',
      razorpay_order_id,
      razorpay_payment_id,
      amount: ticketType.price,
    });

    // Send email
    const ticketData = {
      eventName: event.name,
      venue: event.venue,
      eventDate: new Date(event.start_time).toLocaleString(),
      buyerName: buyer_name,
      buyerEmail: buyer_email,
      buyerPhone: buyer_phone,
      ticketType: ticketType.name,
      amount: ticketType.price,
      serial,
      qrDataURL,
      paymentMethod: 'Razorpay (Online)',
    };

    sendTicketEmail(buyer_email, ticketData).catch((err) =>
      console.error('Email send failed:', err)
    );

    res.status(201).json({
      ticket: { ...ticket, ticket_type: ticketType, event },
      message: 'Payment verified and ticket created successfully',
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// GET /api/tickets/validate — Validate ticket by serial (Checker)
router.get('/validate', authMiddleware, requireRole('CHECKER', 'ADMIN'), async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Ticket code is required' });
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:type_id (name, price),
        events:event_id (name, venue, start_time)
      `)
      .eq('serial', code.toUpperCase().trim())
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found', valid: false });
    }

    res.json({
      valid: true,
      ticket: {
        id: ticket.id,
        serial: ticket.serial,
        buyer_name: ticket.buyer_name,
        buyer_email: ticket.buyer_email,
        buyer_phone: ticket.buyer_phone,
        status: ticket.status,
        ticket_type: ticket.ticket_types?.name,
        event_name: ticket.events?.name,
        event_venue: ticket.events?.venue,
        event_date: ticket.events?.start_time,
        qr_data: ticket.qr_data,
        checked_in_at: ticket.checkedin_at,
      },
    });
  } catch (err) {
    console.error('Validate error:', err);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// POST /api/tickets/checkin — Mark ticket as checked-in
router.post('/checkin', authMiddleware, requireRole('CHECKER', 'ADMIN'), async (req, res) => {
  try {
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    // Get current ticket status
    const { data: ticket } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', ticket_id)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'checked-in') {
      return res.status(409).json({ error: 'Ticket already checked in' });
    }

    // Update status
    const { data: updated, error } = await supabase
      .from('tickets')
      .update({
        status: 'checked-in',
        checkedin_at: new Date().toISOString(),
      })
      .eq('id', ticket_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(500).json({ error: 'Failed to check in ticket' });
  }
});

// GET /api/tickets — List tickets (optionally filtered by event)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:type_id (name, price),
        events:event_id (name, venue, start_time)
      `)
      .order('created_at', { ascending: false });

    if (req.query.event_id) {
      query = query.eq('event_id', req.query.event_id);
    }

    // Sellers only see their own tickets
    if (req.user.role === 'SELLER') {
      query = query.eq('sold_by', req.user.id);
    }

    const { data: tickets, error } = await query;

    if (error) throw error;
    res.json({ tickets });
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id/pdf — Download ticket PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:type_id (name, price),
        events:event_id (name, venue, start_time)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticketData = {
      eventName: ticket.events?.name,
      venue: ticket.events?.venue,
      eventDate: ticket.events?.start_time
        ? new Date(ticket.events.start_time).toLocaleString()
        : '',
      buyerName: ticket.buyer_name,
      buyerEmail: ticket.buyer_email,
      buyerPhone: ticket.buyer_phone,
      ticketType: ticket.ticket_types?.name,
      amount: ticket.ticket_types?.price,
      serial: ticket.serial,
      qrDataURL: ticket.qr_data,
      paymentMethod: ticket.payment_method,
    };

    const pdfBuffer = await generateTicketPDF(ticketData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${ticket.serial}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
