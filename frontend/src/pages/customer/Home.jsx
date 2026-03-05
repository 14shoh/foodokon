import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { HiLocationMarker, HiPhone, HiArrowRight, HiSearch } from 'react-icons/hi';

function RestaurantCard({ restaurant, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="glass-card-hover cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name}
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl"
               style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(108,99,255,0.15))' }}>
            🍽️
          </div>
        )}
        {restaurant.markup_percent > 0 && (
          <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
            +{restaurant.markup_percent}%
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-white mb-1">{restaurant.name}</h3>
        {restaurant.description && (
          <p className="text-white/50 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
        )}
        <div className="space-y-1.5">
          {restaurant.address && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <HiLocationMarker className="text-accent flex-shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <HiPhone className="text-accent flex-shrink-0" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-white/30 text-xs">Открыто</span>
          <div className="flex items-center gap-1 text-accent text-sm font-semibold">
            Перейти <HiArrowRight />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/restaurants').then(r => setRestaurants(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 relative">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-accent -top-20 -right-20 pointer-events-none" />
      <div className="orb w-80 h-80 bg-violet-DEFAULT -bottom-20 -left-20 pointer-events-none" />

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Рестораны</span> 🍽️
          </h1>
          <p className="text-white/50">Выберите ресторан и сделайте заказ</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="relative max-w-md">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            <input
              type="text"
              placeholder="Поиск ресторанов..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-glass pl-11"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">Ничего не найдено</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
