import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import LoginBackground from '../components/LoginBackground';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const routes = {
        ADMIN: '/admin/dashboard',
        SELLER: '/seller/sell',
        CHECKER: '/checker/checkin',
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Immersive 3D Background */}
      <Suspense fallback={<div className="login-bg-fallback" />}>
        <LoginBackground />
      </Suspense>

      {/* Glassmorphism card */}
      <div className="login-container animate-scale-in">
        <div className="login-card glass-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo__icon">
              <Ticket size={28} />
            </div>
            <h1 className="login-logo__text">CampusPass</h1>
            <p className="login-logo__subtitle">Event Registration &amp; Ticketing</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error animate-fade-in-down">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input login-input"
                  placeholder="you@campuspass.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type="password"
                  className="form-input login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/" className="login-back-link">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <p>Role-based access: Admin · Seller · Checker</p>
          </div>
        </div>
      </div>
    </div>
  );
}
