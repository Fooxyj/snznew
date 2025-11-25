
import React, { useState, useEffect } from 'react';
import { Ad, Category, CreateAdFormState, NewsItem, User, CatalogCategory, Review, Movie, Shop, Product, CartItem, Story, Notification } from './types';
import { AdCard } from './components/AdCard';
import { CreateAdModal } from './components/CreateAdModal';
import { AdPage } from './components/AdPage'; 
import { NewsPage } from './components/NewsPage';
import { LoginModal } from './components/LoginModal';
import { ServiceCatalogModal } from './components/ServiceCatalogModal';
import { MovieBookingModal } from './components/MovieBookingModal';
import { PartnerModal } from './components/PartnerModal';
import { ShopCard } from './components/ShopCard';
import { ShopPage } from './components/ShopPage';
import { MerchantDashboard } from './components/MerchantDashboard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { StoriesBar } from './components/StoriesBar';
import { UserProfileModal } from './components/UserProfileModal';
import { ToastNotification } from './components/ToastNotification';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './services/supabaseClient';
import { formatPhoneNumber } from './utils';

// --- MOCK DATA ---
const INITIAL_ADS: Ad[] = [
  {
    id: '1',
    title: 'Русская баня на дровах',
    description: 'Отличная парная, березовые веники, комната отдыха с камином. Находимся в черте города, удобный подъезд. Есть мангальная зона. Работаем круглосуточно.',
    price: 1200,
    category: 'rent',
    subCategory: 'Дома, дачи',
    contact: '+7 (900) 123 45 67',
    location: 'Сады "40-е"',
    image: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    bookingAvailable: true,
    bookingWidget: { type: 'litepms', id: 9177, wid: 1127 },
    date: 'Сегодня',
    reviews: [
      { id: 'r1', author: 'Александр', rating: 5, text: 'Отличная баня, очень чисто и уютно! Рекомендую.', date: '10 окт' },
      { id: 'r2', author: 'Елена', rating: 4, text: 'Все понравилось, но немного прохладно в предбаннике.', date: '05 окт' }
    ],
    status: 'approved'
  },
  {
    id: '9',
    title: 'Домики',
    description: 'Уютный дом на берегу озера. 12 спальных мест, большая гостиная, караоке, сауна внутри дома. Идеально для дня рождения или корпоратива. Залог 5000р.',
    price: 15000,
    category: 'rent',
    subCategory: 'Дома, дачи',
    contact: '+7 (912) 000 99 88',
    location: 'оз. Синара',
    image: 'https://i.postimg.cc/9Mr2X49R/photo-output-1-6-jpg.webp',
    isPremium: true,
    bookingAvailable: true,
    bookingWidget: { type: 'litepms', id: 9177, wid: 1126 },
    date: 'Сегодня',
    reviews: [],
    specs: { rooms: 4, area: 120 },
    status: 'approved'
  },
  {
    id: '2',
    title: 'Продам ВАЗ 2114',
    description: '2011 год. Состояние хорошее, есть рыжики на арках. Двигатель работает ровно. Зимняя резина на штампах в комплекте.',
    price: 185000,
    category: 'sale',
    subCategory: 'Автомобили',
    contact: '+7 (912) 345 67 89',
    location: 'ГСК-1 (у ГАИ)',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: 'Вчера',
    reviews: [],
    specs: { year: 2011, mileage: 155000 },
    status: 'approved'
  },
  {
    id: '3',
    title: 'Сдается 2-к квартира',
    description: 'Район "Новый город". Рядом школа 135 и ФОК. Мебель, техника. Только на длительный срок. Без животных.',
    price: 25000,
    category: 'rent',
    subCategory: 'Квартиры',
    contact: '+7 (900) 555 44 33',
    location: 'ул. Забабахина 54',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    date: 'Вчера',
    reviews: [
      { id: 'r3', author: 'Мария', rating: 5, text: 'Снимали квартиру год, хозяева адекватные.', date: '20 сен' }
    ],
    specs: { rooms: 2, floor: 5, area: 54 },
    status: 'approved'
  },
  {
    id: '4',
    title: 'Услуги сантехника',
    description: 'Любые виды сантехнических работ. Замена труб, установка смесителей, унитазов. Быстро, качественно.',
    price: 0,
    category: 'services',
    subCategory: 'Сантехника',
    contact: '+7 (922) 111 22 33',
    location: 'Весь Снежинск',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: '13 окт',
    reviews: [
       { id: 'r4', author: 'Виктор', rating: 5, text: 'Мастер своего дела. Приехал быстро, сделал все качественно.', date: '12 окт' },
       { id: 'r5', author: 'Ольга', rating: 5, text: 'Спасибо за починку крана!', date: '01 окт' },
       { id: 'r6', author: 'Сергей', rating: 4, text: 'Сделал хорошо, но опоздал на 15 минут.', date: '25 сен' }
    ],
    status: 'approved'
  },
  {
    id: '5',
    title: 'Детская коляска 3в1',
    description: 'Коляска в отличном состоянии, после одного ребенка. Полный комплект.',
    price: 15000,
    category: 'sale',
    subCategory: 'Детская одежда', 
    contact: '+7 (999) 888 77 66',
    location: 'ул. Щелкина 9',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: '09 окт',
    reviews: [],
    specs: { condition: 'used', brand: 'Tutis' },
    status: 'approved'
  },
  {
    id: '6',
    title: 'Электрик. Монтаж проводки',
    description: 'Электромонтажные работы под ключ. Замена проводки, установка розеток, люстр, счетчиков. Допуск.',
    price: 0,
    category: 'services',
    subCategory: 'Электрика',
    contact: '+7 (955) 444 33 22',
    location: 'Снежинск',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: 'Сегодня',
    reviews: [],
    status: 'approved'
  },
  {
    id: '7',
    title: 'Ремонт квартир под ключ',
    description: 'Бригада мастеров выполнит качественный ремонт. Штукатурка, обои, ламинат, плитка. Смета бесплатно.',
    price: 0,
    category: 'services',
    subCategory: 'Ремонт квартир',
    contact: '+7 (900) 333 22 11',
    location: 'Снежинск и область',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    date: 'Сегодня',
    reviews: [
        { id: 'r7', author: 'Дмитрий', rating: 5, text: 'Рекомендую! Сделали ремонт в ванной за неделю.', date: '15 авг' }
    ],
    status: 'approved'
  },
  {
    id: '8',
    title: 'iPhone 13 128GB',
    description: 'В идеальном состоянии, полный комплект, чек, гарантия. Использовался в чехле и с защитным стеклом.',
    price: 55000,
    category: 'sale',
    subCategory: 'Электроника',
    contact: '+7 (900) 111 00 00',
    location: 'ТЦ Универмаг',
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: 'Вчера',
    reviews: [],
    specs: { condition: 'used', brand: 'Apple' },
    status: 'approved'
  },
  // Sample Pending Ad
  {
    id: '100',
    title: 'Гараж в кооперативе №7',
    description: 'Продам гараж, яма сухая, крыша перекрыта в прошлом году.',
    price: 80000,
    category: 'sale',
    subCategory: 'Гаражи',
    contact: '+7 (999) 123 44 55',
    location: 'Кооператив 7',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    date: 'Только что',
    status: 'pending'
  }
];

