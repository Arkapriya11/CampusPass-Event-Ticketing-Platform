import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import './CheckerPages.css';

export default function CheckInHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/checkins')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  const formatTime = (d) => d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <div className="checker-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-In History</h1>
          <p className="page-subtitle">{data?.total || 0} total check-ins</p>
        </div>
      </div>

      <div className="content-card">
        {!data?.recentCheckins?.length ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <p className="empty-state__text">No check-ins yet</p>
          </div>
        ) : (
          <div className="checkin-history-list">
            {data.recentCheckins.map((ticket) => (
              <div key={ticket.id} className="checkin-history-item animate-fade-in">
                <div className="checkin-history-item__icon">
                  <CheckCircle size={20} />
                </div>
                <div className="checkin-history-item__info">
                  <div className="checkin-history-item__name">{ticket.buyer_name}</div>
                  <div className="checkin-history-item__meta">
                    {ticket.events?.name || '—'} · {ticket.serial}
                  </div>
                </div>
                <div className="checkin-history-item__time">
                  {formatTime(ticket.checkedin_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
