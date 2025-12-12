
import { ADS_DATA, NEWS_DATA, BUSINESS_DATA, EVENTS_DATA } from '../constants';
import { Ad, NewsItem, Business, Event, Order, Campaign, Story, RentalItem, Community, CommunityPost, LostFoundItem, Appeal, Ride, SmartDevice, Review, Comment, Suggestion, Report, Quest, AccessRequest } from '../types';

export const mockStore = {
  ads: [...ADS_DATA] as Ad[],
  news: [...NEWS_DATA] as NewsItem[],
  businesses: [...BUSINESS_DATA] as Business[],
  events: [...EVENTS_DATA] as Event[],
  rentals: [] as RentalItem[],
  orders: [] as Order[],
  campaigns: [] as Campaign[],
  stories: [] as Story[],
  communities: [] as Community[],
  communityPosts: [] as CommunityPost[],
  suggestions: [] as Suggestion[],
  reports: [] as Report[],
  accessRequests: [] as AccessRequest[],
  
  // City Services
  lostFound: [] as LostFoundItem[],
  
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

  // Mock Reviews
  reviews: [
      { id: 'r1', businessId: 'b1', authorName: 'Елена В.', rating: 5, text: 'Прекрасное место, очень уютно! Кофе просто супер.', date: 'Вчера' },
      { id: 'r2', businessId: 'b1', authorName: 'Дмитрий К.', rating: 5, text: 'Лучший кофе в городе. Всегда беру здесь капучино перед работой.', date: '3 дня назад' },
      { id: 'r3', businessId: 'b1', authorName: 'Анна П.', rating: 4, text: 'Вкусно, но в час пик пришлось долго ждать заказ.', date: 'Неделю назад' },
      { id: 'r4', businessId: 'b2', authorName: 'Александр', rating: 5, text: 'Тренажеры новые, вентиляция работает отлично. Рекомендую!', date: 'Сегодня' },
      { id: 'r5', businessId: 'b3', authorName: 'Киноман', rating: 4, text: 'Звук отличный, кресла удобные, но попкорн был холодный.', date: 'Вчера' }
  ] as Review[],

  // Mock Comments
  comments: [
      { id: 'c1', newsId: 'n1', authorName: 'Сергей Петров', text: 'Наконец-то! Давно ждали реконструкцию этой зоны.', date: 'Сегодня, 10:30' },
      { id: 'c2', newsId: 'n1', authorName: 'Марина И.', text: 'Главное, чтобы про парковку не забыли, а то там вечно не встать.', date: 'Вчера, 18:15' },
      { id: 'c3', newsId: 'n2', authorName: 'Игорь В.', text: 'А бассейн там будет предусмотрен?', date: 'Сегодня, 09:00' },
      { id: 'c4', newsId: 'n3', authorName: 'Ольга С.', text: 'Опять воду отключают :( Надеюсь, уложатся в сроки.', date: 'Вчера, 20:00' }
  ] as Comment[]
};
