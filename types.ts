
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
  favorites: string[]; // IDs of ads or businesses
  badges?: string[];
  createdAt?: string;
}

export interface Transaction {
  id: string;
  senderId?: string;
  receiverId?: string;
  amount: number;
  type: 'transfer' | 'purchase' | 'topup' | 'deposit' | 'earning' | 'bill_payment' | 'donation' | 'rental_deposit' | 'rental_refund';
  description: string;
  createdAt: string;
  isIncoming?: boolean; // Helper for UI
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  views: number;
  commentsCount: number;
  content: string;
}

export interface Ad {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  images?: string[]; // Multiple photos
  date: string;
  authorId: string;
  authorName?: string; // New field for UI
  authorAvatar?: string; // New field for UI
  description: string;
  location: string;
  isVip?: boolean;
  isPremium?: boolean; // Tier 2 status
  status?: 'pending' | 'approved' | 'rejected'; // Moderation status
}

export interface Business {
  id: string;
  name: string;
  category: string; // Shop, Cafe, Sport, etc.
  rating: number;
  reviewsCount: number;
  address: string;
  image: string; // Logo
  coverImage?: string; // Header/Cover
  description: string;
  lat: number;
  lng: number;
  phone: string;
  website?: string; // NEW: Website URL
  workHours: string;
  authorId?: string;
  inn?: string;
  ogrn?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected'; // NEW: Auto-verification status
  canPostStories?: boolean; // Permission flag
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

export interface Service {
  id: string;
  businessId: string;
  title: string;
  price: number;
  durationMin: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  businessId: string;
  userId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  serviceTitle?: string;
  businessName?: string;
  price?: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  image: string;
  location: string;
  category: string;
  price?: number;
  description?: string;
  authorId?: string; // Link to creator/business
  sessions?: string[]; // Array of times, e.g. ["10:00", "14:00"]
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  row: number;
  col: number;
  price: number;
  qrCode: string;
  eventTitle?: string;
  eventDate?: string;
  eventImage?: string;
  eventLocation?: string;
}

export interface Review {
  id: string;
  businessId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date: string;
}

export interface Comment {
  id: string;
  newsId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  date: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessageDate?: string;
  lastMessageText?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'system' | 'like';
  text: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  userVotedOptionId?: string | null; // ID опции, за которую голосовал текущий юзер (если голосовал)
}

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  contactName: string;
  contactPhone: string;
  isResolved: boolean;
  authorId: string;
}

export interface Appeal {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  status: 'new' | 'done';
  resultImage?: string;
  authorId: string;
  createdAt: string;
}

export interface Ride {
  id: string;
  fromCity: string;
  toCity: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  carModel: string;
  driverId: string;
  driverName?: string; // Fetched from profile
  driverAvatar?: string; // Fetched from profile
}

export interface Vacancy {
  id: string;
  title: string;
  salaryMin?: number;
  salaryMax?: number;
  companyName: string;
  description: string;
  contactPhone: string;
  schedule: 'full' | 'shift' | 'remote';
  authorId: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  name: string;
  profession: string;
  salaryExpectation?: number;
  experience: string;
  about: string;
  phone: string;
  authorId: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  price: number; // XP cost
  image: string;
  partnerName: string;
}

export interface UserCoupon {
  id: string;
  couponId: string;
  couponTitle: string; // Joined field
  couponImage: string; // Joined field
  code: string;
  isUsed: boolean;
}

// --- STORY TYPES ---

export interface StoryElement {
  id: string;
  type: 'text' | 'link';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  content: string; // Text content or Link Label
  url?: string; // Only for link
  color?: string;
  bg?: string;
  scale?: number;
}

export interface StoryConfig {
  transform: { x: number; y: number; scale: number }; // Background image transform
  elements: StoryElement[];
}

export interface Story {
  id: string;
  authorId: string;
  media: string;
  caption: string; // Fallback / Alt text
  contentConfig?: StoryConfig; // JSON configuration for layers
  createdAt: string;
  authorName?: string;
  authorAvatar?: string;
  status?: 'published' | 'pending' | 'rejected';
  viewers?: { id: string; name: string; avatar: string }[]; 
}

export interface Suggestion {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Report {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  targetId: string;
  targetType: string;
  reason: string;
  status: 'new' | 'resolved' | 'dismissed';
  createdAt: string;
}

// New Interface for Access Requests
export interface AccessRequest {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  membersCount: number;
  isMember?: boolean; // joined status for current user
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  xpReward: number;
  isCompleted?: boolean;
}

export interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  businessId: string;
  status: 'new' | 'cooking' | 'delivery' | 'done';
  totalPrice: number;
  address: string;
  items?: OrderItem[];
  businessName?: string; // joined
  businessAddress?: string; // joined
  createdAt: string;
  courierId?: string;
  deliveryFee?: number;
}

export interface MeterReading {
  id: string;
  userId: string;
  type: 'hot_water' | 'cold_water' | 'electricity';
  value: number;
  date: string;
  createdAt: string;
}

export interface UtilityBill {
  id: string;
  userId: string;
  serviceName: string;
  amount: number;
  period: string;
  isPaid: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  image: string;
  organizerName: string;
}

export interface RentalItem {
  id: string;
  title: string;
  description: string;
  image: string;
  pricePerDay: number;
  deposit: number;
  category: string;
  authorId: string;
  isAvailable: boolean;
}

export interface RentalBooking {
  id: string;
  rentalId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'returned';
  rentalTitle?: string;
  rentalImage?: string;
  deposit?: number;
}

export interface SmartDevice {
  id: string;
  type: 'camera_public' | 'intercom' | 'barrier';
  name: string;
  imageUrl: string;
  location: string;
  isPrivate: boolean;
  status: 'online' | 'offline';
}

export interface TransportSchedule {
  id: string;
  type: 'city' | 'intercity';
  routeNumber?: string;
  title: string;
  schedule: string;
  workHours?: string;
  price?: number;
}

// --- CRM EXTENSIONS ---

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  role: 'manager' | 'staff';
  avatar: string;
  email?: string;
  joinedAt: string;
}

export interface AnalyticsData {
  date: string;
  revenue: number;
  visitors: number;
}

export interface Table {
  id: string;
  businessId: string;
  name: string;
  seats: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  status: 'free' | 'reserved' | 'occupied';
  shape: 'circle' | 'rect';
}
