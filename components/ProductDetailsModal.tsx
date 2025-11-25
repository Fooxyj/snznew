
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
    setQuantity(1); // Reset
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  // Calculate total price based on quantity
  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="h-64 bg-gray-100 relative">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-dark mb-2 leading-tight">{product.title}</h2>
          
          <div className="flex items-baseline gap-2 mb-4">
             <p className="text-3xl font-extrabold text-primary">{totalPrice.toLocaleString('ru-RU')} ₽</p>
             {quantity > 1 && (
                 <span className="text-secondary text-sm">({product.price.toLocaleString()} ₽ / шт.)</span>
             )}
          </div>
          
          {product.description && (
             <div className="mb-6 text-secondary text-sm leading-relaxed bg-gray-50 p-3 rounded-xl">
                {product.description}
             </div>
          )}
          
          <div className="flex items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <span className="font-bold text-sm text-secondary">Количество:</span>
             <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-2 py-1">
                <button onClick={decrement} className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary font-bold text-lg transition-colors">-</button>
                <span className="w-8 text-center font-bold text-dark">{quantity}</span>
                <button onClick={increment} className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary font-bold text-lg transition-colors">+</button>
             </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Добавить за {totalPrice.toLocaleString()} ₽
          </button>
        </div>
      </div>
    </div>
  );
};
