import React from 'react';
import { Category } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  activeCategory: Category;
  navItems: { id: string; label: string; icon: React.ReactNode }[];
  onOpenPartnerModal: () => void;
  onOpenProfile: () => void;
  onNavigate: (category: any) => void; // relaxed type to allow 'messages' string
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSelectCategory, activeCategory, navItems, onOpenPartnerModal, onOpenProfile, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-start">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="w-[80%] max-w-xs bg-white h-full relative shadow-2xl flex flex-col transform transition-transform duration-300">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md">С</div>
            <span className="font-bold text-lg text-dark">Меню</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onSelectCategory(item.id as Category); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                        ${activeCategory === item.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-secondary hover:bg-gray-50 hover:text-dark'}`}
              >
                <span className="w-6 flex justify-center">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                onClose();
                // We need a way to open chat list from here. 
                // Since we don't have the prop yet, we will add it to props interface first.
                // But for now, let's assume the parent will handle it or we pass a callback.
                // Actually, better to emit an event or use a prop.
                // Let's assume onNavigate('messages') works if we handle it in App.tsx
                onNavigate('messages');
              }}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <span className="font-bold text-dark text-lg">Сообщения</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenProfile();
              }} className="w-full bg-dark text-white p-3 rounded-xl shadow-lg hover:bg-black transition-all group relative overflow-hidden mb-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-serif font-bold">B</div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-300 font-medium">Для бизнеса</p>
                  <p className="text-sm font-bold">Подключить</p>
                </div>
              </div>
            </button>

            <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">О приложении</p>
            <a href="#" className="block px-4 py-2 text-sm text-secondary hover:text-primary">Правила сервиса</a>
            <a href="#" className="block px-4 py-2 text-sm text-secondary hover:text-primary">Поддержка</a>
          </div>
        </div>
      </div>
    </div>
  );
};