const INITIAL_STORIES: Story[] = [
  { id: '1', shopId: 's1', shopName: 'Клондайк', avatar: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800', text: 'Скидки на краску до 30%!' },
  { id: '2', shopId: 'c1', shopName: 'Олива', avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', text: 'Новое меню бизнес-ланчей 🍕' },
  { id: '3', shopId: 's2', shopName: 'Цветы', avatar: 'https://images.unsplash.com/photo-1562521151-54b609c25841?w=100', image: 'https://images.unsplash.com/photo-1557929036-f60e326e3c1a?w=800', text: 'Свежая поставка пионов!' },
  { id: '4', shopId: 'k1', shopName: 'Кино', avatar: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100', image: 'https://avatars.mds.yandex.net/get-kinopoisk-image/10535692/d4050d27-6f01-49b0-9f1c-755106596131/1920x', text: 'Премьера сегодня в 19:00' },
  { id: '5', shopId: 's3', shopName: 'Универмаг', avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100', image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800', text: 'Финальная распродажа лета' },
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'В Снежинске открылся новый ФОК',
    excerpt: 'Торжественное открытие физкультурно-оздоровительного комплекса состоялось вчера...',
    content: 'Вчера в нашем городе прошло торжественное открытие нового ФОКа. Комплекс оснащен современным бассейном, тренажерным залом и залом для игровых видов спорта. На церемонии присутствовали представители администрации и почетные гости города. Теперь жители района "Поселок" смогут заниматься спортом в шаговой доступности.',
    date: '15 окт',
    category: 'Спорт',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Ремонт дороги на ул. Ленина',
    excerpt: 'С 20 октября начинается капитальный ремонт дорожного покрытия на центральной улице...',
    content: 'Администрация города сообщает о начале ремонтных работ на улице Ленина. Движение будет частично ограничено. Планируется полная замена асфальтового покрытия, установка новых бордюров и обновление дорожной разметки. Работы продлятся до конца месяца. Просим водителей заранее выбирать пути объезда.',
    date: '14 окт',
    category: 'Город',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Выставка художников Урала',
    excerpt: 'В городском музее открылась уникальная выставка пейзажистов...',
    content: 'Приглашаем всех ценителей искусства посетить выставку "Природа Урала". Представлены работы более 20 художников региона. Экспозиция включает в себя как классические пейзажи, так и современные абстрактные работы. Вход свободный для всех желающих.',
    date: '12 окт',
    category: 'Культура',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80'
  }
];

const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Мастер и Маргарита',
    genre: 'Драма, фэнтези',
    rating: '7.9',
    ageLimit: '16+',
    image: 'https://avatars.mds.yandex.net/get-kinopoisk-image/10535692/37e35b71-1f7c-41c3-8884-386df27f2c41/1920x',
    description: 'Москва, 1930-е годы. Известный писатель оказывается в центре литературного скандала. Спектакль по его пьесе снимают с репертуара, коллеги демонстративно избегают встречи, в считанные дни он превращается в изгоя. Вскоре после этого он знакомится с Маргаритой, которая становится его возлюбленной и музой.',
    showtimes: ['14:00', '17:30', '21:00'],
    price: 350
  },
  {
    id: 'm2',
    title: 'Дюна: Часть вторая',
    genre: 'Фантастика, боевик',
    rating: '8.5',
    ageLimit: '12+',
    image: 'https://avatars.mds.yandex.net/get-kinopoisk-image/4774061/a7556a34-2e9b-443b-824d-e900980f7633/1920x',
    description: 'Герцог Пол Атрейдес присоединяется к фрименам, чтобы стать Муад Дибом, одновременно пытаясь предотвратить ужасное будущее, которое он видел: священную войну, распространяющуюся по всей известной вселенной.',
    showtimes: ['12:15', '15:40', '19:00', '22:15'],
    price: 400
  },
  {
    id: 'm3',
    title: 'Кунг-фу Панда 4',
    genre: 'Мультфильм, комедия',
    rating: '7.2',
    ageLimit: '6+',
    image: 'https://avatars.mds.yandex.net/get-kinopoisk-image/10535692/d4050d27-6f01-49b0-9f1c-755106596131/1920x',
    description: 'Продолжение приключений легендарного Воина Дракона, его верных друзей и наставника. На этот раз По предстоит столкнуться с новым могущественным врагом.',
    showtimes: ['10:00', '12:00', '14:00'],
    price: 300
  }
];

