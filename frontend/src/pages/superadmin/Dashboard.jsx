import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { HiShoppingBag, HiCash, HiCreditCard, HiOfficeBuilding } from 'react-icons/hi';

const PERIODS = [
  { key: 'day', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

export default function SuperDashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/superadmin/stats?period=${period}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [period]);

  const chartData = data?.per_restaurant?.map(r => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name,
    revenue: parseFloat(r.revenue),
    orders: parseInt(r.orders_count),
    debt: parseFloat(r.active_debt),
  })) || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Общая статистика</h1>
          <p className="text-white/40 text-sm mt-1">Все рестораны платформы</p>
        </motion.div>

        {/* Period selector */}
        <div className="flex gap-2 mb-8">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${period === p.key ? 'btn-accent' : 'btn-glass'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Global stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<HiShoppingBag />} label="Всего заказов" value={data?.global?.orders_count || 0} delay={0} />
            <StatCard icon={<HiCash />} label="Общая выручка" value={`${parseFloat(data?.global?.revenue || 0).toFixed(0)} ₽`} color="violet" delay={0.1} />
            <StatCard icon={<HiCreditCard />} label="Общий долг" value={`${parseFloat(data?.global?.active_debt || 0).toFixed(0)} ₽`} color="red" delay={0.2} />
            <StatCard icon={<HiOfficeBuilding />} label="Рестораны" value={data?.global?.active_restaurants || 0} color="green" delay={0.3} />
          </div>
        )}

        {/* Per-restaurant chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="glass-card p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Выручка по ресторанам</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,16,50,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }}
                  formatter={(value, name) => [name === 'revenue' ? `${value} ₽` : value, name === 'revenue' ? 'Выручка' : name === 'orders' ? 'Заказы' : 'Долг']}
                />
                <Bar dataKey="revenue" fill="#ff6b35" radius={[6,6,0,0]} />
                <Bar dataKey="debt" fill="#ef4444" radius={[6,6,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Per-restaurant table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="font-bold text-white">Детали по ресторанам</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-white/40 text-sm font-medium">Ресторан</th>
                  <th className="text-right p-4 text-white/40 text-sm font-medium">Заказов</th>
                  <th className="text-right p-4 text-white/40 text-sm font-medium">Выручка</th>
                  <th className="text-right p-4 text-white/40 text-sm font-medium">Долг</th>
                </tr>
              </thead>
              <tbody>
                {data?.per_restaurant?.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 text-white font-medium">{r.name}</td>
                    <td className="p-4 text-right text-white/70">{r.orders_count}</td>
                    <td className="p-4 text-right text-accent font-semibold">{parseFloat(r.revenue).toFixed(0)} ₽</td>
                    <td className="p-4 text-right">
                      <span className={parseFloat(r.active_debt) > 0 ? 'text-red-400 font-semibold' : 'text-white/30'}>
                        {parseFloat(r.active_debt).toFixed(0)} ₽
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
