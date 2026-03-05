import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  HiHome, HiShoppingCart, HiClipboardList, HiCreditCard,
  HiChartBar, HiCollection, HiUsers, HiLogout, HiMenu, HiX,
} from 'react-icons/hi';
import { useState } from 'react';

function NavLink({ to, icon, label, badge }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link to={to}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
        ${active
          ? 'bg-accent/20 text-accent border border-accent/30'
          : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}>
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
        {badge > 0 && (
          <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerLinks = [
    { to: '/', icon: <HiHome />, label: 'Рестораны' },
    { to: '/cart', icon: <HiShoppingCart />, label: 'Корзина', badge: itemCount },
    { to: '/orders', icon: <HiClipboardList />, label: 'Мои заказы' },
    { to: '/debts', icon: <HiCreditCard />, label: 'Мои долги' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <HiChartBar />, label: 'Статистика' },
    { to: '/admin/orders', icon: <HiClipboardList />, label: 'Заказы' },
    { to: '/admin/menu', icon: <HiCollection />, label: 'Меню' },
    { to: '/admin/debts', icon: <HiCreditCard />, label: 'Должники' },
  ];

  const superLinks = [
    { to: '/super', icon: <HiChartBar />, label: 'Статистика' },
    { to: '/super/restaurants', icon: <HiHome />, label: 'Рестораны' },
    { to: '/super/markup', icon: <HiCollection />, label: 'Наценки' },
    { to: '/super/debts', icon: <HiCreditCard />, label: 'Все долги' },
    { to: '/super/users', icon: <HiUsers />, label: 'Пользователи' },
  ];

  const links = user?.role === 'superadmin' ? superLinks
    : user?.role === 'restaurant_admin' ? adminLinks
    : customerLinks;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-violet-DEFAULT flex items-center justify-center text-xl font-bold shadow-lg">
            F
          </div>
          <div>
            <div className="gradient-text font-bold text-lg leading-tight">Foodokon</div>
            <div className="text-white/40 text-xs">
              {user?.role === 'superadmin' ? 'Суперадмин' : user?.role === 'restaurant_admin' ? 'Ресторан' : 'Покупатель'}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(l => <NavLink key={l.to} {...l} />)}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="glass-card p-3 flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-violet-DEFAULT flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.first_name?.[0] || user?.username?.[0] || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.first_name || user?.username || 'Пользователь'}
            </div>
            {user?.username && (
              <div className="text-xs text-white/40 truncate">@{user.username}</div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <HiLogout className="text-lg" /> Выйти
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-white/10"
             style={{ background: 'rgba(15,12,41,0.6)', backdropFilter: 'blur(20px)' }}>
        <Sidebar />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/10 px-4 py-3 flex items-center justify-between"
           style={{ background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)' }}>
        <Link to="/" className="gradient-text font-bold text-lg">Foodokon</Link>
        <div className="flex items-center gap-3">
          {itemCount > 0 && user?.role === 'customer' && (
            <Link to="/cart" className="relative">
              <HiShoppingCart className="text-2xl text-white/70" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/70 text-2xl">
            {mobileOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ x: -300 }} animate={{ x: 0 }}
          className="lg:hidden fixed inset-0 z-40 flex"
        >
          <div className="w-64 flex flex-col border-r border-white/10"
               style={{ background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(20px)' }}>
            <Sidebar />
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:overflow-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
