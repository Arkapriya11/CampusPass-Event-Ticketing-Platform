import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Events';
import UsersPage from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import SellTicket from './pages/seller/SellTicket';
import TicketConfirmation from './pages/seller/TicketConfirmation';
import SalesHistory from './pages/seller/SalesHistory';
import CheckIn from './pages/checker/CheckIn';
import CheckInHistory from './pages/checker/CheckInHistory';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1f35',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Seller routes */}
          <Route
            element={
              <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/seller/sell" element={<SellTicket />} />
            <Route path="/seller/confirmation" element={<TicketConfirmation />} />
            <Route path="/seller/history" element={<SalesHistory />} />
          </Route>

          {/* Checker routes */}
          <Route
            element={
              <ProtectedRoute roles={['CHECKER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/checker/checkin" element={<CheckIn />} />
            <Route path="/checker/history" element={<CheckInHistory />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
