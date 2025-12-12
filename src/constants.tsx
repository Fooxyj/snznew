
import { Ad, Business, NewsItem, User, UserRole, Event } from './types';

// Helper for dynamic dates in mock data
const getPastDate = (days: number, hours: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

export const WORK_SCHEDULES = [
  "08:00 - 17:00",
  "08:00 - 20:00",
  "08:00 - 21:00",
  "08:00 - 22:00",
  "09:00 - 18:00",
  "09:00 - 19:00",
  "09:00 - 20:00",
  "09:00 - 21:00",
  "09:00 - 22:00",
  "09:00 - 23:00",
  "10:00 - 19:00",
  "10:00 - 20:00",
  "10:00 - 21:00",
  "10:00 - 22:00",
  "10:00 - 23:00",
  "11:00 - 23:00",
  "12:00 - 00:00",
  "Круглосуточно",
  "Пн-Пт 09:00-18:00, Сб-Вс 10:00-16:00"
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Алексей С.',
  avatar: 'https://picsum.photos/seed/user1/100/100',
  role: UserRole.USER,
  xp: 1450, // Level 2
  email: 'alex@snz.ru',
  favorites: ['b1', 'a2']
};

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'n1',
    title: 'Реконструкция набережной озера Синара завершится к осени',
    category: 'Город',
    image: 'https://picsum.photos/seed/news1/600/400',
    date: '2024-05-20T10:00:00Z',
    views: 1205,
    commentsCount: 34,
    content: 'В Снежинске продолжаются работы по благоустройству...'
  },
  {
    id: 'n2',
    title: 'Открытие нового спорткомплекса "Айсберг"',
    category: 'Новости спорта',
    image: 'https://picsum.photos/seed/news2/600/400',
    date: '2024-05-19T15:30:00Z',
    views: 850,
    commentsCount: 12,
    content: 'Торжественное открытие состоится в субботу...'
  },
  {
    id: 'n3',
    title: 'График отключения горячей воды на июль',
    category: 'ЖКХ',
    image: 'https://picsum.photos/seed/news3/600/400',
    date: '2024-05-18T09:00:00Z',
    views: 3400,
    commentsCount: 156,
    content: 'Публикуем полный список адресов...'
  }
];

export const ADS_DATA: Ad[] = [
  {
    id: 'a1',
    title: 'Велосипед горный GT Avalanche, состояние нового',
    price: 45000,
    currency: '₽',
    category: 'Транспорт',
    image: 'https://picsum.photos/seed/bike/400/300',
    date: getPastDate(0, 2), // Today, 2 hours ago
    authorId: 'u2',
    description: 'Продам велосипед, катался пару раз. Дисковые тормоза, 27 скоростей.',
    location: 'ул. Ленина',
    isVip: true,
    status: 'approved'
  },
  {
    id: 'a2',
    title: '1-к квартира, 38 м², центр города',
    price: 2500000,
    currency: '₽',
    category: 'Недвижимость',
    image: 'https://picsum.photos/seed/flat/400/300',
    date: getPastDate(1, 5), // Yesterday
    authorId: 'u3',
    description: 'Уютная квартира в центре. Евроремонт.',
    location: 'ул. Васильева',
    isVip: true,
    status: 'approved'
  },
  {
    id: 'a3',
    title: 'Репетитор по математике (ЕГЭ/ОГЭ)',
    price: 800,
    currency: '₽/час',
    category: 'Услуги',
    image: 'https://picsum.photos/seed/math/400/300',
    date: getPastDate(3, 0), // 3 days ago
    authorId: 'u4',
    description: 'Подготовка к ЕГЭ и ОГЭ. Опыт 10 лет.',
    location: 'Онлайн',
    isPremium: true,
    status: 'approved'
  },
  {
    id: 'a4',
    title: 'Игровой ноутбук ASUS ROG',
    price: 85000,
    currency: '₽',
    category: 'Электроника',
    image: 'https://picsum.photos/seed/laptop/400/300',
    date: getPastDate(0, 1), // Today
    authorId: 'u5',
    description: 'Мощный игровой ноутбук. RTX 3060, Ryzen 7.',
    location: 'ул. Дзержинского',
    isPremium: true,
    status: 'approved'
  },
  {
    id: 'a5',
    title: 'Детская коляска 3 в 1',
    price: 12000,
    currency: '₽',
    category: 'Личные вещи',
    image: 'https://picsum.photos/seed/stroller/400/300',
    date: getPastDate(5, 0), // 5 days ago
    authorId: 'u6',
    description: 'В отличном состоянии, после одного ребенка.',
    location: 'ул. Мира',
    status: 'approved'
  }
];

