import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiX, HiCheck, HiOfficeBuilding } from 'react-icons/hi';

function RestaurantForm({ restaurant, onSave, onClose }) {
  const [form, setForm] = useState(restaurant || {
    name: '', description: '', image_url: '', address: '', phone: '',
    markup_percent: 0, is_active: true, admin_telegram_id: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Введите название'); return; }
    await onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                  className="glass-card p-6 w-full max-w-lg my-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold gradient-text">{restaurant ? 'Редактировать' : 'Добавить ресторан'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><HiX className="text-xl" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-white/60 text-sm mb-1.5 block">Название *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-glass" placeholder="Название ресторана" />
            </div>
            <div className="col-span-2">
              <label className="text-white/60 text-sm mb-1.5 block">Описание</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-glass resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-white/60 text-sm mb-1.5 block">URL картинки</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="input-glass" placeholder="https://..." />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Адрес</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-glass" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Телефон</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-glass" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Наценка (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.markup_percent}
                     onChange={e => setForm({...form, markup_percent: e.target.value})} className="input-glass" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Telegram ID администратора</label>
              <input value={form.admin_telegram_id} onChange={e => setForm({...form, admin_telegram_id: e.target.value})}
                     className="input-glass" placeholder="123456789" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4" />
                <span className="text-white/60 text-sm">Ресторан активен</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-glass flex-1">Отмена</button>
            <button type="submit" className="btn-accent flex-1">Сохранить</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SuperRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/superadmin/restaurants').then(r => setRestaurants(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editRestaurant?.id) {
        await api.put(`/superadmin/restaurants/${editRestaurant.id}`, form);
        toast.success('Ресторан обновлён');
      } else {
        await api.post('/superadmin/restaurants', form);
        toast.success('Ресторан добавлен');
      }
      setShowForm(false);
      setEditRestaurant(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
  };

  const toggleActive = async (r) => {
    try {
      await api.put(`/superadmin/restaurants/${r.id}`, { is_active: !r.is_active });
      toast.success(r.is_active ? 'Ресторан деактивирован' : 'Ресторан активирован');
      load();
    } catch { toast.error('Ошибка'); }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Рестораны</h1>
            <p className="text-white/40 text-sm mt-1">{restaurants.length} ресторанов на платформе</p>
          </div>
          <button onClick={() => { setEditRestaurant(null); setShowForm(true); }} className="btn-accent flex items-center gap-2">
            <HiPlus /> Добавить
          </button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-40 animate-pulse" />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <HiOfficeBuilding className="text-6xl text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Нет ресторанов</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`glass-card p-5 ${!r.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{r.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>
                        {r.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    {r.address && <p className="text-white/40 text-xs truncate">📍 {r.address}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-accent font-semibold">Наценка: {r.markup_percent}%</span>
                      {r.admin_username && <span className="text-white/30">👤 @{r.admin_username}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setEditRestaurant(r); setShowForm(true); }}
                          className="flex-1 btn-glass text-sm py-2 flex items-center justify-center gap-1">
                    <HiPencil /> Изменить
                  </button>
                  <button onClick={() => toggleActive(r)}
                          className={`flex-1 text-sm py-2 rounded-xl flex items-center justify-center gap-1 transition-colors font-semibold border ${
                            r.is_active
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                          }`}>
                    {r.is_active ? '✕ Деактивировать' : <><HiCheck /> Активировать</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <RestaurantForm
            restaurant={editRestaurant}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditRestaurant(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
