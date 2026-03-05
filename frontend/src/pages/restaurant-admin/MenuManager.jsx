import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck } from 'react-icons/hi';

function ItemForm({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', description: '', base_price: '', category_id: '', image_url: '', is_available: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.base_price) { toast.error('Заполните обязательные поля'); return; }
    await onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="glass-card p-6 w-full max-w-md"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold gradient-text">{item ? 'Редактировать' : 'Добавить блюдо'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><HiX className="text-xl" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">Название *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-glass" placeholder="Например: Пицца Маргарита" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">Описание</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-glass resize-none" placeholder="Описание блюда..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Цена (₽) *</label>
              <input type="number" step="0.01" min="0" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} className="input-glass" placeholder="0.00" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Категория</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                      className="input-glass" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">URL картинки</label>
            <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="input-glass" placeholder="https://..." />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="w-4 h-4 accent-accent" />
            <span className="text-white/60 text-sm">Доступно для заказа</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-glass flex-1">Отмена</button>
            <button type="submit" className="btn-accent flex-1">Сохранить</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function MenuManager() {
  const [menu, setMenu] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/menu').then(r => {
      setMenu(r.data);
      if (!activeCategory && r.data.categories.length) setActiveCategory(r.data.categories[0].id);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveItem = async (form) => {
    try {
      if (editItem?.id) {
        await api.put(`/admin/menu/items/${editItem.id}`, form);
        toast.success('Блюдо обновлено');
      } else {
        await api.post('/admin/menu/items', form);
        toast.success('Блюдо добавлено');
      }
      setShowForm(false);
      setEditItem(null);
      load();
    } catch { toast.error('Ошибка сохранения'); }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Удалить блюдо?')) return;
    try {
      await api.delete(`/admin/menu/items/${id}`);
      toast.success('Блюдо удалено');
      load();
    } catch { toast.error('Ошибка удаления'); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await api.post('/admin/menu/categories', { name: newCatName });
      toast.success('Категория добавлена');
      setNewCatName('');
      setAddingCat(false);
      load();
    } catch { toast.error('Ошибка'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Удалить категорию? Блюда останутся без категории.')) return;
    try {
      await api.delete(`/admin/menu/categories/${id}`);
      toast.success('Категория удалена');
      load();
    } catch { toast.error('Ошибка'); }
  };

  const visibleItems = menu.items.filter(i =>
    activeCategory ? i.category_id === activeCategory : !i.category_id
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Меню</h1>
            <p className="text-white/40 text-sm mt-1">{menu.items.length} блюд в {menu.categories.length} категориях</p>
          </div>
          <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-accent flex items-center gap-2">
            <HiPlus /> Добавить блюдо
          </button>
        </motion.div>

        <div className="flex gap-6">
          {/* Categories sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="glass-card p-3 space-y-1">
              {menu.categories.map(cat => (
                <div key={cat.id}
                     className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                       activeCategory === cat.id ? 'bg-accent/20 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'
                     }`}
                     onClick={() => setActiveCategory(cat.id)}>
                  <span className="text-sm font-medium truncate flex-1">{cat.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                    className="text-white/20 hover:text-red-400 transition-colors ml-1"
                  >
                    <HiX className="text-xs" />
                  </button>
                </div>
              ))}
              <div
                className="px-3 py-2 rounded-lg cursor-pointer text-white/30 hover:text-white/60 text-sm transition-colors"
                onClick={() => setActiveCategory(null)}
              >
                Без категории
              </div>

              {/* Add category */}
              {addingCat ? (
                <div className="pt-2">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                         className="input-glass text-sm py-2 mb-2" placeholder="Название..." autoFocus />
                  <div className="flex gap-1">
                    <button onClick={handleAddCategory} className="flex-1 bg-accent/20 text-accent rounded-lg py-1.5 text-xs font-semibold hover:bg-accent/30"><HiCheck /></button>
                    <button onClick={() => setAddingCat(false)} className="flex-1 bg-white/5 text-white/40 rounded-lg py-1.5 text-xs hover:bg-white/10"><HiX /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingCat(true)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors flex items-center gap-1">
                  <HiPlus /> Категория
                </button>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse" />)}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <div className="text-5xl mb-3">🍽️</div>
                <p>Нет блюд в этой категории</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {visibleItems.map((item, i) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className={`glass-card p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-50' : ''}`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🍴</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white truncate">{item.name}</p>
                          {!item.is_available && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Недоступно</span>}
                        </div>
                        {item.description && <p className="text-white/40 text-sm truncate mt-0.5">{item.description}</p>}
                      </div>
                      <div className="text-accent font-bold text-lg flex-shrink-0">{parseFloat(item.base_price).toFixed(0)} ₽</div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setEditItem(item); setShowForm(true); }}
                                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                          <HiPencil />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)}
                                className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors">
                          <HiTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ItemForm
            item={editItem}
            categories={menu.categories}
            onSave={handleSaveItem}
            onClose={() => { setShowForm(false); setEditItem(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
