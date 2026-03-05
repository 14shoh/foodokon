import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { HiArrowLeft, HiPlus, HiMinus, HiShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';

function MenuItem({ item, restaurantId, restaurantName }) {
  const { cart, addItem, removeItem } = useCart();
  const cartItem = cart.items.find(i => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(restaurantId, restaurantName, item);
    if (!qty) toast.success(`${item.name} добавлен`, { duration: 1500 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 flex gap-4"
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.name}
             className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
             style={{ background: 'rgba(255,107,53,0.1)' }}>🍴</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white">{item.name}</h3>
        {item.description && (
          <p className="text-white/40 text-sm mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-accent font-bold text-lg">
            {item.display_price.toLocaleString('ru-RU')} ₽
          </span>
          <div className="flex items-center gap-2">
            {qty > 0 && (
              <>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <HiMinus className="text-sm" />
                </button>
                <span className="text-white font-bold w-6 text-center">{qty}</span>
              </>
            )}
            <button
              onClick={handleAdd}
              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent-light flex items-center justify-center transition-colors shadow-lg"
              style={{ boxShadow: '0 4px 12px rgba(255,107,53,0.4)' }}
            >
              <HiPlus className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const { itemCount, total } = useCart();

  useEffect(() => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/menu/${id}`),
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data);
      setMenu(mRes.data);
      setActiveCategory(mRes.data.categories[0]?.id || null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-lg animate-pulse">Загрузка меню...</div>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-lg">Ресторан не найден</div>
    </div>
  );

  const activeItems = menu?.categories.find(c => c.id === activeCategory)?.items || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl"
               style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(108,99,255,0.2))' }}>
            🍽️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c29] via-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <HiArrowLeft />
        </button>
        <div className="absolute bottom-4 left-6">
          <h1 className="text-3xl font-black text-white">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-white/60 text-sm mt-1">{restaurant.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {menu?.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-accent text-white shadow-lg'
                  : 'glass-card text-white/60 hover:text-white'
              }`}
              style={activeCategory === cat.id ? { boxShadow: '0 4px 15px rgba(255,107,53,0.4)' } : {}}
            >
              {cat.name}
              <span className="ml-2 text-xs opacity-70">({cat.items.length})</span>
            </button>
          ))}
        </div>

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {activeItems.map(item => (
              <MenuItem key={item.id} item={item} restaurantId={parseInt(id)} restaurantName={restaurant.name} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cart floating button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={() => navigate('/cart')}
            className="btn-accent flex items-center gap-3 px-8 py-4 text-base shadow-2xl"
            style={{ boxShadow: '0 10px 30px rgba(255,107,53,0.5)' }}
          >
            <HiShoppingCart className="text-xl" />
            <span>{itemCount} поз.</span>
            <span className="text-white/70">—</span>
            <span className="font-black">{total.toFixed(0)} ₽</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
