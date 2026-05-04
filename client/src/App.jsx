import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { SupplierProvider, useSupplier } from './context/SupplierContext';
import { CustomerProvider, useCustomer } from './context/CustomerContext';
import { SocketProvider } from './context/SocketContext';

// Public pages
import Home from './pages/Home';
import RequestOrder from './pages/RequestOrder';
import TrackOrder from './pages/TrackOrder';
import Receipt from './pages/Receipt';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminFees from './pages/admin/AdminFees';

// Supplier pages
import SupplierLogin from './pages/supplier/SupplierLogin';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierOrderDetail from './pages/supplier/SupplierOrderDetail';
import SupplierProfile from './pages/supplier/SupplierProfile';

// Customer pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail';
import CustomerProfile from './pages/customer/CustomerProfile';
import NotFound from './pages/NotFound';

function AdminGuard({ children }) {
  const { admin, loading } = useAdmin();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicAdminGuard({ children }) {
  const { admin, loading } = useAdmin();
  if (loading) return null;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function SupplierGuard({ children }) {
  const { supplier, loading } = useSupplier();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!supplier) return <Navigate to="/supplier/login" replace />;
  return children;
}

function PublicSupplierGuard({ children }) {
  const { supplier, loading } = useSupplier();
  if (loading) return null;
  if (supplier) return <Navigate to="/supplier/dashboard" replace />;
  return children;
}

function CustomerGuard({ children }) {
  const { customer, loading } = useCustomer();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!customer) return <Navigate to="/customer/login" replace />;
  return children;
}

function PublicCustomerGuard({ children }) {
  const { customer, loading } = useCustomer();
  if (loading) return null;
  if (customer) return <Navigate to="/customer/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <SocketProvider>
    <AdminProvider>
      <SupplierProvider>
        <CustomerProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<RequestOrder />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/track/:orderId" element={<TrackOrder />} />
            <Route path="/receipt/:orderId" element={<Receipt />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Admin */}
            <Route path="/admin/login" element={<PublicAdminGuard><AdminLogin /></PublicAdminGuard>} />
            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
            <Route path="/admin/orders/:orderId" element={<AdminGuard><AdminOrderDetail /></AdminGuard>} />
            <Route path="/admin/suppliers" element={<AdminGuard><AdminSuppliers /></AdminGuard>} />
            <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
            <Route path="/admin/payouts" element={<AdminGuard><AdminPayouts /></AdminGuard>} />
            <Route path="/admin/complaints" element={<AdminGuard><AdminComplaints /></AdminGuard>} />
            <Route path="/admin/customers" element={<AdminGuard><AdminCustomers /></AdminGuard>} />
            <Route path="/admin/fees" element={<AdminGuard><AdminFees /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Supplier */}
            <Route path="/supplier/login" element={<PublicSupplierGuard><SupplierLogin /></PublicSupplierGuard>} />
            <Route path="/supplier/dashboard" element={<SupplierGuard><SupplierDashboard /></SupplierGuard>} />
            <Route path="/supplier/orders" element={<SupplierGuard><SupplierOrders /></SupplierGuard>} />
            <Route path="/supplier/orders/:orderId" element={<SupplierGuard><SupplierOrderDetail /></SupplierGuard>} />
            <Route path="/supplier/profile" element={<SupplierGuard><SupplierProfile /></SupplierGuard>} />
            <Route path="/supplier" element={<Navigate to="/supplier/dashboard" replace />} />

            {/* Customer */}
            <Route path="/customer/login" element={<PublicCustomerGuard><CustomerLogin /></PublicCustomerGuard>} />
            <Route path="/customer/register" element={<PublicCustomerGuard><CustomerRegister /></PublicCustomerGuard>} />
            <Route path="/customer/dashboard" element={<CustomerGuard><CustomerDashboard /></CustomerGuard>} />
            <Route path="/customer/orders" element={<CustomerGuard><CustomerOrders /></CustomerGuard>} />
            <Route path="/customer/orders/:orderId" element={<CustomerGuard><CustomerOrderDetail /></CustomerGuard>} />
            <Route path="/customer/profile" element={<CustomerGuard><CustomerProfile /></CustomerGuard>} />
            <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CustomerProvider>
      </SupplierProvider>
    </AdminProvider>
    </SocketProvider>
  );
}
