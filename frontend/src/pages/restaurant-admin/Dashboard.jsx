import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { HiShoppingBag, HiCash, HiCreditCard, HiXCircle } from 'react-icons/hi';

const PERIODS = [
  { key: 'day', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/stats?period=${period}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [period]);

  const chartData = data?.daily?.map(d => ({
    date: new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    revenue: parseFloat(d.revenue),
    orders: parseInt(d.orders_count),
  })) || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Панель управления</h1>
          <p className="text-white/40 text-sm mt-1">Статистика вашего ресторана</p>
        </motion.div>

        {/* Period selector */}
        <div className="flex gap-2 mb-8">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p.key ? 'btn-accent' : 'btn-glass'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<HiShoppingBag />} label="Заказов" value={data?.stats?.orders_count || 0} delay={0} />
            <StatCard icon={<HiCash />} label="Выручка" value={`${parseFloat(data?.stats?.revenue || 0).toFixed(0)} ₽`} color="violet" delay={0.1} />
            <StatCard icon={<HiCreditCard />} label="Активный долг" value={`${parseFloat(data?.stats?.active_debt || 0).toFixed(0)} ₽`} color="red" delay={0.2} />
            <StatCard icon={<HiXCircle />} label="Отменено" value={data?.stats?.cancelled_count || 0} color="blue" delay={0.3} />
          </div>
        )}

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">График продаж (30 дней)</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/30">Нет данных за период</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,16,50,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }}
                  formatter={(value, name) => [name === 'revenue' ? `${value} ₽` : value, name === 'revenue' ? 'Выручка' : 'Заказы']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ff6b35" fill="url(#revenueGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="orders" stroke="#6c63ff" fill="url(#ordersGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
