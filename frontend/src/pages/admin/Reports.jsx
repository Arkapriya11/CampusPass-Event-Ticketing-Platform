import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Ticket, UserCheck, CreditCard, Banknote } from 'lucide-react';
import api from '../../utils/api';
import './AdminPages.css';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/sales')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  const salesByTypeData = data?.salesByType
    ? Object.entries(data.salesByType).map(([name, info]) => ({
        name, count: info.count, revenue: info.revenue,
      }))
    : [];

  const salesByEventData = data?.salesByEvent
    ? Object.entries(data.salesByEvent).map(([name, info]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '…' : name,
        sold: info.sold, checkedIn: info.checkedIn, revenue: info.revenue,
      }))
    : [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Detailed analytics and insights</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary animate-fade-in-up stagger-1">
          <div className="stat-card__icon"><Ticket size={22} /></div>
          <div className="stat-card__value">{data?.totalSold || 0}</div>
          <div className="stat-card__label">Total Tickets</div>
        </div>
        <div className="stat-card stat-card--success animate-fade-in-up stagger-2">
          <div className="stat-card__icon"><UserCheck size={22} /></div>
          <div className="stat-card__value">{data?.totalCheckedIn || 0}</div>
          <div className="stat-card__label">Total Checked In</div>
        </div>
        <div className="stat-card stat-card--warning animate-fade-in-up stagger-3">
          <div className="stat-card__icon"><Banknote size={22} /></div>
          <div className="stat-card__value">₹{(data?.cashRevenue || 0).toLocaleString()}</div>
          <div className="stat-card__label">Cash Revenue</div>
        </div>
        <div className="stat-card stat-card--info animate-fade-in-up stagger-4">
          <div className="stat-card__icon"><CreditCard size={22} /></div>
          <div className="stat-card__value">₹{(data?.onlineRevenue || 0).toLocaleString()}</div>
          <div className="stat-card__label">Online Revenue</div>
        </div>
      </div>

      {/* Total Revenue banner */}
      <div className="content-card animate-fade-in-up stagger-3" style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
        <DollarSign size={32} style={{ color: 'var(--color-success)', marginBottom: '8px' }} />
        <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800 }}>
          ₹{(data?.totalRevenue || 0).toLocaleString()}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total Revenue</div>
      </div>

      <div className="charts-grid">
        {/* Revenue by Event */}
        <div className="content-card animate-fade-in-up stagger-4">
          <h3 className="chart-title">Revenue by Event</h3>
          <div className="chart-container">
            {salesByEventData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesByEventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }} />
                  <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p className="empty-state__text">No data</p></div>
            )}
          </div>
        </div>

        {/* Ticket Type Distribution */}
        <div className="content-card animate-fade-in-up stagger-5">
          <h3 className="chart-title">Ticket Type Distribution</h3>
          <div className="chart-container">
            {salesByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={salesByTypeData} dataKey="revenue" nameKey="name" cx="50%" cy="50%"
                    outerRadius={100} innerRadius={55} paddingAngle={4}>
                    {salesByTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }}
                    formatter={(value) => `₹${value}`} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p className="empty-state__text">No data</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance by Event */}
      {salesByEventData.length > 0 && (
        <div className="content-card animate-fade-in-up stagger-6" style={{ marginTop: 'var(--spacing-xl)' }}>
          <h3 className="chart-title">Attendance vs Sales by Event</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByEventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} />
                <Bar dataKey="sold" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tickets Sold" />
                <Bar dataKey="checkedIn" fill="#10b981" radius={[4, 4, 0, 0]} name="Checked In" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
