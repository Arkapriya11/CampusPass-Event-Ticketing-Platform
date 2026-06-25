import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './SellerPages.css';

export default function SalesHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filterEvent, setFilterEvent] = useState('');

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data.events)).catch(() => {});
    fetchTickets();
  }, []);

  const fetchTickets = async (eventId) => {
    try {
      const params = eventId ? `?event_id=${eventId}` : '';
      const res = await api.get(`/tickets${params}`);
      setTickets(res.data.tickets);
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (eventId) => {
    setFilterEvent(eventId);
    setLoading(true);
    fetchTickets(eventId);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : '—';

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="seller-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">Tickets you've sold</p>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <select className="form-input form-select" value={filterEvent}
          onChange={(e) => handleFilterChange(e.target.value)} style={{ maxWidth: '300px' }}>
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      <div className="content-card">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎫</div>
            <p className="empty-state__text">No tickets sold yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Buyer</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <code style={{ color: 'var(--accent-primary-hover)', fontWeight: 600 }}>
                        {t.serial}
                      </code>
                    </td>
                    <td>
                      <div><strong>{t.buyer_name}</strong></div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t.buyer_email}</div>
                    </td>
                    <td>{t.events?.name || '—'}</td>
                    <td><span className="badge badge-admin">{t.ticket_types?.name || '—'}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{t.payment_method}</td>
                    <td>
                      <span className={`badge ${t.status === 'checked-in' ? 'badge-checked-in' : 'badge-sold'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      {formatDate(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
