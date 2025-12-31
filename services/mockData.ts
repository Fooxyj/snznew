
import { ADS_DATA, NEWS_DATA, BUSINESS_DATA, EVENTS_DATA } from '../constants';
import { Ad, NewsItem, Business, Event, Order, Campaign, Story, RentalItem, Community, CommunityPost, LostFoundItem, Appeal, Ride, SmartDevice, Review, Comment, Suggestion, Report, Quest, AccessRequest, Vacancy, Resume, Banner, Coupon } from '../types';

export const mockStore = {
  ads: [...ADS_DATA] as Ad[],
  news: [...NEWS_DATA] as NewsItem[],
  businesses: [...BUSINESS_DATA] as Business[],
  events: [...EVENTS_DATA] as Event[],
  
  // Comment above fix: Added missing coupons property to mockStore to resolve access error in socialService
  coupons: [
    { id: 'c1', title: 'Скидка 20% на кофе', description: 'Действует во всех кофейнях Снежинка.', price: 100, image: 'https://picsum.photos/seed/c1/300/200', partnerName: 'Снежинка' },
    { id: 'c2', title: 'Месяц фитнеса за полцены', description: 'Скидка 50% на абонемент в зал Титан.', price: 500, image: 'https://picsum.photos/seed/c2/300/200', partnerName: 'Титан' }
  ] as Coupon[],

  rentals: [
    { id: 'rn1', title: 'Перфоратор Makita HR2470', description: 'Отличный инструмент для ремонта. В комплекте набор буров.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500&auto=format&fit=crop', pricePerDay: 500, deposit: 3000, category: 'Инструмент', authorId: 'u2', isAvailable: true, status: 'approved' },
    { id: 'rn2', title: 'Палатка 3-местная Tramp', description: 'Двухслойная, непромокаемая. Идеально для походов на Синару.', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=500&auto=format&fit=crop', pricePerDay: 400, deposit: 2000, category: 'Спорт', authorId: 'u3', isAvailable: true, status: 'approved' }
  ] as RentalItem[],

  lostFound: [
    { id: 'lf1', type: 'lost', title: 'Потеряны ключи с брелком BMW', description: 'Потеряны в районе 125 школы. Нашедшего прошу вернуть за вознаграждение.', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=500&auto=format&fit=crop', location: 'ул. Васильева', date: '20.05.2024', contactName: 'Игорь', contactPhone: '+7 900 123 45 67', isResolved: false, authorId: 'u4', status: 'approved' },
    { id: 'lf2', type: 'found', title: 'Найдена карта МИР (ВТБ)', description: 'Найдена на скамейке в парке. Имя на карте: EVGENII S.', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=500&auto=format&fit=crop', location: 'Парк Культуры', date: '21.05.2024', contactName: 'Мария', contactPhone: '+7 900 765 43 21', isResolved: false, authorId: 'u5', status: 'approved' }
  ] as LostFoundItem[],

  orders: [] as Order[],
  campaigns: [] as Campaign[],
  stories: [] as Story[],
  communities: [] as Community[],
  communityPosts: [] as CommunityPost[],
  suggestions: [] as Suggestion[],
  reports: [] as Report[],
  accessRequests: [] as AccessRequest[],
  
  banners: [
    { id: 'mb1', image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?q=80&w=2070&auto=format&fit=crop', title: 'Уютные вечера в кофейнях города', link_url: '/category/cafe', position: 'home_top_p1', is_active: true, created_at: new Date().toISOString() },
    { id: 'mb2', image_url: 'https://images.unsplash.com/photo-1555529669-26f9d103abdd?q=80&w=2070&auto=format&fit=crop', title: 'Большая распродажа в магазинах Снежинска', link_url: '/category/shops', position: 'home_top_p2', is_active: true, created_at: new Date().toISOString() },
    { id: 'mb3', image_url: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop', title: 'Главные события недели в Афише', link_url: '/events', position: 'home_mid_p1', is_active: true, created_at: new Date().toISOString() }
  ] as Banner[],
  
  vacancies: [] as Vacancy[],
  resumes: [] as Resume[],
  
  appeals: [
      { id: 'ap1', title: 'Яма на дороге', description: 'Глубокая яма при въезде во двор.', location: 'ул. Ленина 15', status: 'new', image: 'https://picsum.photos/seed/hole/300/200', authorId: 'u2', createdAt: new Date().toISOString() },
      { id: 'ap2', title: 'Сломан качель', description: 'Оборвана цепь на качели.', location: 'Парк культуры', status: 'done', image: 'https://picsum.photos/seed/swing/300/200', resultImage: 'https://picsum.photos/seed/fixed/300/200', authorId: 'u3', createdAt: new Date().toISOString() }
  ] as Appeal[],
  
  rides: [] as Ride[],
  
  smartDevices: [
      { id: 'cam1', type: 'camera_public', name: 'Площадь Ленина', imageUrl: 'https://picsum.photos/seed/cam1/800/400', location: 'Центр', isPrivate: false, status: 'online' },
      { id: 'cam2', type: 'camera_public', name: 'КПП-1', imageUrl: 'https://picsum.photos/seed/cam2/800/400', location: 'Въезд', isPrivate: false, status: 'online' }
  ] as SmartDevice[],

  quests: [
      { id: 'q1', title: 'История города', description: 'Посетите музей и найдите первый камень.', image: 'https://picsum.photos/seed/q1/300/200', lat: 56.082, lng: 60.732, xpReward: 100 },
      { id: 'q2', title: 'Прогулка по набережной', description: 'Сделайте фото у ротонды.', image: 'https://picsum.photos/seed/q2/300/200', lat: 56.078, lng: 60.728, xpReward: 50, isCompleted: true }
  ] as Quest[],

  reviews: [],
  comments: []
};
