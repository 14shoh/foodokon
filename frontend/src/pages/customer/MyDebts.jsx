import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function MyDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my/debts').then(r => setDebts(r.data)).finally(() => setLoading(false));
  }, []);

  const activeDebts = debts.filter(d => !d.debt_paid);
  const paidDebts = debts.filter(d => d.debt_paid);
  const totalActive = activeDebts.reduce((s, d) => s + parseFloat(d.total_amount), 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Мои долги</h1>
          <p className="text-white/40 text-sm mt-1">Заказы, оформленные в кредит</p>
        </motion.div>

        {/* Summary */}
        {activeDebts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 mb-6 border border-red-500/30"
            style={{ background: 'rgba(239,68,68,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300/70 text-sm">Текущий долг</p>
                <p className="text-3xl font-black text-red-300">{totalActive.toFixed(0)} ₽</p>
              </div>
              <div className="text-5xl">💳</div>
            </div>
            <p className="text-red-300/50 text-xs mt-3">
              {activeDebts.length} незакрытых задолженности
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse" />)}
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white/40 text-lg">Долгов нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active debts */}
            {activeDebts.length > 0 && (
              <div>
                <h2 className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">Активные</h2>
                <div className="space-y-3">
                  {activeDebts.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 border border-red-500/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{d.restaurant_name}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(d.created_at).toLocaleDateString('ru-RU')}
                          </p>
                          {d.notes && <p className="text-white/30 text-xs mt-1">💬 {d.notes}</p>}
                        </div>
                        <div>
                          <p className="text-red-300 font-black text-xl">{parseFloat(d.total_amount).toFixed(0)} ₽</p>
                          <p className="text-red-400/60 text-xs text-right">Не оплачен</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid debts */}
            {paidDebts.length > 0 && (
              <div>
                <h2 className="text-white/40 text-sm font-semibold mb-3 mt-6 uppercase tracking-wider">Погашенные</h2>
                <div className="space-y-2">
                  {paidDebts.map((d, i) => (
                    <div key={d.id} className="glass-card p-4 opacity-60">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{d.restaurant_name}</p>
                          <p className="text-white/30 text-xs">{new Date(d.created_at).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{parseFloat(d.total_amount).toFixed(0)} ₽</p>
                          <p className="text-green-500/60 text-xs">✓ Оплачен</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
