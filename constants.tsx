
import { Ad, Business, NewsItem, User, UserRole, Event } from './types';

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
    date: '2 часа назад',
    views: 1205,
    commentsCount: 34,
    content: 'В Снежинске продолжаются работы по благоустройству...'
  },
  {
    id: 'n2',
    title: 'Открытие нового спорткомплекса "Айсберг"',
    category: 'Спорт',
    image: 'https://picsum.photos/seed/news2/600/400',
    date: 'Вчера',
    views: 850,
    commentsCount: 12,
    content: 'Торжественное открытие состоится в субботу...'
  },
  {
    id: 'n3',
    title: 'График отключения горячей воды на июль',
    category: 'ЖКХ',
    image: 'https://picsum.photos/seed/news3/600/400',
    date: 'Вчера',
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
    date: 'Сегодня',
    authorId: 'u2',
    description: 'Продам велосипед, катался пару раз. Дисковые тормоза, 27 скоростей.',
    location: 'ул. Ленина',
    isVip: true
  },
  {
    id: 'a2',
    title: '1-к квартира, 38 м², центр города',
    price: 2500000,
    currency: '₽',
    category: 'Недвижимость',
    image: 'https://picsum.photos/seed/flat/400/300',
    date: 'Вчера',
    authorId: 'u3',
    description: 'Уютная квартира в центре. Евроремонт.',
    location: 'ул. Васильева',
    isVip: true
  },
  {
    id: 'a3',
    title: 'Репетитор по математике (ЕГЭ/ОГЭ)',
    price: 800,
    currency: '₽/час',
    category: 'Услуги',
    image: 'https://picsum.photos/seed/math/400/300',
    date: '3 дня назад',
    authorId: 'u4',
    description: 'Подготовка к ЕГЭ и ОГЭ. Опыт 10 лет.',
    location: 'Онлайн'
  },
  {
    id: 'a4',
    title: 'Игровой ноутбук ASUS ROG',
    price: 85000,
    currency: '₽',
    category: 'Электроника',
    image: 'https://picsum.photos/seed/laptop/400/300',
    date: '1 час назад',
    authorId: 'u5',
    description: 'Мощный игровой ноутбук. RTX 3060, Ryzen 7.',
    location: 'ул. Дзержинского'
  },
  {
    id: 'a5',
    title: 'Детская коляска 3 в 1',
    price: 12000,
    currency: '₽',
    category: 'Личные вещи',
    image: 'https://picsum.photos/seed/stroller/400/300',
    date: 'Сегодня',
    authorId: 'u6',
    description: 'В отличном состоянии, после одного ребенка.',
    location: 'ул. Мира'
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
    description: 'Новинки кино в 3D и 2D.',
    lat: 40,
    lng: 60,
    phone: '+7 (351) 462-22-22',
    workHours: '10:00 - 02:00'
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
    category: 'Культура'
  }
];

export const CATEGORIES = [
  { id: 'news', label: 'Новости', icon: 'Newspaper' },
  { id: 'shops', label: 'Магазины', icon: 'ShoppingBag' },
  { id: 'cafe', label: 'Кафе и рестораны', icon: 'Coffee' },
  { id: 'rent', label: 'Аренда и Отдых', icon: 'Key' }, // New Category
  { id: 'cinema', label: 'Кино', icon: 'Film' },
  { id: 'tourism', label: 'Туризм', icon: 'Map' },
  { id: 'culture', label: 'Культура', icon: 'Drama' }, 
  { id: 'beauty', label: 'Красота', icon: 'Scissors' },
  { id: 'sport', label: 'Спортзалы', icon: 'Dumbbell' },
  { id: 'med', label: 'Медицина', icon: 'Stethoscope' },
  { id: 'transport', label: 'Транспорт', icon: 'Bus' },
  { id: 'emergency', label: 'Экстренные', icon: 'Siren' },
];
