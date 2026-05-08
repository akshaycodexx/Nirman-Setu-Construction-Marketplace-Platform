import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { SupplierProvider, useSupplier } from './context/SupplierContext';
import { CustomerProvider, useCustomer } from './context/CustomerContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';

// Public pages
import Home from './pages/Home';
import RequestOrder from './pages/RequestOrder';
import TrackOrder from './pages/TrackOrder';
import Receipt from './pages/Receipt';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

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
import SupplierRegister from './pages/supplier/SupplierRegister';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierOrderDetail from './pages/supplier/SupplierOrderDetail';
import SupplierProfile from './pages/supplier/SupplierProfile';
import SupplierEarnings from './pages/supplier/SupplierEarnings';
import SupplierQuoteRequests from './pages/supplier/SupplierQuoteRequests';
import SupplierLabourRequests from './pages/supplier/SupplierLabourRequests';
import SupplierStock from './pages/supplier/SupplierStock';

// Customer pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerQuotes from './pages/customer/CustomerQuotes';
import CustomerEstimator from './pages/customer/CustomerEstimator';
import CustomerLabour from './pages/customer/CustomerLabour';
import CustomerProjects from './pages/customer/CustomerProjects';
import CustomerProjectDetail from './pages/customer/CustomerProjectDetail';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminLabour from './pages/admin/AdminLabour';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminRates from './pages/admin/AdminRates';
import AdminStock from './pages/admin/AdminStock';
import Invoice from './pages/Invoice';
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
    <LanguageProvider>
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
            <Route path="/invoice/:orderId" element={<Invoice />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

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
            <Route path="/admin/quotes" element={<AdminGuard><AdminQuotes /></AdminGuard>} />
            <Route path="/admin/labour" element={<AdminGuard><AdminLabour /></AdminGuard>} />
            <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
            <Route path="/admin/rates" element={<AdminGuard><AdminRates /></AdminGuard>} />
            <Route path="/admin/stock" element={<AdminGuard><AdminStock /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Supplier */}
            <Route path="/supplier/login" element={<PublicSupplierGuard><SupplierLogin /></PublicSupplierGuard>} />
            <Route path="/supplier/register" element={<SupplierRegister />} />
            <Route path="/supplier/dashboard" element={<SupplierGuard><SupplierDashboard /></SupplierGuard>} />
            <Route path="/supplier/orders" element={<SupplierGuard><SupplierOrders /></SupplierGuard>} />
            <Route path="/supplier/orders/:orderId" element={<SupplierGuard><SupplierOrderDetail /></SupplierGuard>} />
            <Route path="/supplier/profile" element={<SupplierGuard><SupplierProfile /></SupplierGuard>} />
            <Route path="/supplier/earnings" element={<SupplierGuard><SupplierEarnings /></SupplierGuard>} />
            <Route path="/supplier/quotes" element={<SupplierGuard><SupplierQuoteRequests /></SupplierGuard>} />
            <Route path="/supplier/labour" element={<SupplierGuard><SupplierLabourRequests /></SupplierGuard>} />
            <Route path="/supplier/stock" element={<SupplierGuard><SupplierStock /></SupplierGuard>} />
            <Route path="/supplier" element={<Navigate to="/supplier/dashboard" replace />} />

            {/* Customer */}
            <Route path="/customer/login" element={<PublicCustomerGuard><CustomerLogin /></PublicCustomerGuard>} />
            <Route path="/customer/register" element={<PublicCustomerGuard><CustomerRegister /></PublicCustomerGuard>} />
            <Route path="/customer/dashboard" element={<CustomerGuard><CustomerDashboard /></CustomerGuard>} />
            <Route path="/customer/orders" element={<CustomerGuard><CustomerOrders /></CustomerGuard>} />
            <Route path="/customer/orders/:orderId" element={<CustomerGuard><CustomerOrderDetail /></CustomerGuard>} />
            <Route path="/customer/notifications" element={<CustomerGuard><CustomerNotifications /></CustomerGuard>} />
            <Route path="/customer/profile" element={<CustomerGuard><CustomerProfile /></CustomerGuard>} />
            <Route path="/customer/quotes" element={<CustomerGuard><CustomerQuotes /></CustomerGuard>} />
            <Route path="/customer/labour" element={<CustomerGuard><CustomerLabour /></CustomerGuard>} />
            <Route path="/customer/estimator" element={<CustomerGuard><CustomerEstimator /></CustomerGuard>} />
            <Route path="/customer/projects" element={<CustomerGuard><CustomerProjects /></CustomerGuard>} />
            <Route path="/customer/projects/:projectId" element={<CustomerGuard><CustomerProjectDetail /></CustomerGuard>} />
            <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CustomerProvider>
      </SupplierProvider>
    </AdminProvider>
    </SocketProvider>
    </LanguageProvider>
  );
}
