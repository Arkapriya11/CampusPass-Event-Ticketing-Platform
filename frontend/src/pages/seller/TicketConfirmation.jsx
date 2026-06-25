import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Printer, Ticket, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './SellerPages.css';

export default function TicketConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticket;

  if (!ticket) {
    return (
      <div className="confirmation-page">
        <div className="content-card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No ticket data. Please sell a ticket first.</p>
          <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}
            onClick={() => navigate('/seller/sell')}>
            <Ticket size={18} /> Go to Sell
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/tickets/${ticket.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticket.serial}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="seller-page">
      <div className="confirmation-page animate-scale-in">
        <div className="confirmation-card content-card">
          {/* Success icon */}
          <div className="confirmation-success">
            <CheckCircle size={40} />
          </div>

          <h2 style={{ marginBottom: '4px' }}>Ticket Created!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            An email has been sent to {ticket.buyer_email}
          </p>

          {/* QR Code */}
          {ticket.qr_data && (
            <div className="confirmation-qr">
              <img src={ticket.qr_data} alt="Ticket QR Code" />
            </div>
          )}

          {/* Serial */}
          <div className="confirmation-serial">{ticket.serial}</div>

          {/* Details */}
          <div className="confirmation-details">
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Event</span>
              <span className="confirmation-details__value">{ticket.event?.name || '—'}</span>
            </div>
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Ticket Type</span>
              <span className="confirmation-details__value">{ticket.ticket_type?.name || '—'}</span>
            </div>
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Buyer</span>
              <span className="confirmation-details__value">{ticket.buyer_name}</span>
            </div>
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Email</span>
              <span className="confirmation-details__value">{ticket.buyer_email}</span>
            </div>
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Payment</span>
              <span className="confirmation-details__value" style={{ textTransform: 'capitalize' }}>
                {ticket.payment_method}
              </span>
            </div>
            <div className="confirmation-details__row">
              <span className="confirmation-details__label">Amount</span>
              <span className="confirmation-details__value">₹{ticket.ticket_type?.price || 0}</span>
            </div>
          </div>
          {/* Actions */}
          <div className="confirmation-actions no-print">
            <button className="btn btn-secondary" onClick={() => navigate('/seller/sell')}>
              <ArrowLeft size={16} /> Sell Another
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              <Download size={16} /> Download PDF
            </button>
            <button className="btn btn-success" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Print-only template */}
      <div className="print-only-ticket" style={{ display: 'none' }}>
        <div className="ticket">
          <div className="ticket-title">CampusPass</div>
          <div className="ticket-event">{ticket.event?.name}</div>
          <div className="ticket-sub">
            {ticket.event?.venue} • {ticket.event?.start_time ? new Date(ticket.event.start_time).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-row"><span>Name</span><span>{ticket.buyer_name}</span></div>
          <div className="ticket-row"><span>Email</span><span>{ticket.buyer_email}</span></div>
          <div className="ticket-row"><span>Phone</span><span>{ticket.buyer_phone || 'N/A'}</span></div>

          <div className="ticket-divider"></div>

          <div className="ticket-row"><span>Type</span><span>{ticket.ticket_type?.name}</span></div>
          <div className="ticket-row"><span>Amount</span><span>₹{ticket.ticket_type?.price || 0}</span></div>
          <div className="ticket-row"><span>Payment</span><span style={{ textTransform: 'capitalize' }}>{ticket.payment_method}</span></div>

          <div className="ticket-divider"></div>

          <div className="ticket-qr">
            {ticket.qr_data && <img src={ticket.qr_data} width="160" alt="QR" />}
          </div>

          <div className="ticket-serial">{ticket.serial}</div>

          <div className="ticket-footer">
            Valid for one-time entry only
          </div>
        </div>
      </div>
    </div>
  );
}
