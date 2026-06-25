import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Ticket,
  ClipboardList, QrCode, History, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import './DashboardLayout.css';

const menuItems = {
  ADMIN: [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ],
  SELLER: [
    { path: '/seller/sell', icon: Ticket, label: 'Sell Ticket' },
    { path: '/seller/history', icon: ClipboardList, label: 'Sales History' },
  ],
  CHECKER: [
    { path: '/checker/checkin', icon: QrCode, label: 'Check-In' },
    { path: '/checker/history', icon: History, label: 'History' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeClass = {
    ADMIN: 'badge-admin',
    SELLER: 'badge-seller',
    CHECKER: 'badge-checker',
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar--collapsed'} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <Ticket size={20} />
            </div>
            {sidebarOpen && <span className="sidebar__logo-text">CampusPass</span>}
          </div>
          <button
            className="sidebar__toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft size={18} className={`sidebar__toggle-icon ${!sidebarOpen ? 'rotated' : ''}`} />
          </button>
          <button className="sidebar__close mobile-only" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              title={item.label}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user?.name}</span>
                <span className={`badge ${roleBadgeClass[user?.role] || ''}`}>{user?.role}</span>
              </div>
            )}
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`dashboard-main ${sidebarOpen ? '' : 'dashboard-main--expanded'}`}>
        <header className="dashboard-topbar no-print">
          <button className="mobile-menu-btn mobile-only" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-spacer" />
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
