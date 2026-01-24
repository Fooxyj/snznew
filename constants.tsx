
import { Ad, Business, NewsItem, User, UserRole, Event } from './types';

// Helper for dynamic dates in mock data
const getPastDate = (days: number, hours: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

export const AD_CATEGORIES = [
  'Личные вещи', 
  'Транспорт', 
  'Недвижимость', 
  'Работа', 
  'Услуги', 
  'Хобби и отдых', 
  'Для дома и дачи', 
  'Электроника', 
  'Животные',
  'Хендмейд / Авторское', 
  'Домашняя еда' 
];

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
  "По договоренности"
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
    content: 'В Снежинске продолжаются работы по благоустройству территории набережной...'
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
    date: getPastDate(0, 2),
    authorId: 'u2',
    description: 'Продам велосипед, катался пару раз. Дисковые тормоза, 27 скоростей.',
    location: 'ул. Ленина',
    isVip: true,
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
    lat: 56.08,
    lng: 60.73,
    phone: '+7 (900) 123-45-67',
    workHours: '08:00 - 22:00'
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
  }
];

export const CATEGORIES = [
  { id: 'news', label: 'Новости', icon: 'Newspaper' },
  { id: 'shops', label: 'Магазины', icon: 'ShoppingBag' },
  { id: 'food_market', label: 'Продукты и Еда', icon: 'ShoppingBag' },
  { id: 'home_garden', label: 'Дом и Сад', icon: 'ShoppingBag' },
  { id: 'construction', label: 'Строительные', icon: 'Hammer' },
  { id: 'tech_digital', label: 'Техника и Электроника', icon: 'ShoppingBag' },
  { id: 'cafe', label: 'Кафе и рестораны', icon: 'Coffee' },
  { id: 'rent', label: 'Аренда и Отдых', icon: 'Key' }, 
  { id: 'cinema', label: 'Кино', icon: 'Film' },
  { id: 'beauty', label: 'Красота и Уход', icon: 'Scissors' },
  { id: 'sport', label: 'Спортзалы и секции', icon: 'Dumbbell' },
  { id: 'med', label: 'Медицина', icon: 'Stethoscope' },
  { id: 'transport', label: 'Транспорт', icon: 'Bus' },
  { id: 'car_service', label: 'Автосервисы и Мойки', icon: 'Wrench' },
  { id: 'handmade', label: 'Еда и Хендмейд', icon: 'Star' },
  { id: 'home_repair', label: 'Ремонт и Быт', icon: 'Wrench' },
  { id: 'education', label: 'Обучение и Репетиторы', icon: 'BookOpen' },
  { id: 'beauty_masters', label: 'Красота и Здоровье', icon: 'Heart' },
  { id: 'digital_pros', label: 'IT и Фриланс', icon: 'Monitor' },
  { id: 'creative', label: 'Фото и Креатив', icon: 'Camera' },
  { id: 'events_pros', label: 'Праздники и Шоу', icon: 'Sparkles' },
  { id: 'cleaning', label: 'Уборка и Клининг', icon: 'Droplets' },
  { id: 'pets_service', label: 'Зооуслуги', icon: 'Heart' },
];

export const CATALOG_MENU = [
  {
    id: 'shops_section',
    title: 'Магазины',
    icon: 'ShoppingBag',
    submenu: [
      { title: 'Все магазины', path: '/category/shops' },
      { title: 'Продукты', path: '/category/food_market' },
      { title: 'Дом и Сад', path: '/category/home_garden' },
      { title: 'Строительные', path: '/category/construction' },
      { title: 'Техника', path: '/category/tech_digital' },
    ]
  },
  {
    id: 'news_section',
    title: 'Новости города',
    icon: 'Newspaper',
    path: '/news',
    submenu: [
      { title: 'Администрация', path: '/news?cat=Новости администрации' },
      { title: 'ВНИИТФ', path: '/news?cat=Новости ВНИИТФ' },
      { title: 'Городские новости', path: '/news?cat=Город' },
      { title: 'ЖКХ', path: '/news?cat=ЖКХ' },
    ]
  },
  {
    id: 'services_section',
    title: 'Услуги и Досуг',
    icon: 'LayoutGrid',
    submenu: [
      { title: 'Кафе и Рестораны', path: '/category/cafe' },
      { title: 'Аренда и Отдых', path: '/category/rent' },
      { title: 'Красота и Уход', path: '/category/beauty' },
      { title: 'Спортивные залы', path: '/category/sport' },
      { title: 'Автосервисы', path: '/category/car_service' },
      { title: 'Кино', path: '/category/cinema' },
    ]
  },
  {
    id: 'masters_section',
    title: 'Специалисты',
    icon: 'Star',
    submenu: [
        { title: 'Еда и Хендмейд', path: '/category/handmade' },
        { title: 'Ремонт и Быт', path: '/category/home_repair' },
        { title: 'Репетиторы', path: '/category/education' },
        { title: 'Красота и Здоровье', path: '/category/beauty_masters' },
        { title: 'IT и Фриланс', path: '/category/digital_pros' },
        { title: 'Фото и Креатив', path: '/category/creative' },
        { title: 'Праздники и Шоу', path: '/category/events_pros' },
        { title: 'Клининг', path: '/category/cleaning' },
        { title: 'Зооуслуги', path: '/category/pets_service' },
    ]
  },
  {
    id: 'transport_section',
    title: 'Транспорт',
    icon: 'Bus',
    path: '/category/transport'
  },
  {
    id: 'med_section',
    title: 'Медицина',
    icon: 'Stethoscope',
    path: '/category/med'
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
      { title: 'Прокат вещей', path: '/rentals', icon: 'Repeat' },
      { title: 'Бюро находок', path: '/lost-found', icon: 'HelpCircle' },
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
