import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { HiCreditCard, HiSearch } from 'react-icons/hi';

export default function AllDebts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPaid, setShowPaid] = useState(false);

  useEffect(() => {
    api.get('/superadmin/debts').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const debts = data?.debts || [];
  const filtered = debts.filter(d => {
    const matchPaid = showPaid || !d.debt_paid;
    const matchSearch = !search ||
      `${d.first_name} ${d.last_name} ${d.username} ${d.phone} ${d.telegram_id}`.toLowerCase().includes(search.toLowerCase());
    return matchPaid && matchSearch;
  });

  const activeCount = debts.filter(d => !d.debt_paid).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Все должники</h1>
          <p className="text-white/40 text-sm mt-1">Все долги по всем ресторанам</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={<HiCreditCard />} label="Общий активный долг"
                    value={`${parseFloat(data?.total_active_debt || 0).toFixed(0)} ₽`} color="red" delay={0} />
          <StatCard icon={<HiCreditCard />} label="Активных долгов"
                    value={activeCount} color="violet" delay={0.1} />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
                   className="input-glass pl-10" placeholder="Поиск по имени, username, телефону..." />
          </div>
          <button onClick={() => setShowPaid(!showPaid)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showPaid ? 'btn-accent' : 'btn-glass'}`}>
            {showPaid ? 'Все' : 'Только активные'}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white/40 text-lg">Нет должников</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`glass-card p-5 ${d.debt_paid ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-white">
                        {d.first_name || ''} {d.last_name || ''}
                      </span>
                      {d.username && (
                        <a href={`https://t.me/${d.username}`} target="_blank" rel="noreferrer"
                           className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                          @{d.username}
                        </a>
                      )}
                      {d.debt_paid ? (
                        <span className="status-badge bg-green-500/20 text-green-300 border border-green-500/30">✓ Оплачен</span>
                      ) : (
                        <span className="status-badge bg-red-500/20 text-red-300 border border-red-500/30">Долг</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/40">
                      {d.phone && <span>📞 {d.phone}</span>}
                      <span>Telegram ID: {d.telegram_id}</span>
                      <span className="text-accent/70">🍽️ {d.restaurant_name}</span>
                      <span>{new Date(d.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {d.notes && <p className="text-white/30 text-xs mt-1">💬 {d.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-2xl ${d.debt_paid ? 'text-green-400' : 'text-red-300'}`}>
                      {parseFloat(d.total_amount).toFixed(0)} ₽
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
