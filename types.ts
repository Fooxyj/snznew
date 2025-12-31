
export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  xp: number;
  email: string;
  phone?: string;
  favorites: string[]; 
  badges?: string[];
  createdAt?: string;
  lastSeen?: string;
}

export interface PageBlock {
  id: string;
  type: 'hero' | 'grid' | 'pricing' | 'contacts' | 'text';
  title?: string;
  subtitle?: string;
  content?: string;
  items?: any[];
  config?: any;
}

export interface ExclusivePage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  phone?: string;
  website?: string;
  features: { t: string; d: string; i: string }[];
  blocks_config: PageBlock[];
  is_active: boolean;
  idx: number;
}

export interface Banner {
  id: string;
  idx?: number;
  image_url: string;
  link_url?: string;
  title?: string;
  // Comment above fix: Expanded position union to include granular page positions used in mock data and home page logic
  position?: 'home_top' | 'home_mid' | 'sidebar' | 'news_inline' | 'classifieds_top' | 'footer' | 'home_top_p1' | 'home_top_p2' | 'home_top_p3' | 'home_mid_p1' | 'home_mid_p2' | 'home_mid_p3';
  is_active: boolean;
  created_at: string;
}

export interface PromoAd {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link_url?: string;
    price?: number;
    category: string;
    is_active: boolean;
    created_at: string;
}

