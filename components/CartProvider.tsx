
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  businessId: string | null; // Cart can only hold items from one business at a time
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Load from local storage with error handling
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snz_cart');
      const savedBid = localStorage.getItem('snz_cart_bid');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setItems(parsed);
      }
      if (savedBid) setBusinessId(savedBid);
    } catch (e) {
      console.error("Error loading cart from storage", e);
      // If data is corrupt, clear it to fix the crash
      localStorage.removeItem('snz_cart');
      localStorage.removeItem('snz_cart_bid');
    }
  }, []);

  // Save to local storage
  useEffect(() => {
      localStorage.setItem('snz_cart', JSON.stringify(items));
      if (businessId) localStorage.setItem('snz_cart_bid', businessId);
      else localStorage.removeItem('snz_cart_bid');
  }, [items, businessId]);

  const addToCart = (product: Product) => {
      if (businessId && businessId !== product.businessId) {
          if (!confirm("В корзине товары из другого магазина. Очистить корзину и добавить новый товар?")) {
              return;
          }
          setItems([]);
      }
      
      setBusinessId(product.businessId);
      
      setItems(prev => {
          const existing = prev.find(i => i.id === product.id);
          if (existing) {
              return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { ...product, quantity: 1 }];
      });
  };

  const removeFromCart = (productId: string) => {
      setItems(prev => {
          const newItems = prev.filter(i => i.id !== productId);
          if (newItems.length === 0) setBusinessId(null);
          return newItems;
      });
  };

  const clearCart = () => {
      setItems([]);
      setBusinessId(null);
  };

  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartTotal, cartCount, businessId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
