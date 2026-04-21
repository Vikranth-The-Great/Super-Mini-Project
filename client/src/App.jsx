import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import IndexPage        from './pages/IndexPage';
import HomePage         from './pages/HomePage';
import AboutProject     from './pages/AboutProject';
import ContactPage      from './pages/ContactPage';
import FindFood         from './pages/FindFood';

// User auth & features
import UserLogin        from './pages/user/UserLogin';
import UserSignup       from './pages/user/UserSignup';
import UserProfile      from './pages/user/UserProfile';
import DonateForm       from './pages/user/DonateForm';
import DeliveryConfirm  from './pages/user/DeliveryConfirm';

// Admin
import AdminLogin       from './pages/admin/AdminLogin';
import AdminSignup      from './pages/admin/AdminSignup';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProfile     from './pages/admin/AdminProfile';
import Analytics        from './pages/admin/Analytics';
import DonatePage       from './pages/admin/DonatePage';
import AdminFeedback    from './pages/admin/AdminFeedback';
import AdminNotifications from './pages/admin/AdminNotifications';

// Delivery
import DeliveryLogin    from './pages/delivery/DeliveryLogin';
import DeliverySignup   from './pages/delivery/DeliverySignup';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import MyOrders         from './pages/delivery/MyOrders';
import OpenMap          from './pages/delivery/OpenMap';
import DeliveryNotifications from './pages/delivery/DeliveryNotifications';
import RealTimeNotificationPanel from './components/RealTimeNotificationPanel';

import { useAuth }      from './context/AuthContext';

function ProtectedUser({ children }) {
  const { userToken } = useAuth();
  return userToken ? children : <Navigate to="/signin" replace />;
}

function ProtectedAdmin({ children }) {
  const { ngoToken } = useAuth();
  return ngoToken ? children : <Navigate to="/ngo/signin" replace />;
}

function ProtectedDelivery({ children }) {
  const { deliveryToken } = useAuth();
  return deliveryToken ? children : <Navigate to="/delivery/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RealTimeNotificationPanel />
      <Routes>
        {/* Public */}
        <Route path="/"           element={<IndexPage />} />
        <Route path="/preview/user-home" element={<HomePage />} />
        <Route path="/home"       element={<ProtectedUser><HomePage /></ProtectedUser>} />
        <Route path="/about"      element={<AboutProject />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/find-food"  element={<FindFood />} />

        {/* User auth */}
        <Route path="/signin"     element={<UserLogin />} />
        <Route path="/signup"     element={<UserSignup />} />

        {/* User protected */}
        <Route path="/profile"    element={<ProtectedUser><UserProfile /></ProtectedUser>} />
        <Route path="/donate"     element={<ProtectedUser><DonateForm /></ProtectedUser>} />
        <Route path="/delivery-confirm" element={<ProtectedUser><DeliveryConfirm /></ProtectedUser>} />

        {/* NGO auth (primary) */}
        <Route path="/ngo/signin"   element={<AdminLogin />} />
        <Route path="/ngo/signup"   element={<AdminSignup />} />

        {/* Admin auth (compatibility aliases) */}
        <Route path="/admin/signin"   element={<Navigate to="/ngo/signin" replace />} />
        <Route path="/admin/signup"   element={<Navigate to="/ngo/signup" replace />} />

        {/* NGO protected (primary) */}
        <Route path="/ngo"              element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/ngo/profile"      element={<ProtectedAdmin><AdminProfile /></ProtectedAdmin>} />
        <Route path="/ngo/analytics"    element={<ProtectedAdmin><Analytics /></ProtectedAdmin>} />
        <Route path="/ngo/donate"       element={<ProtectedAdmin><DonatePage /></ProtectedAdmin>} />
        <Route path="/ngo/feedback"     element={<ProtectedAdmin><AdminFeedback /></ProtectedAdmin>} />
        <Route path="/ngo/notifications" element={<ProtectedAdmin><AdminNotifications /></ProtectedAdmin>} />

        {/* Admin protected (compatibility aliases) */}
        <Route path="/admin"              element={<Navigate to="/ngo" replace />} />
        <Route path="/admin/profile"      element={<Navigate to="/ngo/profile" replace />} />
        <Route path="/admin/analytics"    element={<Navigate to="/ngo/analytics" replace />} />
        <Route path="/admin/donate"       element={<Navigate to="/ngo/donate" replace />} />
        <Route path="/admin/feedback"     element={<Navigate to="/ngo/feedback" replace />} />
        <Route path="/admin/notifications" element={<Navigate to="/ngo/notifications" replace />} />

        {/* Delivery auth */}
        <Route path="/delivery/login"    element={<DeliveryLogin />} />
        <Route path="/delivery/signup"   element={<DeliverySignup />} />

        {/* Delivery protected */}
        <Route path="/delivery"          element={<ProtectedDelivery><DeliveryDashboard /></ProtectedDelivery>} />
        <Route path="/delivery/my-orders" element={<ProtectedDelivery><MyOrders /></ProtectedDelivery>} />
        <Route path="/delivery/map"      element={<ProtectedDelivery><OpenMap /></ProtectedDelivery>} />
        <Route path="/delivery/notifications" element={<ProtectedDelivery><DeliveryNotifications /></ProtectedDelivery>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