export interface Community { id: string; name: string; description: string; image: string; membersCount: number; isMember?: boolean; status?: 'pending' | 'approved' | 'rejected'; authorId?: string; }
export interface TransportSchedule { id: string; type: 'city' | 'intercity' | 'taxi'; routeNumber?: string; title: string; schedule: string; workHours?: string; price?: number; phone?: string; }
export interface Suggestion { id: string; userId?: string; userName?: string; userAvatar?: string; text: string; createdAt: string; isRead: boolean; }
export interface Report { id: string; userId: string; userName?: string; userAvatar?: string; targetId: string; targetType: string; reason: string; status: 'new' | 'resolved' | 'dismissed'; createdAt: string; }
export interface Ad { id: string; title: string; price: number; currency: string; category: string; image: string; images?: string[]; date: string; authorId: string; authorName?: string; authorAvatar?: string; description: string; location: string; isVip?: boolean; isPremium?: boolean; status?: 'pending' | 'approved' | 'rejected'; authorLastSeen?: string; }
export interface NewsItem { id: string; title: string; category: string; image: string; date: string; views: number; commentsCount: number; content: string; }
export interface Business { id: string; name: string; category: string; rating: number; reviewsCount: number; address: string; image: string; coverImage?: string; description: string; lat: number; lng: number; phone: string; website?: string; workHours: string; authorId?: string; inn?: string; ogrn?: string; verificationStatus?: 'pending' | 'verified' | 'rejected'; canPostStories?: boolean; isMaster?: boolean; }
export interface Story { id: string; authorId: string; media: string; caption: string; contentConfig?: any; createdAt: string; authorName?: string; authorAvatar?: string; status?: 'published' | 'pending' | 'rejected'; viewers?: { id: string; name: string; avatar: string }[]; }
export interface AccessRequest { id: string; businessId: string; businessName: string; userId: string; userName: string; message: string; createdAt: string; }
export interface Ride { id: string; fromCity: string; toCity: string; date: string; time: string; price: number; seats: number; carModel: string; driverId: string; driverName?: string; driverAvatar?: string; passengers?: string; status?: 'pending' | 'approved' | 'rejected'; passengerDetails?: { id: string; name: string; avatar: string }[]; }
export interface Vacancy { id: string; title: string; salaryMin?: number; salaryMax?: number; companyName: string; description: string; contactPhone: string; schedule: 'full' | 'shift' | 'remote'; authorId: string; createdAt: string; status?: 'pending' | 'approved' | 'rejected'; }
export interface Resume { id: string; name: string; profession: string; salaryExpectation?: number; experience: string; about: string; phone: string; authorId: string; createdAt: string; status?: 'pending' | 'approved' | 'rejected'; }
export interface Appeal { id: string; title: string; description: string; image: string; location: string; status: 'new' | 'done'; resultImage?: string; authorId: string; createdAt: string; }
export interface LostFoundItem { id: string; type: 'lost' | 'found'; title: string; description: string; image: string; location: string; date: string; contactName: string; contactPhone: string; isResolved: boolean; authorId: string; status?: 'pending' | 'approved' | 'rejected'; }
export interface RentalItem { id: string; title: string; description: string; image: string; pricePerDay: number; deposit: number; category: string; authorId: string; isAvailable: boolean; status?: 'pending' | 'approved' | 'rejected'; }
export interface Coupon { id: string; title: string; description: string; price: number; image: string; partnerName: string; }
export interface UserCoupon { id: string; userId: string; couponId: string; code: string; couponTitle?: string; couponImage?: string; }
export interface Event { id: string; title: string; date: string; image: string; location: string; category: string; description?: string; price?: number; sessions?: string[]; authorId?: string; }
export interface Notification { id: string; userId: string; text: string; isRead: boolean; createdAt: string; }
export interface Poll { id: string; question: string; options: { id: string; text: string; votes: number }[]; totalVotes: number; myVote?: string; }
export interface Ticket { id: string; eventId: string; userId: string; row: number; col: number; price: number; qrCode: string; createdAt: string; }
export interface Review { id: string; businessId: string; authorName: string; authorAvatar?: string; rating: number; text: string; date: string; }
export interface Comment { id: string; newsId: string; authorName: string; authorAvatar?: string; text: string; date: string; }
export interface Conversation { id: string; participant1Id: string; participant2Id: string; partnerId: string; partnerName: string; partnerAvatar: string; lastMessageDate: string; lastMessageText: string; businessId?: string; unreadCount?: number; }
export interface Message { id: string; conversationId: string; senderId: string; text: string; createdAt: string; isRead: boolean; status?: 'pending' | 'sent' | 'read'; }
export interface CommunityPost { id: string; communityId: string; authorId: string; authorName: string; authorAvatar?: string; content: string; image?: string; likes: number; createdAt: string; }
export interface Quest { id: string; title: string; description: string; image: string; lat: number; lng: number; xpReward: number; isCompleted?: boolean; }
export interface Order { id: string; businessId: string; businessName?: string; businessAddress?: string; userId: string; items: { productName: string; price: number; quantity: number }[]; address: string; totalPrice: number; deliveryFee?: number; status: 'new' | 'cooking' | 'delivery' | 'done'; createdAt: string; courierId?: string; }
export interface Product { id: string; businessId: string; name: string; description: string; price: number; image: string; category: string; }
export interface Service { id: string; businessId: string; title: string; price: number; durationMin: number; description?: string; image?: string; }
export interface Booking { id: string; serviceId: string; businessId: string; userId: string; date: string; time: string; status: 'pending' | 'confirmed' | 'cancelled'; serviceTitle?: string; price?: number; }
export interface RentalBooking { id: string; rentalId: string; renterId: string; rentalTitle: string; rentalImage: string; startDate: string; endDate: string; totalPrice: number; deposit: number; status: 'active' | 'returned'; }
export interface SmartDevice { id: string; type: string; name: string; location: string; imageUrl: string; isPrivate: boolean; status: 'online' | 'offline'; }
export interface Transaction { id: string; userId: string; amount: number; type: 'income' | 'expense'; description: string; date: string; }
export interface UtilityBill { id: string; userId: string; serviceName: string; amount: number; period: string; isPaid: boolean; }
export interface Campaign { id: string; title: string; description: string; targetAmount: number; collectedAmount: number; organizerName: string; image: string; }
export interface StoryElement { id: string; type: 'text' | 'link'; x: number; y: number; content: string; url?: string; color: string; bg: string; }
export interface StoryConfig { transform: { x: number; y: number; scale: number }; elements: StoryElement[]; }
export interface Employee { id: string; businessId: string; name: string; role: 'manager' | 'staff'; avatar: string; email?: string; joinedAt: string; }
export interface AnalyticsData { date: string; revenue: number; visitors: number; }
export interface Table { id: string; businessId: string; name: string; x: number; y: number; seats: number; shape: 'circle' | 'rect'; status: 'free' | 'reserved' | 'occupied'; }
