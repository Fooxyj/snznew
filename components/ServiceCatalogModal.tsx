import React, { useState, useEffect } from 'react';
import { Category, CatalogCategory } from '../types';

interface ServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CatalogCategory[];
  onSelect: (category: Category, subcategory: string) => void;
  initialCategory?: Category;
}

export const ServiceCatalogModal: React.FC<ServiceCatalogModalProps> = ({ isOpen, onClose, catalog, onSelect, initialCategory = 'sale' }) => {
  const [activeTab, setActiveTab] = useState<Category>(initialCategory);

  // Sync active tab when modal opens or initialCategory changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialCategory === 'news' || initialCategory === 'all' ? 'sale' : initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const activeData = catalog.find(c => c.id === activeTab);

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-dark tracking-tight">Каталог</h2>
            <p className="text-sm text-secondary">Найдите нужную категорию</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col">
                {catalog.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-6 py-4 text-left font-semibold text-sm transition-all whitespace-nowrap md:whitespace-normal flex-shrink-0
                            ${activeTab === cat.id 
                                ? 'bg-white text-primary border-l-4 border-primary shadow-sm' 
                                : 'text-secondary hover:bg-gray-100 hover:text-dark border-l-4 border-transparent'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8 bg-white">
                {activeData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {activeData.groups.map((group, idx) => (
                            <div key={idx} className="break-inside-avoid">
                                <h3 className="text-lg font-bold text-dark mb-3 pb-2 border-b border-gray-100">
                                    {group.name}
                                </h3>
                                <ul className="space-y-2">
                                    {group.items.map((item, i) => (
                                        <li key={i}>
                                            <button 
                                                onClick={() => { onSelect(activeTab, item); onClose(); }}
                                                className="text-secondary hover:text-primary hover:translate-x-1 transition-all text-sm w-full text-left py-1"
                                            >
                                                {item}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-secondary">
                        Выберите категорию
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};