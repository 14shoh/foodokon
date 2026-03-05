import { useEffect, useRef } from 'react';

const BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME || '';
const isPlaceholder = !BOT_NAME || BOT_NAME === 'your_bot_username_without_at';

export default function TelegramLogin({ onAuth }) {
  const ref = useRef();
  const onAuthRef = useRef(onAuth);
  onAuthRef.current = onAuth;

  useEffect(() => {
    if (isPlaceholder) return;

    window.onTelegramAuth = (user) => {
      onAuthRef.current?.(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-radius', '12');
    script.async = true;

    if (ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  if (isPlaceholder) {
    return (
      <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-center text-white/70 text-sm">
        Укажите <code className="bg-black/20 px-1 rounded">VITE_TELEGRAM_BOT_NAME</code> в <code className="bg-black/20 px-1 rounded">frontend/.env</code> — имя бота из @BotFather (без @)
      </div>
    );
  }

  return <div ref={ref} className="flex justify-center" />;
}
