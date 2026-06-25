import { useState, useEffect, useRef } from 'react';
import { Ticket, CreditCard, Banknote, Send, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './SellerPages.css';

export default function SellTicket() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data.events)).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEventChange = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    setSelectedEvent(event);
    setSelectedType(null);
  };

  const resetForm = () => {
    setBuyer({ name: '', email: '', phone: '' });
    setSelectedType(null);
    setPaymentMethod('cash');
  };

  const handleCashSale = async () => {
    setLoading(true);
    try {
      const res = await api.post('/tickets/sell', {
        event_id: selectedEvent.id,
        type_id: selectedType.id,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone,
        payment_method: 'cash',
      });

      toast.success('Ticket created successfully!');
      navigate('/seller/confirmation', {
        state: { ticket: res.data.ticket },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpaySale = async () => {
    setLoading(true);
    try {
      // Step 1: Create order
      const res = await api.post('/tickets/sell', {
        event_id: selectedEvent.id,
        type_id: selectedType.id,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone,
        payment_method: 'razorpay',
      });

      const { order_id, amount, currency, key_id } = res.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'CampusPass',
        description: `${selectedType.name} — ${selectedEvent.name}`,
        order_id: order_id,
        handler: async function (response) {
          // Step 3: Confirm payment
          try {
            const confirmRes = await api.post('/tickets/sell/confirm', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              event_id: selectedEvent.id,
              type_id: selectedType.id,
              buyer_name: buyer.name,
              buyer_email: buyer.email,
              buyer_phone: buyer.phone,
            });

            toast.success('Payment verified! Ticket created.');
            navigate('/seller/confirmation', {
              state: { ticket: confirmRes.data.ticket },
            });
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: buyer.name,
          email: buyer.email,
          contact: buyer.phone,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedType) {
      toast.error('Please select an event and ticket type');
      return;
    }
    if (paymentMethod === 'cash') {
      handleCashSale();
    } else {
      handleRazorpaySale();
    }
  };

  return (
    <div className="seller-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sell Ticket</h1>
          <p className="page-subtitle">Create a ticket for an attendee</p>
        </div>
      </div>

      <div className="sell-form-container">
        <form onSubmit={handleSubmit} className="sell-form content-card animate-fade-in-up">
          {/* Event Selection */}
          <div className="sell-section">
            <h3 className="sell-section__title">
              <Ticket size={18} /> Event & Ticket Type
            </h3>
            <div className="form-group">
              <label className="form-label">Select Event</label>
              <div className="custom-select-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  id="event-select"
                  className={`custom-select-trigger ${dropdownOpen ? 'custom-select-trigger--open' : ''}`}
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <span className={selectedEvent ? '' : 'custom-select-placeholder'}>
                    {selectedEvent ? `${selectedEvent.name} — ${selectedEvent.venue}` : 'Choose an event...'}
                  </span>
                  <ChevronDown size={16} className={`custom-select-chevron ${dropdownOpen ? 'custom-select-chevron--open' : ''}`} />
                </button>
                {dropdownOpen && (
                  <ul className="custom-select-menu" role="listbox">
                    {events.length === 0 ? (
                      <li className="custom-select-empty">No events available</li>
                    ) : (
                      events.map((ev) => (
                        <li
                          key={ev.id}
                          role="option"
                          aria-selected={selectedEvent?.id === ev.id}
                          className={`custom-select-option ${selectedEvent?.id === ev.id ? 'custom-select-option--selected' : ''}`}
                          onClick={() => { handleEventChange(ev.id); setDropdownOpen(false); }}
                        >
                          <span className="custom-select-option-name">{ev.name}</span>
                          <span className="custom-select-option-venue">{ev.venue}</span>
                          {selectedEvent?.id === ev.id && <Check size={14} className="custom-select-option-check" />}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>

            {selectedEvent && (
              <div className="ticket-type-cards animate-fade-in">
                {selectedEvent.ticket_types?.map((tt) => (
                  <button
                    key={tt.id}
                    type="button"
                    className={`ticket-type-card ${selectedType?.id === tt.id ? 'ticket-type-card--selected' : ''}`}
                    onClick={() => setSelectedType(tt)}
                  >
                    <span className="ticket-type-card__name">{tt.name}</span>
                    <span className="ticket-type-card__price">₹{tt.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buyer Info */}
          <div className="sell-section">
            <h3 className="sell-section__title">👤 Buyer Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  placeholder="Attendee name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={buyer.email}
                  onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                  placeholder="attendee@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" value={buyer.phone}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  placeholder="Phone number" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="sell-section">
            <h3 className="sell-section__title">💳 Payment</h3>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method-card ${paymentMethod === 'cash' ? 'payment-method-card--selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={24} />
                <span>Cash</span>
              </button>
              <button
                type="button"
                className={`payment-method-card ${paymentMethod === 'razorpay' ? 'payment-method-card--selected' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <CreditCard size={24} />
                <span>Razorpay</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          {selectedType && (
            <div className="sell-summary animate-fade-in">
              <div className="sell-summary__row">
                <span>Event</span><span>{selectedEvent.name}</span>
              </div>
              <div className="sell-summary__row">
                <span>Ticket Type</span><span>{selectedType.name}</span>
              </div>
              <div className="sell-summary__row sell-summary__total">
                <span>Total Amount</span><span>₹{selectedType.price}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="sell-actions">
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              <RotateCcw size={16} /> Clear
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !selectedType}>
              {loading ? (
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
              ) : (
                <>
                  <Send size={18} />
                  {paymentMethod === 'cash' ? 'Issue Ticket' : 'Pay & Issue'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
