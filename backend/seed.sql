USE foodokon;

-- ─── USERS (для панелей: superadmin, restaurant_admin, customer) ─────────────
INSERT INTO users (telegram_id, username, first_name, last_name, role) VALUES
(900001, 'superadmin', 'Супер Админ', NULL, 'superadmin'),
(900002, 'admin_pizza', 'Админ Пицца', 'Пицца Рома', 'restaurant_admin'),
(900003, 'admin_sushi', 'Админ Суши', 'Суши Токио', 'restaurant_admin'),
(900004, 'admin_burger', 'Админ Бургер', 'Бургер House', 'restaurant_admin'),
(900005, 'admin_shawarma', 'Админ Шаурма', 'Шаурма Восток', 'restaurant_admin'),
(900006, 'admin_salad', 'Админ Салат', 'Салат Бар', 'restaurant_admin'),
(900010, 'client_ivan', 'Иван', 'Клиент', 'customer'),
(900011, 'client_maria', 'Мария', 'Клиент', 'customer')
ON DUPLICATE KEY UPDATE username=VALUES(username), first_name=VALUES(first_name), last_name=VALUES(last_name), role=VALUES(role);

-- ─── RESTAURANTS ────────────────────────────────────────────────────────────

INSERT INTO restaurants (name, description, image_url, address, phone, markup_percent, is_active) VALUES
('Пицца Рома',    'Итальянская пицца на тонком тесте. Готовим за 20 минут.',
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format',
 'ул. Ленина, 12', '+7 (999) 111-22-33', 5.00, true),

('Суши Токио',   'Свежие роллы и суши прямо из Японии. 15 лет опыта.',
 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&auto=format',
 'пр. Мира, 45', '+7 (999) 222-33-44', 7.50, true),

('Бургер House',  'Сочные бургеры, картошка фри и молочные коктейли.',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format',
 'ул. Советская, 8', '+7 (999) 333-44-55', 3.00, true),

('Шаурма Восток', 'Аутентичная шаурма и кебаб по оригинальным рецептам.',
 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format',
 'ул. Гагарина, 3', '+7 (999) 444-55-66', 0.00, true),

('Салат Бар',    'Полезные салаты, боулы и смузи для здорового питания.',
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format',
 'ул. Цветочная, 22', '+7 (999) 555-66-77', 4.00, true);

-- Привязка админов к ресторанам
UPDATE restaurants r SET admin_id = (SELECT id FROM users WHERE telegram_id = 900002) WHERE r.id = 1;
UPDATE restaurants r SET admin_id = (SELECT id FROM users WHERE telegram_id = 900003) WHERE r.id = 2;
UPDATE restaurants r SET admin_id = (SELECT id FROM users WHERE telegram_id = 900004) WHERE r.id = 3;
UPDATE restaurants r SET admin_id = (SELECT id FROM users WHERE telegram_id = 900005) WHERE r.id = 4;
UPDATE restaurants r SET admin_id = (SELECT id FROM users WHERE telegram_id = 900006) WHERE r.id = 5;

-- ─── CATEGORIES ─────────────────────────────────────────────────────────────

-- Ресторан 1: Пицца Рома
INSERT INTO categories (restaurant_id, name, sort_order) VALUES
(1, 'Классические пиццы', 1),
(1, 'Гурмэ пиццы', 2),
(1, 'Напитки', 3),
(1, 'Десерты', 4);

-- Ресторан 2: Суши Токио
INSERT INTO categories (restaurant_id, name, sort_order) VALUES
(2, 'Роллы', 1),
(2, 'Суши-сеты', 2),
(2, 'Супы', 3),
(2, 'Напитки', 4);

-- Ресторан 3: Бургер House
INSERT INTO categories (restaurant_id, name, sort_order) VALUES
(3, 'Бургеры', 1),
(3, 'Снеки', 2),
(3, 'Напитки', 3);

-- Ресторан 4: Шаурма Восток
INSERT INTO categories (restaurant_id, name, sort_order) VALUES
(4, 'Шаурма', 1),
(4, 'Кебаб', 2),
(4, 'Гарниры', 3);

-- Ресторан 5: Салат Бар
INSERT INTO categories (restaurant_id, name, sort_order) VALUES
(5, 'Салаты', 1),
(5, 'Боулы', 2),
(5, 'Смузи и соки', 3);

-- ─── MENU ITEMS ─────────────────────────────────────────────────────────────

