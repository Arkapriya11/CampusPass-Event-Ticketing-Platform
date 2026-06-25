import { useState, useEffect } from 'react';
import { Ticket, Users, DollarSign, UserCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import './AdminPages.css';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports/sales');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div></div>;
  }

  const salesByTypeData = data?.salesByType
    ? Object.entries(data.salesByType).map(([name, info]) => ({
        name,
        count: info.count,
        revenue: info.revenue,
      }))
    : [];

  const salesByEventData = data?.salesByEvent
    ? Object.entries(data.salesByEvent).map(([name, info]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '…' : name,
        sold: info.sold,
        checkedIn: info.checkedIn,
      }))
    : [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your events and ticket sales</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary animate-fade-in-up stagger-1">
          <div className="stat-card__icon"><Ticket size={22} /></div>
          <div className="stat-card__value">{data?.totalSold || 0}</div>
          <div className="stat-card__label">Tickets Sold</div>
        </div>
        <div className="stat-card stat-card--success animate-fade-in-up stagger-2">
          <div className="stat-card__icon"><UserCheck size={22} /></div>
          <div className="stat-card__value">{data?.totalCheckedIn || 0}</div>
          <div className="stat-card__label">Checked In</div>
        </div>
        <div className="stat-card stat-card--warning animate-fade-in-up stagger-3">
          <div className="stat-card__icon"><DollarSign size={22} /></div>
          <div className="stat-card__value">₹{(data?.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-card__label">Total Revenue</div>
        </div>
        <div className="stat-card stat-card--info animate-fade-in-up stagger-4">
          <div className="stat-card__icon"><TrendingUp size={22} /></div>
          <div className="stat-card__value">₹{(data?.onlineRevenue || 0).toLocaleString()}</div>
          <div className="stat-card__label">Online Revenue</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="content-card animate-fade-in-up stagger-3">
          <h3 className="chart-title">Sales Over Time (Last 7 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.salesOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f35',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card animate-fade-in-up stagger-4">
          <h3 className="chart-title">Sales by Ticket Type</h3>
          <div className="chart-container">
            {salesByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={salesByTypeData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={4}
                    label={({ name, count }) => `${name} (${count})`}
                  >
                    {salesByTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1f35',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-state__text">No ticket data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events breakdown */}
      {salesByEventData.length > 0 && (
        <div className="content-card animate-fade-in-up stagger-5" style={{ marginTop: 'var(--spacing-xl)' }}>
          <h3 className="chart-title">Tickets by Event</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesByEventData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f35',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="sold" fill="#6366f1" radius={[0, 4, 4, 0]} name="Sold" />
                <Bar dataKey="checkedIn" fill="#10b981" radius={[0, 4, 4, 0]} name="Checked In" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
