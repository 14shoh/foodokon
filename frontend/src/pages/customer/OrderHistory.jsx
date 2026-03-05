import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { HiRefresh } from 'react-icons/hi';

function OrderCard({ order, index }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card overflow-hidden"
    >
      <div
        className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/40 text-sm">#{order.id}</span>
              <StatusBadge status={order.status} />
              {order.is_debt && (
                <span className={`status-badge ${order.debt_paid ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                  {order.debt_paid ? '✓ Долг погашен' : '! В долг'}
                </span>
              )}
            </div>
            <p className="font-semibold text-white">{order.restaurant_name}</p>
            <p className="text-white/40 text-xs mt-1">{date}</p>
          </div>
          <div className="text-accent font-black text-xl flex-shrink-0">
            {parseFloat(order.total_amount).toFixed(0)} ₽
          </div>
        </div>

        {order.delivery_address && (
          <p className="text-white/30 text-xs mt-2 truncate">📍 {order.delivery_address}</p>
        )}
      </div>

      {expanded && order.items && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/10 p-5 space-y-2"
        >
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-white/70">{item.item_name} × {item.quantity}</span>
              <span className="text-white/50">{(item.price_at_time * item.quantity).toFixed(0)} ₽</span>
            </div>
          ))}
          {order.notes && (
            <p className="text-white/30 text-xs pt-2 border-t border-white/10">
              💬 {order.notes}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Мои заказы</h1>
            <p className="text-white/40 text-sm mt-1">{orders.length} заказов</p>
          </div>
          <button onClick={load} className="btn-glass w-10 h-10 p-0 flex items-center justify-center">
            <HiRefresh className={loading ? 'animate-spin' : ''} />
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-white/40 text-lg">Заказов пока нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o, i) => <OrderCard key={o.id} order={o} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
