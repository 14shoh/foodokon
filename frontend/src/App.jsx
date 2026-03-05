import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Home from './pages/customer/Home';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import Cart from './pages/customer/Cart';
import OrderHistory from './pages/customer/OrderHistory';
import MyDebts from './pages/customer/MyDebts';

import AdminDashboard from './pages/restaurant-admin/Dashboard';
import OrdersPanel from './pages/restaurant-admin/OrdersPanel';
import MenuManager from './pages/restaurant-admin/MenuManager';
import AdminDebtsList from './pages/restaurant-admin/DebtsList';

import SuperDashboard from './pages/superadmin/Dashboard';
import SuperRestaurants from './pages/superadmin/Restaurants';
import MarkupManager from './pages/superadmin/MarkupManager';
import AllDebts from './pages/superadmin/AllDebts';
import Users from './pages/superadmin/Users';

// Route guards
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (Array.isArray(role) ? !role.includes(user.role) : user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Customer routes */}
      <Route path="/" element={<RequireAuth><Layout><Home /></Layout></RequireAuth>} />
      <Route path="/restaurant/:id" element={<RequireAuth><Layout><RestaurantMenu /></Layout></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth><Layout><Cart /></Layout></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><Layout><OrderHistory /></Layout></RequireAuth>} />
      <Route path="/debts" element={<RequireAuth><Layout><MyDebts /></Layout></RequireAuth>} />

      {/* Restaurant admin routes */}
      <Route path="/admin" element={
        <RequireRole role={['restaurant_admin', 'superadmin']}>
          <Layout><AdminDashboard /></Layout>
        </RequireRole>
      } />
      <Route path="/admin/orders" element={
        <RequireRole role={['restaurant_admin', 'superadmin']}>
          <Layout><OrdersPanel /></Layout>
        </RequireRole>
      } />
      <Route path="/admin/menu" element={
        <RequireRole role={['restaurant_admin', 'superadmin']}>
          <Layout><MenuManager /></Layout>
        </RequireRole>
      } />
      <Route path="/admin/debts" element={
        <RequireRole role={['restaurant_admin', 'superadmin']}>
          <Layout><AdminDebtsList /></Layout>
        </RequireRole>
      } />

      {/* Superadmin routes */}
      <Route path="/super" element={
        <RequireRole role="superadmin"><Layout><SuperDashboard /></Layout></RequireRole>
      } />
      <Route path="/super/restaurants" element={
        <RequireRole role="superadmin"><Layout><SuperRestaurants /></Layout></RequireRole>
      } />
      <Route path="/super/markup" element={
        <RequireRole role="superadmin"><Layout><MarkupManager /></Layout></RequireRole>
      } />
      <Route path="/super/debts" element={
        <RequireRole role="superadmin"><Layout><AllDebts /></Layout></RequireRole>
      } />
      <Route path="/super/users" element={
        <RequireRole role="superadmin"><Layout><Users /></Layout></RequireRole>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
