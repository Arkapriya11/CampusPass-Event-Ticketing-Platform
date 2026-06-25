import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    name: '', venue: '', start_time: '', end_time: '',
    ticket_types: [{ name: 'Delegate', price: '' }, { name: 'Executive', price: '' }],
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      toast.error('Failed to fetch events');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      name: '', venue: '', start_time: '', end_time: '',
      ticket_types: [{ name: 'Delegate', price: '' }, { name: 'Executive', price: '' }],
    });
    setEditingEvent(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      name: event.name,
      venue: event.venue,
      start_time: event.start_time?.slice(0, 16) || '',
      end_time: event.end_time?.slice(0, 16) || '',
      ticket_types: event.ticket_types?.length
        ? event.ticket_types.map((t) => ({ name: t.name, price: t.price }))
        : [{ name: 'Delegate', price: '' }],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        ticket_types: form.ticket_types.filter((t) => t.name && t.price),
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/events', payload);
        toast.success('Event created');
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event? All tickets will be lost.')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const addTicketType = () => {
    setForm({ ...form, ticket_types: [...form.ticket_types, { name: '', price: '' }] });
  };

  const removeTicketType = (index) => {
    setForm({
      ...form,
      ticket_types: form.ticket_types.filter((_, i) => i !== index),
    });
  };

  const updateTicketType = (index, field, value) => {
    const types = [...form.ticket_types];
    types[index] = { ...types[index], [field]: value };
    setForm({ ...form, ticket_types: types });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Manage your college events and ticket types</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-event-btn">
          <Plus size={18} /> Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state__icon">📅</div>
            <p className="empty-state__text">No events yet. Create your first event!</p>
          </div>
        </div>
      ) : (
        <div className="content-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Ticket Types</th>
                  <th>Sold</th>
                  <th>Checked In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="animate-fade-in">
                    <td><strong>{event.name}</strong></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
                        {event.venue}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      {formatDate(event.start_time)}
                    </td>
                    <td>
                      {event.ticket_types?.map((t) => (
                        <span key={t.id} className="badge badge-admin" style={{ marginRight: '4px' }}>
                          {t.name}: ₹{t.price}
                        </span>
                      ))}
                    </td>
                    <td><span className="badge badge-sold">{event.tickets_sold}</span></td>
                    <td><span className="badge badge-checked-in">{event.tickets_checked_in}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" onClick={() => openEdit(event)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn action-btn--danger" onClick={() => handleDelete(event.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input className="form-input" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tech Fest 2026" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className="form-input" value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="datetime-local" className="form-input" value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input type="datetime-local" className="form-input" value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ticket Types</label>
                  <div className="ticket-types-builder">
                    {form.ticket_types.map((tt, i) => (
                      <div key={i} className="ticket-type-row">
                        <div className="form-group">
                          <input className="form-input" placeholder="Type name" value={tt.name}
                            onChange={(e) => updateTicketType(i, 'name', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <input className="form-input" type="number" placeholder="Price (₹)" value={tt.price}
                            onChange={(e) => updateTicketType(i, 'price', e.target.value)} min="0" />
                        </div>
                        {form.ticket_types.length > 1 && (
                          <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeTicketType(i)}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addTicketType}>
                      <Plus size={14} /> Add Type
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEvent ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
