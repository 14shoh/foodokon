import { useState } from 'react';

const SEED_USERS = [
  { telegram_id: 900001, first_name: 'Супер Админ', username: 'superadmin', role: 'superadmin', panel: '/super' },
  { telegram_id: 900002, first_name: 'Админ Пицца', username: 'admin_pizza', role: 'restaurant_admin', panel: '/admin' },
  { telegram_id: 900003, first_name: 'Админ Суши', username: 'admin_sushi', role: 'restaurant_admin', panel: '/admin' },
  { telegram_id: 900004, first_name: 'Админ Бургер', username: 'admin_burger', role: 'restaurant_admin', panel: '/admin' },
  { telegram_id: 900005, first_name: 'Админ Шаурма', username: 'admin_shawarma', role: 'restaurant_admin', panel: '/admin' },
  { telegram_id: 900006, first_name: 'Админ Салат', username: 'admin_salad', role: 'restaurant_admin', panel: '/admin' },
  { telegram_id: 900010, first_name: 'Иван', username: 'client_ivan', role: 'customer', panel: '/' },
  { telegram_id: 900011, first_name: 'Мария', username: 'client_maria', role: 'customer', panel: '/' },
];

export default function DevLogin({ onLogin }) {
  const [selected, setSelected] = useState(SEED_USERS[0].telegram_id);
  const [name, setName] = useState('');
  const [useSeed, setUseSeed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (useSeed) {
        const u = SEED_USERS.find(x => x.telegram_id === Number(selected));
        await onLogin({ telegram_id: u.telegram_id, first_name: u.first_name, username: u.username });
      } else {
        if (!name.trim()) return;
        await onLogin({ first_name: name.trim(), username: name.trim().replace(/\s+/g, '_') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2 mb-1">
        <label className="flex items-center gap-1.5 text-white/70 text-sm cursor-pointer">
          <input type="radio" checked={useSeed} onChange={() => setUseSeed(true)} className="accent-accent" />
          Готовые пользователи
        </label>
        <label className="flex items-center gap-1.5 text-white/70 text-sm cursor-pointer">
          <input type="radio" checked={!useSeed} onChange={() => setUseSeed(false)} className="accent-accent" />
          Своё имя
        </label>
      </div>

      {useSeed ? (
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {SEED_USERS.map((u) => (
            <option key={u.telegram_id} value={u.telegram_id} className="bg-neutral-900 text-white">
              {u.first_name} ({u.role})
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          autoComplete="name"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold py-3 transition disabled:opacity-50"
      >
        {loading ? 'Вход…' : useSeed ? 'Войти' : 'Войти без Telegram'}
      </button>
    </form>
  );
}
