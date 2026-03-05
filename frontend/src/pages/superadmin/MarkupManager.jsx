import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiCheck } from 'react-icons/hi';

function MarkupRow({ restaurant, onUpdate }) {
  const [markup, setMarkup] = useState(parseFloat(restaurant.markup_percent) || 0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/superadmin/restaurants/${restaurant.id}/markup`, { markup_percent: markup });
      toast.success(`Наценка для "${restaurant.name}" обновлена: ${markup}%`);
      setDirty(false);
      onUpdate(restaurant.id, markup);
    } catch { toast.error('Ошибка'); }
    finally { setSaving(false); }
  };

  // Example price calculation
  const exampleBase = 100;
  const exampleDisplay = (exampleBase * (1 + markup / 100)).toFixed(2);

  return (
    <div className="glass-card p-5 flex items-center gap-4">
      {restaurant.image_url ? (
        <img src={restaurant.image_url} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{restaurant.name}</p>
        <p className="text-white/40 text-xs mt-0.5">
          Пример: {exampleBase} ₽ → <span className="text-accent font-semibold">{exampleDisplay} ₽</span>
          {markup > 0 && <span className="text-white/30 ml-1">(+{markup}%)</span>}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <input
            type="number" step="0.01" min="0" max="100"
            value={markup}
            onChange={e => { setMarkup(parseFloat(e.target.value) || 0); setDirty(true); }}
            className="input-glass w-24 pr-7 text-center"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
        </div>
        {dirty && (
          <button onClick={save} disabled={saving}
                  className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 flex items-center justify-center transition-colors">
            {saving ? '...' : <HiCheck />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MarkupManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superadmin/restaurants').then(r => setRestaurants(r.data)).finally(() => setLoading(false));
  }, []);

  const handleUpdate = (id, markup) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, markup_percent: markup } : r));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Управление наценками</h1>
          <p className="text-white/40 text-sm mt-1">
            Установите процент наценки для каждого ресторана. Покупатели видят цену с наценкой.
          </p>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="glass-card p-4 mb-6 border border-accent/20" style={{ background: 'rgba(255,107,53,0.06)' }}>
          <p className="text-white/70 text-sm">
            💡 <strong className="text-accent">Как работает наценка:</strong> Если блюдо стоит <strong>100 ₽</strong> и наценка <strong>5%</strong>,
            покупатель увидит <strong className="text-accent">105 ₽</strong>. Ресторан получает 100 ₽, остаток — платформа.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse" />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 text-white/40">Нет ресторанов</div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}>
                <MarkupRow restaurant={r} onUpdate={handleUpdate} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