const INITIAL_SHOPS: Shop[] = [
    {
        id: 's1',
        name: 'Клондайк',
        description: 'Строительные материалы, инструменты, все для ремонта и сада. Широкий ассортимент качественных товаров от ведущих производителей.',
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200&q=80',
        address: 'ул. Транспортная 15',
        phone: '+7 (35146) 3 22 11',
        workingHours: 'Пн-Вс: 09:00 - 20:00',
        rating: 4.8,
        paymentConfig: { enabled: true, type: 'online' }, // ENABLED ONLINE PAYMENT
        products: [
            { id: 'p1', title: 'Дрель ударная Makita', price: 5500, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', description: 'Мощная дрель для профессиональных работ. В комплекте кейс и набор сверл.' },
            { id: 'p2', title: 'Краска интерьерная', price: 1200, image: 'https://images.unsplash.com/photo-1562259920-47afc305f369?w=400', description: 'Моющаяся матовая краска для стен и потолков. Объем 2.5 литра.' },
            { id: 'p3', title: 'Набор отверток', price: 800, image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400', description: 'Набор из 8 отверток разного размера. Прорезиненные ручки.' },
            { id: 'p4', title: 'Обои виниловые', price: 1500, image: 'https://images.unsplash.com/photo-1615800098779-1be8e1ea64d4?w=400', description: 'Плотные виниловые обои с геометрическим узором. Ширина 1м.' },
             { id: 'p5', title: 'Ламинат дуб', price: 900, image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400', description: 'Ламинат 33 класса. Цвет: натуральный дуб. Цена за кв.м.' },
        ]
    },
    {
        id: 's2',
        name: 'Цветочный дворик',
        description: 'Свежие цветы, авторские букеты, доставка по городу. Оформление свадеб и торжеств.',
        logo: 'https://images.unsplash.com/photo-1562521151-54b609c25841?w=300',
        coverImage: 'https://images.unsplash.com/photo-1557929036-f60e326e3c1a?w=1200',
        address: 'пр. Мира 18',
        phone: '+7 (922) 222 33 44',
        workingHours: 'Пн-Вс: 08:00 - 21:00',
        rating: 4.9,
        paymentConfig: { enabled: false, type: 'manual', phone: '+79222223344' }, // MANUAL WHATSAPP ORDER
        products: [
            { id: 'f1', title: 'Букет из 51 розы', price: 5500, image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400', description: 'Роскошный букет из красных роз сорта Эксплорер (60см).' },
            { id: 'f2', title: 'Пионы розовые', price: 450, image: 'https://images.unsplash.com/photo-1563241527-3af16059d4c9?w=400', description: 'Свежие голландские пионы. Цена за 1 шт.' },
            { id: 'f3', title: 'Сборный букет "Нежность"', price: 2300, image: 'https://images.unsplash.com/photo-1596767746566-4c49d280d4f5?w=400', description: 'Авторский букет в пастельных тонах с эустомой и альстромерией.' },
             { id: 'f4', title: 'Корзина с цветами', price: 3500, image: 'https://images.unsplash.com/photo-1596195759367-27b40974cc9e?w=400', description: 'Плетеная корзина с сезонными цветами и зеленью.' },
        ]
    },
    {
        id: 's3',
        name: 'Универмаг',
        description: 'Одежда, обувь, товары для дома. Большой выбор и доступные цены. Центр города.',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200',
        address: 'ул. Свердлова 1',
        phone: '+7 (35146) 2 55 55',
        workingHours: 'Пн-Вс: 10:00 - 19:00',
        rating: 4.2,
        paymentConfig: { enabled: false, type: 'manual', phone: '+73514625555' },
        products: [
            { id: 'u1', title: 'Платье летнее', price: 2500, image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=400', description: 'Легкое платье из вискозы с цветочным принтом.' },
            { id: 'u2', title: 'Кроссовки белые', price: 3200, image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400', description: 'Классические белые кроссовки. Экокожа.' },
            { id: 'u3', title: 'Сумка кожаная', price: 4500, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', description: 'Сумка-шоппер из натуральной кожи.' },
        ]
    },
    {
        id: 'cinema1',
        name: 'Кинотеатр "Космос"',
        description: 'Премьеры мирового кинематографа, комфортные залы и вкусный попкорн.',
        logo: 'https://avatars.mds.yandex.net/get-kinopoisk-image/10535692/d4050d27-6f01-49b0-9f1c-755106596131/1920x', // Using Kung Fu Panda or similar quality image for logo
        coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
        address: 'ул. Васильева 35',
        phone: '+7 (35146) 3 00 00',
        workingHours: 'Пн-Вс: 09:00 - 00:00',
        rating: 4.7,
        paymentConfig: { enabled: true, type: 'online' },
        products: [
            { id: 'cp1', title: 'Попкорн Соленый (V)', price: 350, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', description: 'Большое ведро соленого попкорна.' },
            { id: 'cp2', title: 'Начос с сырным соусом', price: 280, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400', description: 'Хрустящие кукурузные чипсы.' },
            { id: 'cp3', title: 'Coca-Cola 0.5', price: 120, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', description: 'Холодная газировка.' },
        ]
    }
];

const INITIAL_CAFES: Shop[] = [
    {
        id: 'c1',
        name: 'Олива',
        description: 'Уютный семейный ресторан с итальянской кухней. Пицца из дровяной печи, домашняя паста и изысканные десерты. Есть детская комната.',
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
        address: 'ул. Ленина 14',
        phone: '+7 (35146) 9 20 20',
        workingHours: 'Пн-Вс: 11:00 - 23:00',
        rating: 4.9,
        paymentConfig: { enabled: true, type: 'online' }, // ENABLED ONLINE PAYMENT
        products: [
            { id: 'm1', title: 'Пицца Пепперони', price: 650, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', description: 'Классическая пицца с колбасками пепперони, моцареллой и томатным соусом. 30см.' },
            { id: 'm2', title: 'Паста Карбонара', price: 480, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', description: 'Спагетти с беконом, сливочным соусом и пармезаном.' },
            { id: 'm3', title: 'Салат Цезарь', price: 420, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', description: 'С куриным филе, сухариками, перепелиными яйцами и соусом цезарь.' },
            { id: 'm4', title: 'Тирамису', price: 350, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', description: 'Традиционный итальянский десерт с маскарпоне и кофе.' },
        ]
    },
    {
        id: 'c2',
        name: 'Coffee Like',
        description: 'Кофе с собой, авторские напитки и свежая выпечка. Идеальное место для начала дня или короткой встречи.',
        logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200&q=80',
        address: 'пр. Мира 22 (у входа в парк)',
        phone: '+7 (900) 555 44 33',
        workingHours: 'Пн-Вс: 08:00 - 21:00',
        rating: 4.7,
        paymentConfig: { enabled: false, type: 'manual', phone: '+79005554433' },
        products: [
            { id: 'co1', title: 'Капучино Большой', price: 220, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', description: '400мл. Классический кофейный напиток на основе эспрессо с добавлением молока.' },
            { id: 'co2', title: 'Латте Соленая карамель', price: 250, image: 'https://images.unsplash.com/photo-1570968992193-6e5c922e963c?w=400', description: 'Нежный кофейный напиток с сиропом соленая карамель.' },
            { id: 'co3', title: 'Круассан с шоколадом', price: 150, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', description: 'Свежеиспеченный круассан с шоколадной начинкой.' },
        ]
    },
    {
        id: 'c3',
        name: 'Суши Хаус',
        description: 'Доставка суши и роллов. Большие порции, свежая рыба. Wok-лапша и супы. Быстрая доставка по городу.',
        logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80',
        address: 'ул. Васильева 8',
        phone: '+7 (35146) 2 22 22',
        workingHours: 'Пн-Вс: 10:00 - 22:30',
        rating: 4.5,
        paymentConfig: { enabled: false, type: 'manual', phone: '+73514622222' },
        products: [
            { id: 's1', title: 'Сет Филадельфия', price: 1200, image: 'https://images.unsplash.com/photo-1617196019294-dcce47895545?w=400', description: 'Набор из 3 видов роллов Филадельфия: с огурцом, с авокадо и лайт. 24 шт.' },
            { id: 's2', title: 'Ролл Калифорния', price: 350, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', description: 'Снежный краб, огурец, авокадо, икра масаго.' },
            { id: 's3', title: 'Wok с курицей', price: 400, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?w=400', description: 'Лапша удон с курицей, овощами и соусом терияки.' },
        ]
    }
];

const SERVICE_CATALOG: CatalogCategory[] = [
  {
    id: 'sale',
    label: 'Продажа',
    groups: [
      { name: 'Недвижимость', items: ['Квартиры', 'Комнаты', 'Дома, дачи', 'Гаражи', 'Земельные участки'] },
      { name: 'Транспорт', items: ['Автомобили', 'Мотоциклы', 'Спецтехника', 'Запчасти'] },
      { name: 'Личные вещи', items: ['Одежда, обувь', 'Детская одежда', 'Часы и украшения'] },
      { name: 'Электроника', items: ['Телефоны', 'Компьютеры', 'Бытовая техника'] },
      { name: 'Хобби и отдых', items: ['Спорт и отдых', 'Книги', 'Музыкальные инструменты'] },
    ]
  },
  {
    id: 'rent',
    label: 'Аренда',
    groups: [
      { name: 'Недвижимость', items: ['Квартиры', 'Комнаты', 'Дома, дачи', 'Гаражи', 'Коммерческая'] },
      { name: 'Транспорт', items: ['Автомобили', 'Прицепы'] },
      { name: 'Оборудование', items: ['Инструмент', 'Строительное', 'Туристическое'] },
    ]
  },
  {
    id: 'services',
    label: 'Услуги',
    groups: [
      { name: 'Ремонт и стройка', items: ['Ремонт квартир', 'Сантехника', 'Электрика', 'Сборка мебели'] },
      { name: 'Транспорт', items: ['Грузоперевозки', 'Переезды', 'Эвакуатор', 'Пассажирские перевозки'] },
      { name: 'Красота и здоровье', items: ['Парикмахерские', 'Маникюр', 'Массаж'] },
      { name: 'Компьютеры', items: ['Ремонт ПК', 'Настройка интернета'] },
      { name: 'Обучение', items: ['Репетиторы', 'Курсы', 'Спорт секции'] },
    ]
  },
  {
    id: 'jobs',
    label: 'Работа',
    groups: [
      { name: 'Вакансии', items: ['Производство', 'Торговля', 'Строительство', 'Транспорт', 'Офис', 'Без опыта'] },
    ]
  }
];

// Extracted SidebarItem to prevent unnecessary re-renders
const SidebarItem = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${active 
        ? 'bg-primary text-white shadow-lg shadow-primary/30' 
        : 'text-secondary hover:bg-gray-50 hover:text-dark'}`}
  >
    <div className={`${active ? 'text-white' : 'text-gray-400'}`}>{icon}</div>
    {label}
  </button>
);

const SnezhikLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20" className="text-blue-300" />
    <path d="M12 2v20" transform="rotate(45 12 12)" className="text-blue-300" />
    <path d="M12 2v20" transform="rotate(-45 12 12)" className="text-blue-300" />
    <path d="M12 2v4M12 22v-4M2 12h4M22 12h-4" className="text-blue-200" strokeWidth="3" />
    <circle cx="12" cy="12" r="3" className="text-white fill-blue-50" />
  </svg>
);

interface WeatherData {
  temp: number;
  condition: string;
  wind: number;
  pressure: number;
  humidity: number;
}

// Reusable mapper for DB ads
const mapAdFromDB = (item: any): Ad => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: Number(item.price), 
    category: item.category,
    subCategory: item.sub_category,
    contact: item.contact,
    location: item.location,
    image: item.image || 'https://via.placeholder.com/800x600?text=No+Image',
    images: item.images || [item.image || 'https://via.placeholder.com/800x600?text=No+Image'],
    isPremium: item.is_premium,
    bookingAvailable: false,
    date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Недавно',
    reviews: [],
    specs: item.specs || {},
    status: item.status || 'approved'
});

// Helper to map Supabase user to App user
const mapSupabaseUser = (sbUser: any): User => {
  const metadata = sbUser.user_metadata || {};
  let isAdmin = false;
  let managedShopId = undefined;
  
  // Simple role mapping based on email for demo purposes
  // In production, this should be in a 'profiles' table or role claims
  if (sbUser.email === 'admin@snezhinsk.ru') isAdmin = true;
  if (sbUser.email === 'shop@snezhinsk.ru') managedShopId = 's1';
  if (sbUser.email === 'cinema@snezhinsk.ru') managedShopId = 'cinema1';

  return {
    id: sbUser.id,
    email: sbUser.email,
    phone: metadata.phone || '', // Store phone in metadata if collected later
    name: metadata.full_name || 'Пользователь',
    isLoggedIn: true,
    avatar: metadata.avatar_url,
    isAdmin,
    managedShopId
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Category | 'news'>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  
  // Cinema State
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Shop State
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isMerchantDashboardOpen, setIsMerchantDashboardOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cafes] = useState<Shop[]>(INITIAL_CAFES);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // New Features State
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxMileage: '',
      minRooms: '',
      floor: '',
      condition: '' // new filter for goods
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Admin State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Combine shops for lookup
  const allShops = [...shops, ...cafes];

  // Helper to add notification
  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
      const newNote = { id: Date.now(), message, type };
      setNotifications(prev => [...prev, newNote]);
  };

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Supabase Auth Listener
  useEffect(() => {
    if (!supabase) return;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
         setUser(mapSupabaseUser(session.user));
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appUser = mapSupabaseUser(session.user);
        setUser(appUser);
        // We don't need to manually store in localStorage, supabase handles persistence
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  // Supabase Data Fetching & Realtime (Ads)
  useEffect(() => {
    // If Supabase is not configured, stick with mock data
    if (!supabase) return;

    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
            console.warn('Supabase fetch error (falling back to mock data):', error.message);
        } else if (data) {
            const mappedAds = data.map(mapAdFromDB);
            
            // Merge with initial ads or replace. 
            const initialIds = new Set(INITIAL_ADS.map(a => a.id));
            const filteredMapped = mappedAds.filter(a => !initialIds.has(a.id));
            setAds([...filteredMapped, ...INITIAL_ADS]);
        }
      } catch (err) {
          console.warn('Unexpected error fetching ads:', err);
      }
    };

    fetchAds();

    // Realtime Subscription
    const channel = supabase
      .channel('public:ads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, (payload) => {
         if (payload.eventType === 'INSERT') {
            const newAd = mapAdFromDB(payload.new);
            setAds((prev) => {
                if (prev.some(a => a.id === newAd.id)) return prev;
                addNotification(`Новое объявление: ${newAd.title}`, 'info');
                return [newAd, ...prev];
            });
         } 
         else if (payload.eventType === 'UPDATE') {
            const updatedAd = mapAdFromDB(payload.new);
            setAds((prev) => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
         }
         else if (payload.eventType === 'DELETE') {
             setAds((prev) => prev.filter(ad => ad.id !== payload.old.id));
         }
      })
      .subscribe((status, err) => {
          if (err) console.warn('Realtime subscription error:', err);
      });

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  // Helper to switch tabs and reset filters
  const handleTabChange = (tab: Category | 'news') => {
    setActiveTab(tab);
    setSubCategoryFilter('');
    setSelectedAd(null);
    setSelectedShop(null);
    setSelectedNews(null); // Ensure news is cleared
    setFilters({ minPrice: '', maxPrice: '', minYear: '', maxMileage: '', minRooms: '', floor: '', condition: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Logic
  const addToCart = (product: Product, quantity: number, shopId?: string) => {
    const effectiveShopId = shopId || selectedShop?.id;
    if (!effectiveShopId) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.shopId === effectiveShopId);
      if (existingItem) {
        return prev.map(item => 
          (item.id === product.id && item.shopId === effectiveShopId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, shopId: effectiveShopId }];
    });
    addNotification(`Товар "${product.title}" добавлен в корзину`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const toggleFavorite = (adId: string) => {
      setFavorites(prev => {
          const isFav = prev.includes(adId);
          if (isFav) {
              return prev.filter(id => id !== adId);
          } else {
              addNotification('Добавлено в избранное', 'success');
              return [...prev, adId];
          }
      });
  };

  const handleUpdateUser = async (updatedUser: User) => {
      // Optimistic update
      setUser(updatedUser);
      
      // Update metadata in Supabase
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            full_name: updatedUser.name,
            // avatar_url: updatedUser.avatar - would require storage bucket, skipping for now
          }
        });
        if (error) {
           console.error("Failed to update user metadata", error);
           addNotification("Ошибка обновления профиля", "error");
        } else {
           addNotification('Профиль обновлен', 'success');
        }
      }
  };

  // Weather Fetch
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=56.08&longitude=60.73&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=ms',
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const code = data.current.weather_code;
        let condition = 'Ясно';
        
        if (code > 0 && code <= 3) { condition = 'Облачно'; }
        else if (code >= 45 && code <= 48) { condition = 'Туман'; }
        else if (code >= 51 && code <= 67) { condition = 'Дождь'; }
        else if (code >= 71 && code <= 77) { condition = 'Снег'; }
        else if (code >= 80 && code <= 82) { condition = 'Ливень'; }
        else if (code >= 85 && code <= 86) { condition = 'Снегопад'; }

        const pressureMmHg = Math.round(data.current.surface_pressure * 0.750062);

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition,
          wind: Math.round(data.current.wind_speed_10m),
          pressure: pressureMmHg,
          humidity: data.current.relative_humidity_2m
        });
      } catch (error) {
        setWeather({
          temp: -12,
          condition: 'Снег',
          wind: 4,
          pressure: 745,
          humidity: 82
        });
      }
    };
    
    fetchWeather();
  }, []);

  const handleCreateAd = async (form: CreateAdFormState) => {
    // Map form specs strings to number or keep string
    const specs: Ad['specs'] = {};
    if (form.specs?.year) specs.year = Number(form.specs.year);
    if (form.specs?.mileage) specs.mileage = Number(form.specs.mileage);
    if (form.specs?.rooms) specs.rooms = Number(form.specs.rooms);
    if (form.specs?.area) specs.area = Number(form.specs.area);
    if (form.specs?.floor) specs.floor = Number(form.specs.floor);
    if (form.specs?.condition) specs.condition = form.specs.condition as 'new' | 'used';
    if (form.specs?.brand) specs.brand = form.specs.brand;

    const newAd: Ad = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      subCategory: form.subCategory,
      contact: form.contact,
      location: form.location,
      image: form.images[0] || 'https://via.placeholder.com/800x600?text=No+Image',
      images: form.images,
      isPremium: form.isPremium,
      date: 'Только что',
      reviews: [],
      specs: Object.keys(specs).length > 0 ? specs : undefined,
      status: 'pending' // Default status is pending for regular users
    };

    // If Supabase is connected, we will rely on Realtime for the update OR re-fetch
    if (supabase) {
        addNotification('Отправка...', 'info');
        try {
            const { error } = await supabase.from('ads').insert({
                title: newAd.title,
                description: newAd.description,
                price: newAd.price,
                category: newAd.category,
                sub_category: newAd.subCategory,
                contact: newAd.contact,
                location: newAd.location,
                image: newAd.image,
                images: newAd.images,
                is_premium: newAd.isPremium,
                specs: newAd.specs,
                status: 'pending',
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error('Error creating ad in DB:', error.message);
                addNotification('Ошибка при сохранении (проверьте консоль)', 'error');
            } else {
                addNotification('Объявление отправлено!', 'success');
            }
        } catch (err) {
            console.error('Supabase Insert Exception:', err);
            addNotification('Ошибка сети', 'error');
        }
    } else {
        // Fallback for offline mode
        setAds([newAd, ...ads]);
        addNotification('Объявление создано (оффлайн режим)', 'success');
    }
    
    handleTabChange('all');
  };

  const handleUpdateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
      // Optimistic UI update
      setAds(prev => {
          if (status === 'rejected') {
              return prev.filter(ad => ad.id !== adId);
          }
          return prev.map(ad => ad.id === adId ? { ...ad, status } : ad);
      });
      
      if (supabase) {
          supabase.from('ads').update({ status }).eq('id', adId).then(({ error }) => {
              if (error) { 
                  console.error('Error updating status:', error);
                  addNotification('Ошибка обновления статуса', 'error');
              }
          });
      }
  };

  const handleUpdateAdContent = (adId: string, updatedFields: Partial<Ad>) => {
      // Optimistic UI update
      setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, ...updatedFields } : ad));
      addNotification('Объявление обновлено', 'success');
      
       if (supabase) {
          // Map back to snake_case if needed
          const dbFields: any = { ...updatedFields };
          if (updatedFields.isPremium !== undefined) {
              dbFields.is_premium = updatedFields.isPremium;
              delete dbFields.isPremium;
          }
          if (updatedFields.subCategory !== undefined) {
              dbFields.sub_category = updatedFields.subCategory;
              delete dbFields.subCategory;
          }
          
          supabase.from('ads').update(dbFields).eq('id', adId).then(({ error }) => {
               if (error) console.error('Error updating content:', error);
          });
       }
  };

  const handleAddNews = (newsItem: NewsItem) => {
      setNews([newsItem, ...news]);
  };

  const handleAddReview = (adId: string, rating: number, text: string) => {
     setAds(prevAds => prevAds.map(ad => {
         if (ad.id === adId) {
             const newReview: Review = {
                 id: Date.now().toString(),
                 author: user ? user.name || 'Пользователь' : 'Гость',
                 rating,
                 text,
                 date: 'Сегодня'
             };
             const currentReviews = ad.reviews || [];
             const updatedAd = { ...ad, reviews: [newReview, ...currentReviews] };
             if (selectedAd && selectedAd.id === adId) {
                 setSelectedAd(updatedAd);
             }
             return updatedAd;
         }
         return ad;
     }));
     addNotification('Спасибо за ваш отзыв!', 'success');
  };

  const filteredAds = ads.filter(ad => {
    // 0. Only show approved ads (or if user is admin/owner - logic simplified here)
    if (ad.status !== 'approved') return false;

    // 1. Basic Filters
    const matchesCategory = activeTab === 'all' || ad.category === activeTab;
    const matchesSubCategory = !subCategoryFilter || ad.subCategory === subCategoryFilter;
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Advanced Filters
    let matchesAdvanced = true;
    if (filters.minPrice && ad.price < Number(filters.minPrice)) matchesAdvanced = false;
    if (filters.maxPrice && ad.price > Number(filters.maxPrice)) matchesAdvanced = false;

    // Specs Filtering
    if (ad.specs) {
        if (filters.minYear && (!ad.specs.year || ad.specs.year < Number(filters.minYear))) matchesAdvanced = false;
        if (filters.maxMileage && (!ad.specs.mileage || ad.specs.mileage > Number(filters.maxMileage))) matchesAdvanced = false;
        if (filters.minRooms && (!ad.specs.rooms || ad.specs.rooms < Number(filters.minRooms))) matchesAdvanced = false;
        if (filters.floor && (!ad.specs.floor || ad.specs.floor !== Number(filters.floor))) matchesAdvanced = false;
        if (filters.condition && (!ad.specs.condition || ad.specs.condition !== filters.condition)) matchesAdvanced = false;
    }

    return matchesCategory && matchesSubCategory && matchesSearch && matchesAdvanced;
  });

  const premiumAds = filteredAds.filter(ad => ad.isPremium);
  const standardAds = filteredAds.filter(ad => !ad.isPremium);

  const handleUpdateShop = (updatedShop: Shop) => {
      setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
  };

  // Determine which advanced filters to show
  const showCarFilters = activeTab === 'sale' && subCategoryFilter === 'Автомобили';
  const showRealEstateFilters = (activeTab === 'sale' || activeTab === 'rent') && 
                                (subCategoryFilter === 'Квартиры' || subCategoryFilter === 'Дома, дачи');
  
  // Show Goods filters for relevant categories (Electronics, etc)
  const isGoodsCategory = activeTab === 'sale' && !showCarFilters && !showRealEstateFilters && 
                          subCategoryFilter !== '' && subCategoryFilter !== 'Земельные участки' && subCategoryFilter !== 'Гаражи';

  // Get current subcategories for chips
  const activeCatalogCategory = SERVICE_CATALOG.find(c => c.id === activeTab);
  const subCategories = activeCatalogCategory ? activeCatalogCategory.groups.flatMap(g => g.items) : [];

  return (
    <div className="min-h-screen bg-background text-dark font-sans selection:bg-primary/20">
      
      <ToastNotification notifications={notifications} onRemove={removeNotification} />

      {/* Mobile Header */}
      <header className="lg:hidden bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCatalogOpen(true)} className="p-2 -ml-2 text-dark">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('all')}>
               <SnezhikLogo className="w-8 h-8 text-primary" />
               <h1 className="text-xl font-extrabold text-primary tracking-tight">Твой<span className="text-dark">Снежинск</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {user ? (
                <div 
                    onClick={() => setIsUserProfileOpen(true)}
                    className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer border border-gray-300"
                >
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{user.name?.charAt(0) || user.email.charAt(0)}</div>}
                </div>
             ) : (
                <button onClick={() => setIsLoginOpen(true)} className="text-sm font-bold text-dark bg-gray-100 px-3 py-2 rounded-lg">
                  Войти
                </button>
             )}
          </div>
        </div>
        
        {/* Stories Bar (Mobile) */}
        {!selectedAd && !selectedShop && !selectedNews && <StoriesBar stories={INITIAL_STORIES} />}

        {/* Mobile Filter Tabs */}
        {!selectedAd && !selectedShop && !selectedNews && (
          <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
             <button onClick={() => handleTabChange('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-dark text-white' : 'bg-white text-secondary border border-gray-200'}`}>Все</button>
             <button onClick={() => handleTabChange('sale')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'sale' ? 'bg-green-500 text-white' : 'bg-white text-secondary border border-gray-200'}`}>Продажа</button>
             <button onClick={() => handleTabChange('rent')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'rent' ? 'bg-blue-500 text-white' : 'bg-white text-secondary border border-gray-200'}`}>Аренда</button>
             <button onClick={() => handleTabChange('services')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'services' ? 'bg-purple-500 text-white' : 'bg-white text-secondary border border-gray-200'}`}>Услуги</button>
             <button onClick={() => handleTabChange('jobs')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'jobs' ? 'bg-orange-500 text-white' : 'bg-white text-secondary border border-gray-200'}`}>Работа</button>
             <button onClick={() => handleTabChange('shops')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1 ${activeTab === 'shops' ? 'bg-emerald-600 text-white' : 'bg-white text-secondary border border-gray-200'}`}>
                 <span>🛍️</span> Магазины
             </button>
             <button onClick={() => handleTabChange('cafes')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1 ${activeTab === 'cafes' ? 'bg-rose-600 text-white' : 'bg-white text-secondary border border-gray-200'}`}>
                 <span>☕</span> Кафе
             </button>
             <button onClick={() => handleTabChange('cinema')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1 ${activeTab === 'cinema' ? 'bg-gray-800 text-white' : 'bg-white text-secondary border border-gray-200'}`}>
                 <span>🍿</span> Кино
             </button>
             <button onClick={() => handleTabChange('news')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTab === 'news' ? 'bg-red-500 text-white' : 'bg-white text-secondary border border-gray-200'}`}>Новости</button>
             <button onClick={() => setIsPartnerModalOpen(true)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1 bg-white text-dark border border-gray-200 shadow-sm`}>
                <span>💼</span> Бизнес
             </button>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6 sticky top-6 h-fit">
            {/* Logo */}
            <div className="px-2 mb-2 cursor-pointer flex items-center gap-3" onClick={() => handleTabChange('all')}>
               <SnezhikLogo className="w-12 h-12 text-primary" />
               <h1 className="text-2xl font-extrabold text-primary tracking-tight">Твой<br/><span className="text-dark">Снежинск</span></h1>
            </div>

            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-5 shadow-lg shadow-primary/30 text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               
               <h3 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-4 relative z-10">Погода в Снежинске</h3>
               <div className="flex items-baseline gap-2 mb-6 relative z-10">
                 <span className="text-5xl font-extrabold tracking-tighter">
                    {weather ? `${weather.temp > 0 ? '+' : ''}${weather.temp}°` : '--'}
                 </span>
                 <span className="text-sm font-medium text-blue-100">{weather ? weather.condition : 'Загрузка...'}</span>
               </div>
               
               {weather && (
                   <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm relative z-10">
                       <div>
                           <p className="text-xs text-blue-200 mb-1">Ветер</p>
                           <p className="font-semibold">{weather.wind} м/с</p>
                       </div>
                       <div>
                           <p className="text-xs text-blue-200 mb-1">Давление</p>
                           <p className="font-semibold">{weather.pressure} мм</p>
                       </div>
                   </div>
               )}
            </div>

             {/* Admin Panel Button */}
             {user && user.isAdmin && (
                <button 
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm">Админ. панель</span>
                        </div>
                    </div>
                </button>
            )}

            {/* Merchant Dashboard Button */}
            {user && user.managedShopId && (
                <button 
                  onClick={() => setIsMerchantDashboardOpen(true)}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-3 rounded-xl shadow-lg shadow-gray-400/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-sm">{user.managedShopId.startsWith('cinema') ? 'Кабинет Кино' : 'Мой бизнес'}</span>
                        </div>
                    </div>
                </button>
            )}

            {/* Navigation */}
            <nav className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1">
               <SidebarItem 
                 label="Все объявления" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                 active={activeTab === 'all' && !selectedAd && !selectedShop && !selectedNews} 
                 onClick={() => handleTabChange('all')} 
               />
               <SidebarItem 
                 label="Продажа" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                 active={activeTab === 'sale' && !selectedAd && !selectedShop && !selectedNews} 
                 onClick={() => handleTabChange('sale')} 
               />
               <SidebarItem 
                 label="Аренда" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                 active={activeTab === 'rent' && !selectedAd && !selectedShop && !selectedNews} 
                 onClick={() => handleTabChange('rent')} 
               />
               <SidebarItem 
                 label="Услуги" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                 active={activeTab === 'services' && !selectedAd && !selectedShop && !selectedNews} 
                 onClick={() => handleTabChange('services')} 
               />
               <SidebarItem 
                 label="Работа" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                 active={activeTab === 'jobs' && !selectedAd && !selectedShop && !selectedNews} 
                 onClick={() => handleTabChange('jobs')} 
               />
               
               <div className="my-2 border-t border-gray-100 mx-2"></div>

               <SidebarItem 
                 label="Магазины" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                 active={activeTab === 'shops' && !selectedShop} 
                 onClick={() => handleTabChange('shops')} 
               />

               <SidebarItem 
                 label="Кафе" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
                 active={activeTab === 'cafes' && !selectedShop} 
                 onClick={() => handleTabChange('cafes')} 
               />

               <SidebarItem 
                 label="Кино" 
                 icon={<span className="text-xl leading-none">🍿</span>}
                 active={activeTab === 'cinema'} 
                 onClick={() => handleTabChange('cinema')} 
               />
               <SidebarItem 
                 label="Новости" 
                 icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                 active={activeTab === 'news' && !selectedNews} 
                 onClick={() => handleTabChange('news')} 
               />

               <div className="my-2 border-t border-gray-100 mx-2"></div>

               <button 
                 onClick={() => setIsCatalogOpen(true)}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-secondary hover:bg-gray-50 hover:text-dark"
               >
                 <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                 </div>
                 Весь каталог
               </button>
            </nav>

            {/* Business Partner Banner */}
            <div 
              onClick={() => setIsPartnerModalOpen(true)}
              className="bg-dark rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-dark/20 transition-transform hover:-translate-y-1"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-white/10"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

               <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">Бизнес</span>
                  <h3 className="font-bold text-lg leading-tight mb-2">Подключите свой бизнес</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-3">Кинотеатры, бани, услуги. Онлайн-бронирование.</p>
                  <button className="w-full bg-white/10 hover:bg-white text-white hover:text-dark text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Стать партнером
                  </button>
               </div>
            </div>

          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-grow min-w-0">
             
             {/* Header / Search (Desktop) */}
             <div className="hidden lg:flex justify-between items-center mb-8 bg-surface p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full max-w-md">
                   <input 
                     type="text" 
                     placeholder="Поиск по объявлениям, товарам..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                   />
                   <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setIsCreateModalOpen(true)}
                     className="bg-dark text-white hover:bg-black px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-dark/20 flex items-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                     Подать объявление
                   </button>
                   
                   <div className="h-8 w-px bg-gray-200 mx-2"></div>

                   {user ? (
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsUserProfileOpen(true)}>
                         <div className="text-right">
                            <p className="text-sm font-bold text-dark">{user.name}</p>
                            <p className="text-xs text-secondary">{user.isAdmin ? 'Администратор' : user.managedShopId ? (user.managedShopId.startsWith('cinema') ? 'Кинотеатр' : 'Владелец') : 'Личный кабинет'}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0) || user.email.charAt(0)}
                         </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => setIsLoginOpen(true)}
                        className="font-bold text-dark hover:text-primary transition-colors flex items-center gap-2"
                      >
                        Войти
                      </button>
                   )}
                </div>
             </div>

             {/* Subcategory Chips (Horizontal Scroll) */}
             {activeCatalogCategory && !selectedAd && !selectedShop && !selectedNews && (
                <div className="mb-6 overflow-x-auto pb-2 no-scrollbar animate-fade-in-up">
                    <div className="flex gap-2">
                        <button
                           onClick={() => setSubCategoryFilter('')}
                           className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!subCategoryFilter ? 'bg-dark text-white border-dark shadow-md' : 'bg-white text-secondary border-gray-200 hover:border-primary hover:text-primary'}`}
                        >
                            Все
                        </button>
                        {subCategories.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setSubCategoryFilter(sub)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${subCategoryFilter === sub ? 'bg-dark text-white border-dark shadow-md' : 'bg-white text-secondary border-gray-200 hover:border-primary hover:text-primary'}`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>
             )}

             {/* Advanced Filters (Conditional) */}
             {!selectedAd && !selectedShop && !selectedNews && (showCarFilters || showRealEstateFilters || isGoodsCategory) && (
                <div className="mb-6 bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-xs font-bold text-secondary mb-1 block">Цена, ₽</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="От" 
                                    value={filters.minPrice}
                                    onChange={e => setFilters({...filters, minPrice: e.target.value})}
                                    className="w-28 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                />
                                <input 
                                    type="number" 
                                    placeholder="До" 
                                    value={filters.maxPrice}
                                    onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                                    className="w-28 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                />
                            </div>
                        </div>
                        
                        {showCarFilters && (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-secondary mb-1 block">Год выпуска</label>
                                    <input 
                                        type="number" 
                                        placeholder="От 2010" 
                                        value={filters.minYear}
                                        onChange={e => setFilters({...filters, minYear: e.target.value})}
                                        className="w-28 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary mb-1 block">Пробег до, км</label>
                                    <input 
                                        type="number" 
                                        placeholder="150000" 
                                        value={filters.maxMileage}
                                        onChange={e => setFilters({...filters, maxMileage: e.target.value})}
                                        className="w-28 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                    />
                                </div>
                            </>
                        )}

                        {showRealEstateFilters && (
                             <>
                                <div>
                                    <label className="text-xs font-bold text-secondary mb-1 block">Комнат</label>
                                    <input 
                                        type="number" 
                                        placeholder="От 1" 
                                        value={filters.minRooms}
                                        onChange={e => setFilters({...filters, minRooms: e.target.value})}
                                        className="w-20 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary mb-1 block">Этаж</label>
                                    <input 
                                        type="number" 
                                        placeholder="Любой" 
                                        value={filters.floor}
                                        onChange={e => setFilters({...filters, floor: e.target.value})}
                                        className="w-20 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none" 
                                    />
                                </div>
                             </>
                        )}

                        {isGoodsCategory && (
                            <div>
                                <label className="text-xs font-bold text-secondary mb-1 block">Состояние</label>
                                <select 
                                    value={filters.condition}
                                    onChange={e => setFilters({...filters, condition: e.target.value})}
                                    className="w-32 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm outline-none cursor-pointer" 
                                >
                                    <option value="">Любое</option>
                                    <option value="new">Новое</option>
                                    <option value="used">Б/У</option>
                                </select>
                            </div>
                        )}
                        
                        <button onClick={() => setFilters({ minPrice: '', maxPrice: '', minYear: '', maxMileage: '', minRooms: '', floor: '', condition: '' })} className="text-xs text-primary font-bold underline pb-2">
                            Сбросить
                        </button>
                    </div>
                </div>
             )}

             {/* Dynamic Content */}
             {selectedAd ? (
               <AdPage 
                  ad={selectedAd} 
                  onBack={() => setSelectedAd(null)}
                  onAddReview={handleAddReview}
               />
             ) : selectedShop ? (
                <ShopPage
                    shop={selectedShop}
                    onBack={() => setSelectedShop(null)}
                    variant={activeTab === 'cafes' ? 'cafe' : 'shop'}
                    onProductClick={setSelectedProduct}
                />
             ) : selectedNews ? (
                <NewsPage 
                    news={selectedNews} 
                    onBack={() => setSelectedNews(null)} 
                />
             ) : activeTab === 'news' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                   {news.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => setSelectedNews(n)}
                        className="group bg-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col"
                      >
                         <div className="h-48 overflow-hidden relative">
                            <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 left-4">
                               <span className="bg-surface/90 backdrop-blur text-dark text-xs font-bold px-3 py-1 rounded-full">{n.category}</span>
                            </div>
                         </div>
                         <div className="p-6 flex-grow flex flex-col">
                            <span className="text-xs text-secondary mb-2 block">{n.date}</span>
                            <h3 className="text-xl font-bold text-dark mb-3 leading-tight group-hover:text-primary transition-colors">{n.title}</h3>
                            <p className="text-secondary text-sm line-clamp-3 mb-4 flex-grow">{n.excerpt}</p>
                            <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit">
                               Читать далее 
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
             ) : activeTab === 'shops' ? (
                 <div className="animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-dark mb-6">Магазины Снежинска</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {shops.map(shop => (
                            <ShopCard 
                                key={shop.id} 
                                shop={shop} 
                                onClick={setSelectedShop}
                            />
                        ))}
                    </div>
                 </div>
             ) : activeTab === 'cafes' ? (
                <div className="animate-fade-in-up">
                   <h2 className="text-2xl font-bold text-dark mb-6">Кафе и Рестораны</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                       {cafes.map(cafe => (
                           <ShopCard 
                               key={cafe.id} 
                               shop={cafe} 
                                onClick={setSelectedShop}
                           />
                       ))}
                   </div>
                </div>
             ) : activeTab === 'cinema' ? (
                <div className="animate-fade-in-up">
                   <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                       Кинотеатр "Космос" <span className="text-sm font-normal text-secondary bg-gray-100 px-2 py-1 rounded-lg">Сегодня</span>
                   </h2>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                       {movies.map(movie => (
                           <div 
                             key={movie.id}
                             onClick={() => setSelectedMovie(movie)}
                             className="group relative bg-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col h-full"
                           >
                               <div className="aspect-[2/3] relative overflow-hidden">
                                   <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   <div className="absolute top-4 left-4">
                                       <span className="bg-black/70 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">{movie.ageLimit}</span>
                                   </div>
                                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                       <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
                                           <span className="text-yellow-400">★ {movie.rating}</span>
                                           <span>•</span>
                                           <span className="truncate">{movie.genre}</span>
                                       </div>
                                   </div>
                               </div>
                               <div className="p-5 flex-grow flex flex-col">
                                   <h3 className="text-xl font-bold text-dark mb-2 leading-tight group-hover:text-primary transition-colors">{movie.title}</h3>
                                   <div className="flex flex-wrap gap-2 mt-auto">
                                       {movie.showtimes.slice(0, 3).map(time => (
                                           <span key={time} className="bg-gray-100 text-dark text-sm font-medium px-3 py-1 rounded-lg border border-gray-200">
                                               {time}
                                           </span>
                                       ))}
                                       <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-lg flex items-center ml-auto">
                                           от {movie.price}₽
                                       </span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
             ) : (
                <>
                   {/* Mobile Create Ad Button (Floating) */}
                   <button 
                     onClick={() => setIsCreateModalOpen(true)}
                     className="lg:hidden fixed bottom-6 right-6 z-30 bg-dark text-white p-4 rounded-full shadow-2xl shadow-dark/40 active:scale-90 transition-transform"
                   >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                   </button>
                   
                   {/* Active Filter Indicator */}
                   {subCategoryFilter && (
                      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
                         <span className="text-secondary text-sm">Фильтр:</span>
                         <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                            {subCategoryFilter}
                            <button onClick={() => setSubCategoryFilter('')} className="hover:text-white/80">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                         </div>
                      </div>
                   )}

                   <div className="animate-fade-in-up space-y-10">
                      {/* VIP Section */}
                      {premiumAds.length > 0 && (
                        <div>
                           <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-dark">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              </span>
                              VIP Объявления
                           </h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {premiumAds.map(ad => (
                                 <AdCard 
                                   key={ad.id} 
                                   ad={ad} 
                                   onShow={(ad) => setSelectedAd(ad)} 
                                   isFavorite={favorites.includes(ad.id)}
                                   onToggleFavorite={toggleFavorite}
                                 />
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Standard Section */}
                      {standardAds.length > 0 && (
                        <div>
                           {premiumAds.length > 0 && <h2 className="text-lg font-bold mb-4 text-dark flex items-center gap-2">Все предложения</h2>}
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {standardAds.map(ad => (
                                 <AdCard 
                                   key={ad.id} 
                                   ad={ad} 
                                   onShow={(ad) => setSelectedAd(ad)} 
                                   isFavorite={favorites.includes(ad.id)}
                                   onToggleFavorite={toggleFavorite}
                                 />
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                   
                   {filteredAds.length === 0 && (
                      <div className="text-center py-20">
                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <h3 className="text-xl font-bold text-dark mb-2">Ничего не найдено</h3>
                         <p className="text-secondary max-w-xs mx-auto">Попробуйте изменить категорию или поисковый запрос</p>
                         <button onClick={() => {setSearchQuery(''); setFilters({ minPrice: '', maxPrice: '', minYear: '', maxMileage: '', minRooms: '', floor: '', condition: '' }); handleTabChange('all');}} className="mt-6 text-primary font-bold hover:underline">
                            Сбросить фильтры
                         </button>
                      </div>
                   )}
                </>
             )}

          </main>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 lg:right-10 z-50 bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 active:scale-95 transition-transform animate-fade-in-up"
        >
          <div className="relative">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.length}
             </span>
          </div>
        </button>
      )}

      <CreateAdModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateAd}
        catalog={SERVICE_CATALOG}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      
      {/* New User Profile Modal */}
      {user && (
          <UserProfileModal
            isOpen={isUserProfileOpen}
            onClose={() => setIsUserProfileOpen(false)}
            user={user}
            favorites={favorites}
            allAds={ads}
            onLogout={async () => {
              if (supabase) {
                await supabase.auth.signOut();
              } else {
                setUser(null);
                localStorage.removeItem('snezhinsk_user');
              }
              setIsUserProfileOpen(false); 
              addNotification('Вы вышли из системы');
            }}
            onToggleFavorite={toggleFavorite}
            onShowAd={setSelectedAd}
            onUpdateUser={handleUpdateUser}
            onOpenAdminPanel={() => { setIsAdminPanelOpen(true); setIsUserProfileOpen(false); }}
            onOpenMerchantDashboard={() => { setIsMerchantDashboardOpen(true); setIsUserProfileOpen(false); }}
          />
      )}
      
      {/* Admin Panel */}
      <AdminPanel 
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          ads={ads}
          onUpdateAdStatus={handleUpdateAdStatus}
          onUpdateAdContent={handleUpdateAdContent}
          onAddNews={handleAddNews}
      />

      <ServiceCatalogModal
         isOpen={isCatalogOpen}
         onClose={() => setIsCatalogOpen(false)}
         catalog={SERVICE_CATALOG}
         initialCategory={activeTab === 'cinema' || activeTab === 'shops' || activeTab === 'cafes' || activeTab === 'news' ? 'sale' : activeTab as Category}
         onSelect={(cat, sub) => {
            setActiveTab(cat);
            setSubCategoryFilter(sub);
            setIsCatalogOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
         }}
      />
      
      <MovieBookingModal
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {user && user.managedShopId && (
        <MerchantDashboard
          isOpen={isMerchantDashboardOpen}
          onClose={() => setIsMerchantDashboardOpen(false)}
          shop={shops.find(s => s.id === user.managedShopId) || shops[0]}
          onUpdateShop={handleUpdateShop}
          movies={movies}
          onUpdateMovies={setMovies}
        />
      )}

      <ProductDetailsModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={(p, q) => addToCart(p, q, selectedShop?.id)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        shops={allShops}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
      />

    </div>
  );
}