-- Пицца Рома
INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES
(1, 1, 'Маргарита',       'Томатный соус, моцарелла, базилик. Классика!',
 390, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', true),
(1, 1, 'Пепперони',       'Томатный соус, моцарелла, пепперони',
 450, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', true),
(1, 1, '4 сыра',          'Моцарелла, горгонзола, пармезан, чеддер',
 480, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600', true),
(1, 2, 'Трюфельная',      'Трюфельное масло, грибы, пармезан',
 650, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', true),
(1, 2, 'Прошутто',        'Ветчина прошутто, руккола, пармезан',
 590, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600', true),
(1, 3, 'Кола 0.5 л',      'Coca-Cola ледяная', 90, null, true),
(1, 3, 'Лимонад Домашний','Лимон, мята, газировка',
 150, null, true),
(1, 4, 'Тирамису',        'Классический итальянский тирамису',
 280, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', true);

-- Суши Токио
INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES
(2, 5, 'Филадельфия',     'Лосось, сливочный сыр, огурец',
 480, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600', true),
(2, 5, 'Калифорния',      'Краб, авокадо, огурец',
 420, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600', true),
(2, 5, 'Дракон',          'Угорь, авокадо, огурец, икра тобико',
 550, 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600', true),
(2, 5, 'Спайси лосось',   'Острый лосось, огурец, соус спайси',
 460, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600', true),
(2, 6, 'Сет Классик 32 шт.','Популярные роллы: Филадельфия, Калифорния, Дракон',
 1490, null, true),
(2, 6, 'Сет Премиум 48 шт.','Все хиты + суши с тунцом и лаке',
 2200, null, true),
(2, 7, 'Мисо суп',        'Тофу, водоросли вакаме, зелёный лук',
 180, null, true),
(2, 7, 'Рамен с курицей', 'Насыщенный бульон, лапша, яйцо, нори',
 390, null, true),
(2, 8, 'Чай матча',       'Горячий японский матча',
 200, null, true);

-- Бургер House
INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES
(3, 9,  'Классик Бургер',  'Говяжья котлета, листья салата, томат, лук',
 320, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', true),
(3, 9,  'Чизбургер',       'Двойной чиз, бекон, маринованные огурцы',
 380, 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=600', true),
(3, 9,  'Барбекю Стек',    'Котлета 200г, соус BBQ, кольца лука',
 450, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600', true),
(3, 9,  'Вегги Бургер',    'Котлета из нута, авокадо, свежие овощи',
 360, null, true),
(3, 10, 'Картофель фри',   'Хрустящий картофель со специями',
 180, null, true),
(3, 10, 'Наггетсы 6 шт.',  'Куриные наггетсы с соусом на выбор',
 220, null, true),
(3, 10, 'Луковые кольца',  'Луковые кольца в кляре',
 200, null, true),
(3, 11, 'Кола 0.5 л',      'Coca-Cola', 90, null, true),
(3, 11, 'Молочный коктейль','Ванильный / шоколадный / клубничный',
 250, null, true);

-- Шаурма Восток
INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES
(4, 12, 'Шаурма Классик',  'Курица, овощи, соус чесночный, лаваш',
 250, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', true),
(4, 12, 'Шаурма Большая',  'Двойная порция курицы, сыр, соусы',
 320, null, true),
(4, 12, 'Шаурма с говядиной','Говядина, маринованные овощи, острый соус',
 350, null, true),
(4, 13, 'Кебаб куриный',   'Куриный шашлык на шпажке',
 280, null, true),
(4, 13, 'Кебаб из баранины','Маринованная баранина на углях',
 380, null, true),
(4, 14, 'Картофель жареный','С приправой и соусом',
 150, null, true),
(4, 14, 'Лепёшка',         'Свежеиспечённая лепёшка',
 60, null, true);

-- Салат Бар
INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES
(5, 15, 'Греческий',       'Огурцы, томаты, маслины, фета, оливковое масло',
 280, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', true),
(5, 15, 'Цезарь с курицей','Куриная грудка, романо, пармезан, соус Цезарь',
 320, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600', true),
(5, 15, 'Тунец-авокадо',   'Консервированный тунец, авокадо, микрозелень',
 380, null, true),
(5, 16, 'Buddha Bowl',     'Киноа, авокадо, нут, свёкла, тахини',
 420, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', true),
(5, 16, 'Protein Bowl',    'Куриная грудка, батат, шпинат, яйцо',
 450, null, true),
(5, 17, 'Зелёный смузи',   'Шпинат, банан, огурец, имбирь',
 220, null, true),
(5, 17, 'Ягодный смузи',   'Малина, черника, клубника, йогурт',
 240, null, true),
(5, 17, 'Свежевыжатый OJ', 'Свежий апельсиновый сок 300мл',
 190, null, true);

-- ─── ПРОВЕРКА ───────────────────────────────────────────────────────────────
SELECT CONCAT('Пользователей: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('Ресторанов: ', COUNT(*))    AS info FROM restaurants;
SELECT CONCAT('Категорий: ', COUNT(*))  AS info FROM categories;
SELECT CONCAT('Блюд: ', COUNT(*))       AS info FROM menu_items;
