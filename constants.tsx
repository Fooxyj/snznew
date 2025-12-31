
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

export const NEWS_DATA: NewsItem[] = [];
export const ADS_DATA: Ad[] = [];
export const BUSINESS_DATA: Business[] = [];
export const EVENTS_DATA: Event[] = [];

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
  { id: 'handmade', label: 'Хендмейд и Услуги', icon: 'Heart' },
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
    ]
  },
  {
    id: 'services_section',
    title: 'Услуги',
    icon: 'LayoutGrid',
    submenu: [
      { title: 'Кафе и рестораны', path: '/category/cafe' },
      { title: 'Спортивные залы', path: '/category/sport' },
      { title: 'Аренда и Отдых', path: '/category/rent' },
      { title: 'Красота и Уход', path: '/category/beauty' },
      { title: 'Кино', path: '/category/cinema' },
      { title: 'Автосервисы и Мойки', path: '/category/autoservice' },
      { title: 'Хендмейд и Мастера', path: '/category/handmade' },
    ]
  },
  {
    id: 'med_section',
    title: 'Медицина',
    icon: 'Stethoscope',
    submenu: [
      { title: 'Все медцентры', path: '/category/med' },
      { title: 'Организации', path: '/category/med_org' },
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
