
import React, { useState, useEffect } from 'react';
import { CartItem, Shop } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  shops: Shop[]; // Pass all shops to look up names/payment configs
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, shops, onUpdateQuantity, onRemove }) => {
  const [processingOrder, setProcessingOrder] = useState<string | null>(null); // ShopID currently processing
  const [activeTabShopId, setActiveTabShopId] = useState<string | null>(null);

  // Group items by ShopID
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
        acc[item.shopId] = [];
    }
    acc[item.shopId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const shopIds = Object.keys(groupedItems);
  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Set active tab to first shop if none selected or if active shop was removed
  useEffect(() => {
      if (shopIds.length > 0 && (!activeTabShopId || !shopIds.includes(activeTabShopId))) {
          setActiveTabShopId(shopIds[0]);
      }
  }, [shopIds, activeTabShopId]);

  if (!isOpen) return null;

  const handleCheckout = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;

    const shopItems = groupedItems[shopId];
    const total = shopItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Case 1: Online Payment
    if (shop.paymentConfig?.enabled) {
        setProcessingOrder(shopId);
        setTimeout(() => {
            alert(`Оплата ${total}₽ прошла успешно! Заказ отправлен в "${shop.name}".`);
            setProcessingOrder(null);
            // In a real app, clear these items from cart here
        }, 2000);
        return;
    }

    // Case 2: Manual / WhatsApp
    const phone = shop.paymentConfig?.phone || shop.phone;
    // Format phone for WA (remove all non-digits, ensure 7 prefix)
    const cleanPhone = phone.replace(/\D/g, '').replace(/^8/, '7');
    
    let message = `Здравствуйте! Хочу сделать заказ в *${shop.name}*:\n\n`;
    shopItems.forEach(item => {
        message += `— ${item.title} (${item.quantity} шт.) — ${item.price * item.quantity}₽\n`;
    });
    message += `\n*Итого: ${total}₽*`;
    message += `\n\nМой контакт: ...`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/50 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="w-full max-w-md bg-white h-full relative pointer-events-auto shadow-2xl flex flex-col animate-fade-in-up md:animate-none">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-dark flex items-center gap-2">
            Корзина
            {totalCartCount > 0 && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{totalCartCount}</span>}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Shop Tabs */}
        {shopIds.length > 0 && (
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100 px-4 gap-2 pt-2 pb-0 bg-gray-50/50">
                {shopIds.map(sid => {
                    const shop = shops.find(s => s.id === sid);
                    if (!shop) return null;
                    const isActive = activeTabShopId === sid;
                    return (
                        <button
                            key={sid}
                            onClick={() => setActiveTabShopId(sid)}
                            className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-all border-t border-x border-transparent relative top-px whitespace-nowrap
                                ${isActive 
                                    ? 'bg-white text-primary border-gray-100' 
                                    : 'bg-transparent text-secondary hover:text-dark hover:bg-gray-100/50'}`}
                        >
                            {shop.name}
                        </button>
                    );
                })}
            </div>
        )}

        <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-gray-50 custom-scrollbar">
          {shopIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-secondary">
               <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
               </div>
               <p className="text-lg font-medium text-dark">Корзина пуста</p>
               <p className="text-sm">Добавьте что-нибудь вкусное или полезное</p>
            </div>
          ) : activeTabShopId ? (
                (() => {
                    const shopId = activeTabShopId;
                    const shop = shops.find(s => s.id === shopId);
                    const shopItems = groupedItems[shopId] || [];
                    const shopTotal = shopItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    const isProcessing = processingOrder === shopId;

                    if (!shop) return null;

                    return (
                        <div key={shopId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                            {/* Shop Header */}
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-dark text-sm leading-tight">{shop.name}</h3>
                                    <p className="text-[10px] text-secondary">
                                        {shop.paymentConfig?.enabled ? 'Оплата картой' : 'Заказ менеджеру'}
                                    </p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-3 space-y-3">
                                {shopItems.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-0.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-medium text-dark text-sm line-clamp-2 leading-snug">{item.title}</h4>
                                                <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center bg-gray-100 rounded-lg px-1.5 py-0.5 h-6">
                                                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-5 flex items-center justify-center font-bold text-secondary hover:text-primary">-</button>
                                                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-5 flex items-center justify-center font-bold text-secondary hover:text-primary">+</button>
                                                </div>
                                                <span className="font-bold text-dark text-sm">{(item.price * item.quantity).toLocaleString()} ₽</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shop Footer / Checkout */}
                            <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-secondary">Итого по магазину:</span>
                                    <span className="text-xl font-extrabold text-dark">{shopTotal.toLocaleString()} ₽</span>
                                </div>
                                
                                <button 
                                    onClick={() => handleCheckout(shopId)}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                                        ${shop.paymentConfig?.enabled 
                                            ? 'bg-dark text-white hover:bg-black' 
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Обработка...
                                        </>
                                    ) : shop.paymentConfig?.enabled ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                            Оплатить картой
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                            Заказать в WhatsApp
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })()
          ) : null}
        </div>
      </div>
    </div>
  );
};
