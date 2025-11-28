

export type Category = 'all' | 'sale' | 'rent' | 'services' | 'jobs' | 'cinema' | 'shops' | 'cafes' | 'gyms' | 'news' | 'transport' | 'medicine' | 'emergency' | 'culture' | 'beauty' | 'tourism';

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  text: string;
  date: string;
}

export interface BookingWidgetConfig {
  type: 'litepms';
  id: number;
  wid: number;
}

export interface Ad {
  id: string;
  userId?: string; // Links ad to the user in Supabase
  authorName?: string; // Display name of the seller
  authorLevel?: number; // Level of the seller (1-5)
  title: string;
  description: string;
  price: number;
  category: Category;
  subCategory?: string; // e.g., 'Sauna', 'Real Estate'
  contact: string;
  location: string;
  image: string;
  images?: string[]; // Support for multiple images
  isPremium: boolean; // "Bought a spot" on the board
  bookingAvailable?: boolean; // Can this ad be booked online?
  bookingWidget?: BookingWidgetConfig; // Configuration for external booking systems
  date: string;
  reviews?: Review[]; // Reviews associated with this seller/ad
  specs?: {
    year?: number;
    mileage?: number;
    rooms?: number;
    area?: number;
    floor?: number;
    condition?: 'new' | 'used'; // 'new' or 'used'
    brand?: string;
  };
  status?: 'approved' | 'pending' | 'rejected';
}

export interface CreateAdFormState {
  title: string;
  description: string;
  price: string;
  category: Category;
  subCategory: string;
  contact: string;
  location: string;
  isPremium: boolean;
  images: string[];
  specs?: {
    year?: string;
    mileage?: string;
    rooms?: string;
    area?: string;
    floor?: string;
    condition?: string;
    brand?: string;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Full text for the modal
  date: string;
  category: string;
  image: string;
}

export interface Order {
    id: string;
    date: string;
    shopName: string;
    total: number;
    status: 'completed' | 'processing' | 'cancelled';
    itemsString: string; 
}

export interface User {
  id: string;
  email: string;
  phone?: string; // Optional now
  isLoggedIn: boolean;
  managedShopId?: string; // ID of the shop this user owns (if any)
  name?: string;
  avatar?: string;
  favorites?: string[]; // Array of Ad IDs
  orders?: Order[];
  isAdmin?: boolean;
  xp?: number; // Experience points
}

export interface CatalogCategory {
  id: Category;
  label: string;
  groups: {
    name: string;
    items: string[];
  }[];
}

// --- Cinema Integration Types ---
export interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: string; // e.g., "7.8", "IMDb"
  ageLimit: string; // "12+", "16+"
  image: string;
  description: string;
  showtimes: string[];
  price: number;
}

export interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'occupied' | 'selected';
  price: number;
}

// --- Shop Types (Reused for Cafes) ---
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description?: string; // Added description
}

export interface CartItem extends Product {
  quantity: number;
  shopId: string; // Link item to a specific shop
}

export interface PaymentConfig {
  enabled: boolean; // Is online payment enabled?
  type: 'online' | 'manual'; // 'online' = gateway simulation, 'manual' = whatsapp/phone
  phone?: string; // Contact number for manual orders
  details?: string; // Additional details (e.g. "Card number" or API key placeholder)
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  phone: string;
  workingHours: string;
  rating: number;
  products: Product[];
  paymentConfig?: PaymentConfig; // Configuration for payments
}

export interface Story {
  id: string;
  shopId: string;
  shopName: string;
  avatar: string;
  image: string; // The full screen story image
  text?: string;
  isViewed?: boolean;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error' | 'level_up'; // Added level_up type
}

// --- Chat Types ---
export interface ChatMessage {
    id: string;
    chatId?: string;
    senderId: string; // 'me' or user_id
    text: string;
    created_at: string;
    isMe: boolean;
}

export interface ChatSession {
  adId: string;
  adTitle: string;
  category: Category;
  subCategory?: string;
}