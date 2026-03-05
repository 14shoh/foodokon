import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { HiRefresh } from 'react-icons/hi';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'];
const STATUS_LABELS = {
  pending: 'Принять', confirmed: 'Готовится', preparing: 'Доставка',
  delivering: 'Доставлен', delivered: null,
};

const FILTER_TABS = [
  { key: '', label: 'Все' },
  { key: 'pending', label: 'Ожидают' },
  { key: 'confirmed', label: 'Приняты' },
  { key: 'preparing', label: 'Готовятся' },
  { key: 'delivering', label: 'В доставке' },
  { key: 'delivered', label: 'Доставлены' },
];

function OrderCard({ order, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status });
      toast.success(`Статус обновлён: ${status}`);
      onStatusUpdate(order.id, status);
    } catch {
      toast.error('Не удалось обновить статус');
    } finally {
      setUpdating(false);
    }
  };

  const date = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/40 text-sm">#{order.id}</span>
            <StatusBadge status={order.status} />
            {order.is_debt && (
              <span className="status-badge bg-red-500/20 text-red-300 border border-red-500/30">В долг</span>
            )}
          </div>
          <p className="font-bold text-white text-lg">
            {order.first_name || ''} {order.last_name || ''}
            {order.username && <span className="text-white/40 text-sm font-normal ml-1">@{order.username}</span>}
          </p>
          <p className="text-white/40 text-xs mt-1">{date}</p>
        </div>
        <div className="text-accent font-black text-2xl flex-shrink-0">
          {parseFloat(order.total_amount).toFixed(0)} ₽
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items?.map(item => (
          <div key={item.id} className="flex justify-between text-sm text-white/60">
            <span>{item.item_name} × {item.quantity}</span>
            <span>{(item.price_at_time * item.quantity).toFixed(0)} ₽</span>
          </div>
        ))}
      </div>

      {order.delivery_address && (
        <p className="text-white/40 text-xs mb-3">📍 {order.delivery_address}</p>
      )}
      {order.notes && (
        <p className="text-white/30 text-xs mb-3">💬 {order.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={updating}
            className="btn-accent text-sm py-2 flex-1"
          >
            {updating ? '...' : `→ ${STATUS_LABELS[order.status]}`}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={updating}
            className="px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            Отменить
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${q}`).then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatusUpdate = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // Auto-refresh every 30 seconds for pending orders
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Заказы</h1>
            <p className="text-white/40 text-sm mt-1">Управление входящими заказами</p>
          </div>
          <button onClick={load} className="btn-glass w-10 h-10 p-0 flex items-center justify-center">
            <HiRefresh className={loading ? 'animate-spin' : ''} />
          </button>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.key ? 'btn-accent' : 'btn-glass'
              }`}
            >
              {tab.label}
              {tab.key === '' && orders.length > 0 && (
                <span className="ml-2 text-xs opacity-70">({orders.length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-36 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-white/40 text-lg">Заказов нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <OrderCard key={o.id} order={o} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