export const BUSINESS_DATA: Business[] = [
  {
    id: 'b1',
    name: 'Кофейня "Снежинка"',
    category: 'Кафе и рестораны',
    rating: 4.8,
    reviewsCount: 120,
    address: 'ул. Свердлова, 15',
    image: 'https://picsum.photos/seed/cafe/400/300',
    coverImage: 'https://picsum.photos/seed/cafecover/800/400',
    description: 'Лучший кофе в городе и свежая выпечка.',
    lat: 50,
    lng: 50,
    phone: '+7 (900) 123-45-67',
    workHours: '08:00 - 22:00'
  },
  {
    id: 'b2',
    name: 'Спортзал "Титан"',
    category: 'Спортзалы и секции',
    rating: 4.5,
    reviewsCount: 85,
    address: 'ул. Победы, 10',
    image: 'https://picsum.photos/seed/gym/400/300',
    coverImage: 'https://picsum.photos/seed/gymcover/800/400',
    description: 'Тренажерный зал, кардио, групповые программы.',
    lat: 60,
    lng: 40,
    phone: '+7 (900) 555-44-33',
    workHours: '07:00 - 23:00'
  },
  {
    id: 'b3',
    name: 'Кинотеатр "Космос"',
    category: 'Кино',
    rating: 4.2,
    reviewsCount: 230,
    address: 'пр. Мира, 5',
    image: 'https://picsum.photos/seed/cinema/400/300',
    coverImage: 'https://picsum.photos/seed/cinemacover/800/400',
    description: 'Новинки кино в 3D и 2D.',
    lat: 40,
    lng: 60,
    phone: '+7 (351) 462-22-22',
    workHours: '10:00 - 02:00'
  },
  {
    id: 'b4',
    name: 'Медицинский центр "Санита"',
    category: 'Медицинские центры',
    rating: 4.7,
    reviewsCount: 154,
    address: 'ул. Дзержинского, 39',
    image: 'https://picsum.photos/seed/sanita/400/300',
    coverImage: 'https://picsum.photos/seed/sanitacover/800/400',
    description: 'Многопрофильная клиника для всей семьи. Прием ведут квалифицированные специалисты. УЗИ, анализы, процедуры.',
    lat: 56.086,
    lng: 60.739,
    phone: '+7 (35146) 3-62-02',
    workHours: 'Пн-Пт 08:00-20:00'
  }
];

export const EVENTS_DATA: Event[] = [
  {
    id: 'e1',
    title: 'День города 2024',
    date: '12 июня, 10:00',
    image: 'https://picsum.photos/seed/cityday/400/200',
    location: 'Площадь Ленина',
    category: 'Праздник'
  },
  {
    id: 'e2',
    title: 'Выставка "Уральские самоцветы"',
    date: 'до 30 июня',
    image: 'https://picsum.photos/seed/gems/400/200',
    location: 'Музей истории',
    category: 'Выставки'
  }
];

export const CATEGORIES = [
  { id: 'news', label: 'Новости', icon: 'Newspaper' },
  { id: 'shops', label: 'Магазины', icon: 'ShoppingBag' },
  { id: 'cafe', label: 'Кафе и рестораны', icon: 'Coffee' },
  { id: 'rent', label: 'Аренда и Отдых', icon: 'Key' }, 
  { id: 'cinema', label: 'Кино', icon: 'Film' },
  { id: 'tourism', label: 'Туризм', icon: 'Map' },
  { id: 'culture', label: 'Культура', icon: 'Drama' }, 
  { id: 'beauty', label: 'Красота', icon: 'Scissors' },
  { id: 'sport', label: 'Спортзалы и секции', icon: 'Dumbbell' },
  { id: 'med', label: 'Медицина', icon: 'Stethoscope' },
  { id: 'transport', label: 'Транспорт', icon: 'Bus' },
  { id: 'cargo', label: 'Грузоперевозки', icon: 'Truck' },
  { id: 'carwash', label: 'Автомойки', icon: 'Droplets' },
  { id: 'autoservice', label: 'Автосервисы', icon: 'Wrench' },
  { id: 'med_org', label: 'Медицинские Организации', icon: 'Stethoscope' },
  { id: 'med_center', label: 'Медицинские центры', icon: 'Stethoscope' },
  { id: 'taxi', label: 'Такси', icon: 'Car' },
  { id: 'emergency', label: 'Экстренные', icon: 'Siren' },
];

