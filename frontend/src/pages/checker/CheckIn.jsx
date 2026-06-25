import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Search, CheckCircle, XCircle, UserCheck, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './CheckerPages.css';

export default function CheckIn() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null); // 'valid', 'invalid', 'checked-in', 'error'
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
          stopScanner();
        },
        () => {} // ignore scan errors
      );
      setScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Camera access denied or not available');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        await html5QrRef.current.stop();
      }
    } catch (err) {
      // Ignore cleanup errors
    }
    setScanning(false);
  };

  const handleScan = async (code) => {
    if (!code) return;
    await validateTicket(code);
  };

  const handleManualValidate = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      validateTicket(manualCode.trim());
    }
  };

  const validateTicket = async (code) => {
    setTicketData(null);
    setValidationStatus(null);

    try {
      const res = await api.get(`/tickets/validate?code=${encodeURIComponent(code)}`);
      const data = res.data;

      if (data.valid) {
        setTicketData(data.ticket);
        if (data.ticket.status === 'checked-in') {
          setValidationStatus('checked-in');
        } else {
          setValidationStatus('valid');
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setValidationStatus('invalid');
      } else {
        setValidationStatus('error');
        toast.error('Validation failed');
      }
    }
  };

  const handleCheckIn = async () => {
    if (!ticketData) return;
    setCheckingIn(true);
    try {
      await api.post('/tickets/checkin', { ticket_id: ticketData.id });
      setValidationStatus('success');
      toast.success(`${ticketData.buyer_name} checked in!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const resetScan = () => {
    setTicketData(null);
    setValidationStatus(null);
    setManualCode('');
  };

  return (
    <div className="checker-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-In</h1>
          <p className="page-subtitle">Scan QR codes or enter ticket serial</p>
        </div>
      </div>

      <div className="checkin-container">
        {/* Scanner */}
        <div className="content-card checkin-scanner-card animate-fade-in-up">
          <div className="scanner-section">
            <div id="qr-reader" className="qr-reader-area" ref={scannerRef}></div>
            {!scanning && (
              <div className="scanner-placeholder" onClick={startScanner}>
                <QrCode size={48} strokeWidth={1.5} />
                <p>Tap to start scanning</p>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            {scanning ? (
              <button className="btn btn-danger" onClick={stopScanner}>Stop Scanner</button>
            ) : (
              <button className="btn btn-primary" onClick={startScanner}>
                <QrCode size={18} /> Start Scanner
              </button>
            )}
          </div>

          {/* Manual entry */}
          <div className="manual-entry">
            <form onSubmit={handleManualValidate} className="manual-entry-form">
              <input
                className="form-input"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter 12-digit serial..."
                maxLength={12}
                style={{ fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}
              />
              <button type="submit" className="btn btn-primary">
                <Search size={18} /> Validate
              </button>
            </form>
          </div>
        </div>

        {/* Result */}
        {validationStatus && (
          <div className={`checkin-result animate-scale-in ${
            validationStatus === 'valid' ? 'checkin-result--valid' :
            validationStatus === 'success' ? 'checkin-result--success' :
            'checkin-result--invalid'
          }`}>
            {/* Valid ticket */}
            {validationStatus === 'valid' && ticketData && (
              <>
                <div className="checkin-result__icon checkin-result__icon--valid">
                  <CheckCircle size={36} />
                </div>
                <h3>Valid Ticket</h3>
                <div className="checkin-result__details">
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Name</span>
                    <span className="checkin-detail-value">{ticketData.buyer_name}</span>
                  </div>
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Type</span>
                    <span className="checkin-detail-value">{ticketData.ticket_type}</span>
                  </div>
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Event</span>
                    <span className="checkin-detail-value">{ticketData.event_name}</span>
                  </div>
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Serial</span>
                    <span className="checkin-detail-value" style={{ fontFamily: 'monospace' }}>{ticketData.serial}</span>
                  </div>
                </div>
                <div className="checkin-result__actions">
                  <button className="btn btn-ghost" onClick={resetScan}>Cancel</button>
                  <button className="btn btn-success btn-lg" onClick={handleCheckIn} disabled={checkingIn}>
                    {checkingIn ? (
                      <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
                    ) : (
                      <><UserCheck size={20} /> Check In</>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Successful check-in */}
            {validationStatus === 'success' && (
              <>
                <div className="checkin-result__icon checkin-result__icon--success" style={{ animation: 'successPulse 1s ease-in-out' }}>
                  <CheckCircle size={48} />
                </div>
                <h3>Checked In!</h3>
                <p style={{ color: 'var(--color-success)' }}>{ticketData?.buyer_name} has been checked in.</p>
                <button className="btn btn-primary" onClick={resetScan} style={{ marginTop: 'var(--spacing-lg)' }}>
                  Scan Next
                </button>
              </>
            )}

            {/* Already checked in */}
            {validationStatus === 'checked-in' && ticketData && (
              <>
                <div className="checkin-result__icon checkin-result__icon--warning">
                  <AlertTriangle size={36} />
                </div>
                <h3>Already Checked In</h3>
                <p>This ticket was already used.</p>
                <div className="checkin-result__details">
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Name</span>
                    <span className="checkin-detail-value">{ticketData.buyer_name}</span>
                  </div>
                  <div className="checkin-detail-row">
                    <span className="checkin-detail-label">Checked In At</span>
                    <span className="checkin-detail-value">
                      {ticketData.checked_in_at ? new Date(ticketData.checked_in_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={resetScan} style={{ marginTop: 'var(--spacing-lg)' }}>
                  Scan Another
                </button>
              </>
            )}

            {/* Invalid */}
            {validationStatus === 'invalid' && (
              <>
                <div className="checkin-result__icon checkin-result__icon--invalid" style={{ animation: 'errorShake 0.5s ease-in-out' }}>
                  <XCircle size={36} />
                </div>
                <h3>Ticket Not Found</h3>
                <p>No ticket matches this code. It may be invalid.</p>
                <button className="btn btn-secondary" onClick={resetScan} style={{ marginTop: 'var(--spacing-lg)' }}>
                  Try Again
                </button>
              </>
            )}

            {/* Error */}
            {validationStatus === 'error' && (
              <>
                <div className="checkin-result__icon checkin-result__icon--invalid">
                  <XCircle size={36} />
                </div>
                <h3>Validation Error</h3>
                <p>Something went wrong. Please try again.</p>
                <button className="btn btn-secondary" onClick={resetScan} style={{ marginTop: 'var(--spacing-lg)' }}>
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
