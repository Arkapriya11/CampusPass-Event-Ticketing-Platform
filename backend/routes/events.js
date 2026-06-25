const express = require('express');
const { supabase } = require('../lib/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/events — List all events with ticket types
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch ticket counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const { count: soldCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        const { count: checkedInCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'checked-in');

        return {
          ...event,
          tickets_sold: soldCount || 0,
          tickets_checked_in: checkedInCount || 0,
        };
      })
    );

    res.json({ events: eventsWithCounts });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id — Get single event with ticket types
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events — Create event with ticket types (Admin only)
router.post('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, venue, start_time, end_time, ticket_types } = req.body;

    if (!name || !venue || !start_time || !end_time) {
      return res.status(400).json({ error: 'Name, venue, start_time, and end_time are required' });
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({ name, venue, start_time, end_time })
      .select()
      .single();

    if (eventError) throw eventError;

    // Create ticket types if provided
    if (ticket_types && ticket_types.length > 0) {
      const typesWithEventId = ticket_types.map((tt) => ({
        event_id: event.id,
        name: tt.name,
        price: tt.price,
      }));

      const { error: typesError } = await supabase
        .from('ticket_types')
        .insert(typesWithEventId);

      if (typesError) throw typesError;
    }

    // Fetch complete event with types
    const { data: fullEvent } = await supabase
      .from('events')
      .select('*, ticket_types (*)')
      .eq('id', event.id)
      .single();

    res.status(201).json({ event: fullEvent });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id — Update event (Admin only)
router.put('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, venue, start_time, end_time, ticket_types } = req.body;

    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({ name, venue, start_time, end_time })
      .eq('id', req.params.id)
      .select()
      .single();

    if (eventError) throw eventError;

    // Update ticket types if provided: delete existing and re-insert
    if (ticket_types && ticket_types.length > 0) {
      await supabase
        .from('ticket_types')
        .delete()
        .eq('event_id', req.params.id);

      const typesWithEventId = ticket_types.map((tt) => ({
        event_id: req.params.id,
        name: tt.name,
        price: tt.price,
      }));

      await supabase
        .from('ticket_types')
        .insert(typesWithEventId);
    }

    const { data: fullEvent } = await supabase
      .from('events')
      .select('*, ticket_types (*)')
      .eq('id', req.params.id)
      .single();

    res.json({ event: fullEvent });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id — Delete event (Admin only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    // Delete related tickets first
    await supabase.from('tickets').delete().eq('event_id', req.params.id);
    // Delete ticket types
    await supabase.from('ticket_types').delete().eq('event_id', req.params.id);
    // Delete event
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
