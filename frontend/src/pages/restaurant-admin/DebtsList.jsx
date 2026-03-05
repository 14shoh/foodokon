import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiCheck, HiUser, HiPhone } from 'react-icons/hi';

export default function AdminDebtsList() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/debts').then(r => setDebts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id) => {
    try {
      await api.patch(`/admin/debts/${id}/paid`);
      toast.success('Долг отмечен как оплаченный');
      setDebts(prev => prev.map(d => d.id === id ? { ...d, debt_paid: true } : d));
    } catch { toast.error('Ошибка'); }
  };

  const activeDebts = debts.filter(d => !d.debt_paid);
  const paidDebts = debts.filter(d => d.debt_paid);
  const totalActive = activeDebts.reduce((s, d) => s + parseFloat(d.total_amount), 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Должники</h1>
          <p className="text-white/40 text-sm mt-1">Заказы, оформленные в долг</p>
        </motion.div>

        {/* Summary */}
        {activeDebts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card p-5 mb-6 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300/60 text-sm">Общий активный долг</p>
                <p className="text-3xl font-black text-red-300">{totalActive.toFixed(0)} ₽</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-sm">Должников</p>
                <p className="text-2xl font-bold text-white">{activeDebts.length}</p>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white/40 text-lg">Нет должников</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active */}
            {activeDebts.length > 0 && (
              <div>
                <h2 className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">Активные долги</h2>
                {activeDebts.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="glass-card p-5 mb-3 border border-red-500/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <HiUser className="text-accent" />
                          <span className="font-bold text-white">
                            {d.first_name || ''} {d.last_name || ''}
                          </span>
                          {d.username && <span className="text-white/40 text-sm">@{d.username}</span>}
                        </div>
                        {d.phone && (
                          <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                            <HiPhone /> {d.phone}
                          </div>
                        )}
                        <div className="text-white/30 text-xs">
                          TG ID: {d.telegram_id} · {new Date(d.created_at).toLocaleDateString('ru-RU')}
                        </div>
                        {d.notes && <p className="text-white/30 text-xs mt-1">💬 {d.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-red-300 font-black text-2xl">{parseFloat(d.total_amount).toFixed(0)} ₽</p>
                        <button
                          onClick={() => markPaid(d.id)}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors text-sm font-semibold"
                        >
                          <HiCheck /> Оплачен
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Paid */}
            {paidDebts.length > 0 && (
              <div>
                <h2 className="text-white/40 text-sm font-semibold mb-3 mt-6 uppercase tracking-wider">Погашенные</h2>
                {paidDebts.map(d => (
                  <div key={d.id} className="glass-card p-4 mb-2 opacity-50 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">{d.first_name} {d.last_name}</span>
                      {d.username && <span className="text-white/40 text-sm ml-2">@{d.username}</span>}
                      <p className="text-white/30 text-xs">{new Date(d.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{parseFloat(d.total_amount).toFixed(0)} ₽</p>
                      <p className="text-green-500/60 text-xs">✓ Оплачен</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
