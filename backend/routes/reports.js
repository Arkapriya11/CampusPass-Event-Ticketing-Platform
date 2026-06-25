const express = require('express');
const { supabase } = require('../lib/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/sales — Sales summary
router.get('/sales', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { event_id } = req.query;

    // Get all tickets (optionally filtered by event)
    let ticketQuery = supabase.from('tickets').select(`
      *,
      ticket_types:type_id (name, price),
      events:event_id (name)
    `);

    if (event_id) {
      ticketQuery = ticketQuery.eq('event_id', event_id);
    }

    const { data: tickets, error } = await ticketQuery;
    if (error) throw error;

    // Calculate totals
    const totalSold = tickets.length;
    const totalCheckedIn = tickets.filter((t) => t.status === 'checked-in').length;

    // Revenue calculated from tickets instead of disconnected payments table
    const totalRevenue = tickets.reduce((sum, t) => sum + (parseFloat(t.ticket_types?.price) || 0), 0);
    const cashRevenue = tickets
      .filter((t) => t.payment_method === 'cash')
      .reduce((sum, t) => sum + (parseFloat(t.ticket_types?.price) || 0), 0);
    const onlineRevenue = tickets
      .filter((t) => t.payment_method === 'razorpay')
      .reduce((sum, t) => sum + (parseFloat(t.ticket_types?.price) || 0), 0);

    // Sales by ticket type
    const salesByType = {};
    tickets.forEach((t) => {
      const typeName = t.ticket_types?.name || 'Unknown';
      if (!salesByType[typeName]) {
        salesByType[typeName] = { count: 0, revenue: 0 };
      }
      salesByType[typeName].count++;
      salesByType[typeName].revenue += parseFloat(t.ticket_types?.price || 0);
    });

    // Sales by event
    const salesByEvent = {};
    tickets.forEach((t) => {
      const eventName = t.events?.name || 'Unknown';
      if (!salesByEvent[eventName]) {
        salesByEvent[eventName] = { sold: 0, checkedIn: 0, revenue: 0 };
      }
      salesByEvent[eventName].sold++;
      if (t.status === 'checked-in') salesByEvent[eventName].checkedIn++;
      salesByEvent[eventName].revenue += parseFloat(t.ticket_types?.price || 0);
    });

    // Sales over time (last 7 days)
    const salesOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTickets = tickets.filter(
        (t) => t.created_at && t.created_at.startsWith(dateStr)
      );
      salesOverTime.push({
        date: dateStr,
        count: dayTickets.length,
      });
    }

    res.json({
      totalSold,
      totalCheckedIn,
      totalRevenue,
      cashRevenue,
      onlineRevenue,
      salesByType,
      salesByEvent,
      salesOverTime,
    });
  } catch (err) {
    console.error('Sales report error:', err);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// GET /api/reports/checkins — Check-in statistics
router.get('/checkins', authMiddleware, requireRole('ADMIN', 'CHECKER'), async (req, res) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events:event_id (name)
      `)
      .eq('status', 'checked-in')
      .order('checkedin_at', { ascending: false });

    if (error) throw error;

    res.json({
      total: tickets.length,
      recentCheckins: tickets.slice(0, 20),
    });
  } catch (err) {
    console.error('Checkins report error:', err);
    res.status(500).json({ error: 'Failed to generate check-in report' });
  }
});

module.exports = router;
