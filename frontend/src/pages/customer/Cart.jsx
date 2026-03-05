import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiMinus, HiTrash, HiShoppingCart, HiArrowLeft, HiCreditCard, HiLocationMarker } from 'react-icons/hi';

export default function Cart() {
  const { cart, addItem, removeItem, removeAllOfItem, clearCart, total, itemCount } = useCart();
  const [isDebt, setIsDebt] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!address.trim()) {
      toast.error('Введите адрес доставки');
      return;
    }
    setLoading(true);
    try {
      const items = cart.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity }));
      const { data } = await api.post('/orders', {
        restaurant_id: cart.restaurantId,
        items,
        is_debt: isDebt,
        delivery_address: address,
        notes,
      });
      clearCart();
      toast.success(`Заказ #${data.order_id} оформлен!`);
      navigate('/orders');
    } catch {
      toast.error('Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="text-8xl mb-6 animate-float">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Корзина пуста</h2>
          <p className="text-white/40 mb-8">Выберите блюда из меню ресторана</p>
          <button onClick={() => navigate('/')} className="btn-accent">
            Перейти к ресторанам
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-glass w-10 h-10 p-0 flex items-center justify-center">
            <HiArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black gradient-text">Корзина</h1>
            <p className="text-white/40 text-sm">{cart.restaurantName}</p>
          </div>
        </motion.div>

        {/* Items */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="glass-card p-4 mb-6 space-y-3">
            <AnimatePresence>
              {cart.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-white/40 text-sm">{item.display_price} ₽ × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      <HiMinus className="text-sm" />
                    </button>
                    <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => addItem(cart.restaurantId, cart.restaurantName, item)}
                            className="w-8 h-8 rounded-lg bg-accent hover:bg-accent-light flex items-center justify-center transition-colors">
                      <HiPlus className="text-sm" />
                    </button>
                    <button onClick={() => removeAllOfItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors ml-1">
                      <HiTrash className="text-sm" />
                    </button>
                  </div>
                  <div className="text-accent font-bold text-sm min-w-[60px] text-right">
                    {(item.display_price * item.quantity).toFixed(0)} ₽
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Total */}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-white/60 font-medium">Итого:</span>
              <span className="text-2xl font-black text-accent">{total.toFixed(0)} ₽</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="glass-card p-5 mb-4">
            <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <HiLocationMarker className="text-accent" /> Адрес доставки *
            </label>
            <input
              type="text"
              placeholder="Улица, дом, квартира"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="input-glass"
            />
          </div>

          {/* Notes */}
          <div className="glass-card p-5 mb-4">
            <label className="text-white/60 text-sm mb-3 block">Комментарий к заказу</label>
            <textarea
              placeholder="Комментарий, пожелания..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="input-glass resize-none"
            />
          </div>

          {/* Debt option */}
          <div className="glass-card p-5 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={isDebt}
                  onChange={e => setIsDebt(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isDebt ? 'bg-accent border-accent' : 'border-white/30'
                }`}>
                  {isDebt && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <HiCreditCard className="text-accent" />
                  <span className="text-white font-medium">Заказать в долг</span>
                </div>
                <p className="text-white/40 text-xs mt-1">Оплата позже по договорённости с рестораном</p>
              </div>
            </label>
          </div>

          {/* Order button */}
          <button
            onClick={handleOrder}
            disabled={loading}
            className="btn-accent w-full flex items-center justify-center gap-3 text-lg py-4"
          >
            <HiShoppingCart className="text-xl" />
            {loading ? 'Оформление...' : `Оформить заказ — ${total.toFixed(0)} ₽`}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
