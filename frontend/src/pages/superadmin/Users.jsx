import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiSearch } from 'react-icons/hi';

const ROLES = ['customer', 'restaurant_admin', 'superadmin'];
const ROLE_LABELS = { customer: 'Покупатель', restaurant_admin: 'Ресторан', superadmin: 'Суперадмин' };
const ROLE_COLORS = {
  customer: 'bg-white/10 text-white/60',
  restaurant_admin: 'bg-accent/20 text-accent',
  superadmin: 'bg-violet-DEFAULT/20 text-violet-400',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/superadmin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/superadmin/users/${userId}/role`, { role });
      toast.success('Роль обновлена');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch { toast.error('Ошибка'); }
  };

  const filtered = users.filter(u =>
    !search || `${u.first_name} ${u.last_name} ${u.username} ${u.telegram_id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Пользователи</h1>
          <p className="text-white/40 text-sm mt-1">{users.length} зарегистрированных пользователей</p>
        </motion.div>

        <div className="relative mb-6 max-w-sm">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 className="input-glass pl-10" placeholder="Поиск..." />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/40 text-sm font-medium">Пользователь</th>
                  <th className="text-left p-4 text-white/40 text-sm font-medium">Telegram</th>
                  <th className="text-left p-4 text-white/40 text-sm font-medium">Роль</th>
                  <th className="text-right p-4 text-white/40 text-sm font-medium">Изменить роль</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{u.first_name || ''} {u.last_name || ''}</p>
                      <p className="text-white/30 text-xs">ID: {u.id}</p>
                    </td>
                    <td className="p-4">
                      {u.username ? (
                        <a href={`https://t.me/${u.username}`} target="_blank" rel="noreferrer"
                           className="text-blue-400 hover:text-blue-300 text-sm">@{u.username}</a>
                      ) : (
                        <span className="text-white/30 text-sm">{u.telegram_id}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                              className="input-glass text-sm py-1.5 w-36" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
