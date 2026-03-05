import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import TelegramLogin from '../components/TelegramLogin';
import DevLogin from '../components/DevLogin';
import toast from 'react-hot-toast';

export default function Login() {
  const { user, loginWithTelegram, loginWithDev } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleTelegramAuth = async (data) => {
    try {
      const loggedUser = await loginWithTelegram(data);
      toast.success(`Добро пожаловать, ${loggedUser.first_name || loggedUser.username}!`);
      if (loggedUser.role === 'superadmin') navigate('/super');
      else if (loggedUser.role === 'restaurant_admin') navigate('/admin');
      else navigate('/');
    } catch {
      toast.error('Ошибка авторизации. Попробуйте снова.');
    }
  };

  const handleDevLogin = async (profile) => {
    try {
      const loggedUser = await loginWithDev(profile);
      toast.success(`Добро пожаловать, ${loggedUser.first_name || loggedUser.username}!`);
      if (loggedUser.role === 'superadmin') navigate('/super');
      else if (loggedUser.role === 'restaurant_admin') navigate('/admin');
      else navigate('/');
    } catch {
      toast.error('Ошибка входа. Включите ALLOW_DEV_LOGIN в backend/.env');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-accent top-0 -left-20" />
      <div className="orb w-80 h-80 bg-violet-DEFAULT bottom-0 -right-20" />
      <div className="orb w-64 h-64 bg-blue-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card p-10 w-full max-w-md mx-4 relative z-10"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(255,107,53,0.1)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-4"
          >
            🍕
          </motion.div>
          <h1 className="text-4xl font-black gradient-text mb-2">Foodokon</h1>
          <p className="text-white/50 text-sm">Платформа для заказа еды</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { emoji: '🍽️', text: 'Рестораны' },
            { emoji: '⚡', text: 'Быстро' },
            { emoji: '💳', text: 'В долг' },
          ].map(f => (
            <div key={f.text} className="glass-card p-3 text-center">
              <div className="text-2xl mb-1">{f.emoji}</div>
              <div className="text-white/60 text-xs">{f.text}</div>
            </div>
          ))}
        </div>

        {/* Auth */}
        <div className="space-y-4">
          <p className="text-center text-white/60 text-sm">Войдите через Telegram</p>
          <TelegramLogin onAuth={handleTelegramAuth} />

          {(typeof window !== 'undefined' && window.location.hostname === 'localhost') || import.meta.env.VITE_DEV_LOGIN === 'true' ? (
            <div className="pt-4 border-t border-white/10">
              <p className="text-center text-white/50 text-xs mb-2">Или для разработки (localhost)</p>
              <DevLogin onLogin={handleDevLogin} />
            </div>
          ) : null}

          <p className="text-center text-white/30 text-xs">
            Авторизуясь, вы соглашаетесь с условиями использования
          </p>
        </div>
      </motion.div>
    </div>
  );
}
