
import React, { useState, useEffect } from 'react';
import { CreateAdFormState, Category, CatalogCategory, Ad } from '../types';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ad: CreateAdFormState) => void;
  catalog: CatalogCategory[];
  initialData?: Ad | null;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onSubmit, catalog, initialData }) => {
  const defaults: CreateAdFormState = {
    title: '',
    description: '',
    price: '',
    category: 'sale',
    subCategory: '',
    contact: '+7 ',
    location: '',
    isPremium: false,
    images: [],
    specs: {}
  };

  const [form, setForm] = useState<CreateAdFormState>(defaults);

  // Pre-fill form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setForm({
                title: initialData.title,
                description: initialData.description,
                price: initialData.price.toString(),
                category: initialData.category,
                subCategory: initialData.subCategory || '',
                contact: initialData.contact,
                location: initialData.location,
                isPremium: initialData.isPremium,
                // Handle both array images and legacy single image
                images: initialData.images && initialData.images.length > 0 
                        ? initialData.images 
                        : (initialData.image ? [initialData.image] : []),
                specs: initialData.specs || {}
            });
        } else {
            setForm(defaults);
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, ''); 

    if (!raw) {
        setForm({...form, contact: '+7 '});
        return;
    }
    if (raw.startsWith('7') || raw.startsWith('8')) {
        raw = raw.slice(1);
    }
    raw = raw.slice(0, 10);
    let formatted = '+7';
    if (raw.length > 0) formatted += ` (${raw.slice(0, 3)}`;
    if (raw.length >= 3) formatted += `) ${raw.slice(3, 6)}`;
    if (raw.length >= 6) formatted += ` ${raw.slice(6, 8)}`;
    if (raw.length >= 8) formatted += ` ${raw.slice(8, 10)}`;
    
    setForm({...form, contact: formatted});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      Promise.all(fileArray.map(file => {
          return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                  if (reader.result) {
                      resolve(reader.result as string);
                  } else {
                      reject("Failed to read file");
                  }
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file as Blob);
          });
      })).then(newImages => {
          setForm(prev => ({ 
              ...prev, 
              images: [...prev.images, ...newImages] 
          }));
      }).catch(err => console.error(err));
      
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setForm(prev => ({ 
        ...prev, 
        images: prev.images.filter((_, index) => index !== indexToRemove) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
    // Don't reset immediately if we want to preserve state during async submit, 
    // but typically we close the modal so reset is fine.
    // However, if we reopen it for 'new ad', the useEffect will clear it anyway.
  };

  const updateSpec = (field: string, value: string) => {
      setForm(prev => ({
          ...prev,
          specs: {
              ...prev.specs,
              [field]: value
          }
      }));
  };

  const currentCategoryData = catalog.find(c => c.id === form.category);
  const showAutoSpecs = form.subCategory === 'Автомобили';
  const showRealEstateSpecs = ['Квартиры', 'Дома, дачи', 'Комнаты'].includes(form.subCategory);
  const isGoodsCategory = form.category === 'sale' && !showAutoSpecs && !showRealEstateSpecs && form.subCategory !== '';

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-secondary mb-2";

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-dark tracking-tight">
                {initialData ? 'Редактирование' : 'Новое объявление'}
            </h2>
            <p className="text-sm text-secondary">
                {initialData ? 'Измените данные и сохраните' : 'Заполните детали, чтобы разместить на доске'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
          
          <div>
            <label className={labelClass}>Что предлагаете?</label>
            <input 
              type="text" 
              required
              className={inputClass}
              placeholder="Например: IPhone 12, Гараж..."
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Категория</label>
              <div className="relative">
                <select 
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={form.category}
                  onChange={e => setForm({
                    ...form, 
                    category: e.target.value as Category,
                    // If we are editing, changing category might clear subcategory, 
                    // but for new ads we definitely want to reset.
                    // For safety, let's reset subCategory unless it matches
                    subCategory: '' 
                  })}
                >
                  <option value="sale">Продажа</option>
                  <option value="rent">Аренда</option>
                  <option value="services">Услуги</option>
                  <option value="jobs">Работа</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Подкатегория</label>
              <div className="relative">
                <select 
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={form.subCategory}
                  onChange={e => setForm({...form, subCategory: e.target.value})}
                  required
                  disabled={!currentCategoryData}
                >
                  <option value="">Выберите...</option>
                  {currentCategoryData?.groups.map((group) => (
                    <optgroup label={group.name} key={group.name}>
                      {group.items.map((item) => (
                        <option value={item} key={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Specs Fields */}
          {showAutoSpecs && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fade-in-up">
                  <h4 className="text-sm font-bold text-dark mb-4">Характеристики автомобиля</h4>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-semibold text-secondary mb-1 block">Год выпуска</label>
                          <input 
                              type="number" 
                              placeholder="2018" 
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                              value={form.specs?.year || ''}
                              onChange={e => updateSpec('year', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-secondary mb-1 block">Пробег (км)</label>
                          <input 
                              type="number" 
                              placeholder="50000" 
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                              value={form.specs?.mileage || ''}
                              onChange={e => updateSpec('mileage', e.target.value)}
                          />
                      </div>
                  </div>
              </div>
          )}

          {showRealEstateSpecs && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fade-in-up">
                  <h4 className="text-sm font-bold text-dark mb-4">Параметры недвижимости</h4>
                  <div className="grid grid-cols-3 gap-4">
                      <div>
                          <label className="text-xs font-semibold text-secondary mb-1 block">Площадь (м²)</label>
                          <input 
                              type="number" 
                              placeholder="54" 
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                              value={form.specs?.area || ''}
                              onChange={e => updateSpec('area', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-secondary mb-1 block">Комнат</label>
                          <input 
                              type="number" 
                              placeholder="2" 
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                              value={form.specs?.rooms || ''}
                              onChange={e => updateSpec('rooms', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-secondary mb-1 block">Этаж</label>
                          <input 
                              type="number" 
                              placeholder="5" 
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                              value={form.specs?.floor || ''}
                              onChange={e => updateSpec('floor', e.target.value)}
                          />
                      </div>
                  </div>
              </div>
          )}

          {isGoodsCategory && (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fade-in-up">
                <h4 className="text-sm font-bold text-dark mb-4">Характеристики товара</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-secondary mb-1 block">Состояние</label>
                        <select 
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer appearance-none"
                            value={form.specs?.condition || ''}
                            onChange={e => updateSpec('condition', e.target.value)}
                        >
                            <option value="">Не выбрано</option>
                            <option value="new">Новое</option>
                            <option value="used">Б/У</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-secondary mb-1 block">Бренд / Производитель</label>
                        <input 
                            type="text" 
                            placeholder="Например: Samsung" 
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                            value={form.specs?.brand || ''}
                            onChange={e => updateSpec('brand', e.target.value)}
                        />
                    </div>
                </div>
             </div>
          )}

          {/* Photo Upload Section */}
          <div>
            <label className={labelClass}>Фотографии {form.images.length > 0 && <span className="text-secondary font-normal">({form.images.length} загружено)</span>}</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Upload Button */}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer relative group">
                    <input 
                        type="file" 
                        accept="image/*"
                        multiple 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <span className="text-xs font-semibold">Добавить</span>
                </div>

                {/* Image Previews */}
                {form.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                type="button"
                                onClick={() => removeImage(idx)} 
                                className="bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        {idx === 0 && (
                            <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm pointer-events-none">
                                Обложка
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Описание</label>
            <textarea 
              required
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Подробное описание вашего предложения..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Цена (₽)</label>
              <input 
                type="number" 
                className={inputClass}
                placeholder="0"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Контакты</label>
              <input 
                type="text" 
                required
                className={inputClass}
                placeholder="+7 (900) 000 00 00"
                value={form.contact}
                onChange={handlePhoneChange}
              />
            </div>
            <div>
              <label className={labelClass}>Район / Улица</label>
              <input 
                type="text" 
                className={inputClass}
                placeholder="Центр"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>
          </div>

          <div 
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${form.isPremium ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'}`} 
            onClick={() => setForm({...form, isPremium: !form.isPremium})}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.isPremium ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-gray-300'}`}>
              {form.isPremium && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
            <div>
              <span className="block font-bold text-dark text-sm">Выделить объявление (VIP)</span>
              <span className="text-xs text-secondary">Закреп в топе и яркая рамка. Стоимость: 500₽</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-secondary hover:bg-gray-100 transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-dark text-white rounded-xl font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 transform"
            >
              {initialData ? 'Сохранить' : 'Опубликовать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
