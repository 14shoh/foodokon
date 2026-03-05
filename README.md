# Foodokon 🍕

Платформа для заказа еды из ресторанов с поддержкой заказов в долг, системой наценок и тремя ролями пользователей.

## Роли
| Роль | Описание |
|------|---------|
| `customer` | Покупатель — выбирает ресторан, делает заказы |
| `restaurant_admin` | Администратор ресторана — управляет меню, заказами, долгами |
| `superadmin` | Разработчик — управляет ресторанами, наценками, глобальной статистикой |

## Быстрый старт

### 1. Создать Telegram бота

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. `/newbot` — создайте бота
3. Сохраните **токен** бота и **username** (без @)
4. Установите домен для Login Widget: `/setdomain` → укажите домен вашего сайта (для локальной разработки — `localhost`)

### 2. База данных MySQL

```bash
mysql -u root -p
```
```sql
source c:/Users/shoh1/Desktop/Foodokon/backend/schema.sql
```
Или через MySQL Workbench / phpMyAdmin.

### 3. Бэкенд

```bash
cd backend
npm install
cp .env.example .env
```

Заполните `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=ваш_пароль_mysql
DB_NAME=foodokon
JWT_SECRET=любой_длинный_случайный_ключ
TELEGRAM_BOT_TOKEN=токен_от_BotFather
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 4. Фронтенд

```bash
cd frontend
npm install
cp .env.example .env
```

Заполните `.env`:
```
VITE_TELEGRAM_BOT_NAME=username_вашего_бота
```

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173)

### 5. Первый суперадмин

После первого входа через Telegram, вручную измените роль в БД:
```sql
USE foodokon;
UPDATE users SET role = 'superadmin' WHERE telegram_id = ВАШ_TELEGRAM_ID;
```
Ваш Telegram ID можно узнать через [@userinfobot](https://t.me/userinfobot).

---

## Структура проекта

```
foodokon/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL connection pool
│   │   ├── middleware/auth.js     # JWT + role guard
│   │   └── routes/
│   │       ├── auth.js            # Telegram Login Widget
│   │       ├── restaurants.js     # Список ресторанов
│   │       ├── menu.js            # Меню с наценкой
│   │       ├── orders.js          # Заказы покупателя
│   │       ├── admin.js           # Панель ресторана
│   │       └── superadmin.js      # Панель разработчика
│   ├── schema.sql
│   └── package.json
└── frontend/
    └── src/
        ├── pages/
        │   ├── customer/          # Главная, меню, корзина, заказы, долги
        │   ├── restaurant-admin/  # Дашборд, заказы, меню, должники
        │   └── superadmin/        # Статистика, рестораны, наценки, долги, юзеры
        ├── components/            # Layout, TelegramLogin, StatCard, StatusBadge
        ├── context/               # AuthContext, CartContext
        └── api/axios.js
```

## API (краткий список)

| Метод | Путь | Роль |
|-------|------|------|
| POST | `/api/auth/telegram` | Все |
| GET | `/api/restaurants` | Все |
| GET | `/api/menu/:id` | Все |
| POST | `/api/orders` | customer |
| GET | `/api/orders/my` | customer |
| GET | `/api/admin/stats` | restaurant_admin |
| GET | `/api/admin/orders` | restaurant_admin |
| PATCH | `/api/admin/orders/:id/status` | restaurant_admin |
| GET/POST/PUT/DELETE | `/api/admin/menu/items` | restaurant_admin |
| GET | `/api/admin/debts` | restaurant_admin |
| GET | `/api/superadmin/stats` | superadmin |
| GET/POST/PUT | `/api/superadmin/restaurants` | superadmin |
| PATCH | `/api/superadmin/restaurants/:id/markup` | superadmin |
| GET | `/api/superadmin/debts` | superadmin |
| PATCH | `/api/superadmin/users/:id/role` | superadmin |