export const CATALOG_MENU = [
  {
    id: 'news_section',
    title: 'Новости',
    icon: 'Newspaper',
    path: '/news',
    submenu: [
      { title: 'Администрация', path: '/news?cat=Новости администрации' },
      { title: 'ВНИИТФ', path: '/news?cat=Новости ВНИИТФ' },
      { title: 'Культура', path: '/news?cat=Новости культуры' },
      { title: 'Спорт', path: '/news?cat=Новости спорта' },
      { title: 'ЖКХ', path: '/news?cat=ЖКХ' },
      { title: 'Город', path: '/news?cat=Город' },
      { title: 'Прочее', path: '/news?cat=Прочее' },
    ]
  },
  {
    id: 'culture_section',
    title: 'Культура',
    icon: 'Drama',
    path: '/events',
    submenu: [
      { title: 'Афиша', path: '/events', icon: 'Calendar' },
      { title: 'Концерты', path: '/events?cat=Концерт' },
      { title: 'Выставки', path: '/events?cat=Выставки' },
      { title: 'Премьеры', path: '/events?cat=Премьеры' },
      { title: 'Новости культуры', path: '/news?cat=Новости культуры' },
    ]
  },
  {
    id: 'services_section',
    title: 'Услуги',
    icon: 'ShoppingBag',
    submenu: [
      { title: 'Кафе и рестораны', path: '/category/cafe' },
      { title: 'Спортивные залы', path: '/category/sport' },
      { title: 'Аренда и Отдых', path: '/category/rent' },
      { title: 'Красота', path: '/category/beauty' },
      { title: 'Кино', path: '/category/cinema' },
      { title: 'Грузоперевозки', path: '/category/cargo' },
      { title: 'Туризм', path: '/category/tourism' },
      { title: 'Автомойки', path: '/category/carwash' },
      { title: 'Автосервисы', path: '/category/autoservice' },
    ]
  },
  {
    id: 'med_section',
    title: 'Медицина',
    icon: 'Stethoscope',
    submenu: [
      { title: 'Медицинские Организации', path: '/category/med_org' },
      { title: 'Медицинские центры', path: '/category/med_center' },
    ]
  },
  {
    id: 'transport_section',
    title: 'Транспорт',
    icon: 'Bus',
    submenu: [
      { title: 'Расписание автобусов', path: '/category/transport' },
      { title: 'Такси', path: '/category/taxi' },
    ]
  }
];

export const SERVICES_MENU = [
  {
    id: 'city_environment',
    title: 'Городская среда',
    icon: 'Building2',
    submenu: [
      { title: 'Доска объявлений', path: '/classifieds', icon: 'ShoppingBag' },
      { title: 'Работа', path: '/jobs', icon: 'Briefcase' },
      { title: 'Попутчики', path: '/rides', icon: 'Car' },
      { title: 'Прокат вещей', path: '/rentals', icon: 'Repeat' },
      { title: 'Бюро находок', path: '/lost-found', icon: 'HelpCircle' },
      { title: 'Погода', path: '/weather', icon: 'Cloud' },
    ]
  },
  {
    id: 'social_group',
    title: 'Социум',
    icon: 'Users',
    submenu: [
      { title: 'Сообщества', path: '/communities', icon: 'Users' },
      { title: 'Добро', path: '/charity', icon: 'Heart' },
      { title: 'Квесты', path: '/quests', icon: 'Flag' },
      { title: 'Доска Почета', path: '/leaderboard', icon: 'Trophy' },
      { title: 'Магазин бонусов', path: '/bonus-shop', icon: 'Gift' },
    ]
  }
];
