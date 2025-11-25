import React, { useState } from 'react';
import { Ad, NewsItem } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ads: Ad[];
  onUpdateAdStatus: (adId: string, status: 'approved' | 'rejected') => void;
  onUpdateAdContent: (adId: string, updatedFields: Partial<Ad>) => void;
  onAddNews: (newsItem: NewsItem) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, ads, onUpdateAdStatus, onUpdateAdContent, onAddNews }) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'active_ads' | 'news'>('moderation');
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ad>>({});
  
  // News Form State
  const [newsForm, setNewsForm] = useState({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      image: ''
  });

  if (!isOpen) return null;

  const pendingAds = ads.filter(ad => ad.status === 'pending');
  const approvedAds = ads.filter(ad => ad.status === 'approved');

  const handleEditClick = (ad: Ad) => {
      setEditingAdId(ad.id);
      setEditForm({
          title: ad.title,
          description: ad.description,
          price: ad.price
      });
  };

  const handleSaveEdit = (adId: string) => {
      onUpdateAdContent(adId, editForm);
      setEditingAdId(null);
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newItem: NewsItem = {
          id: Date.now().toString(),
          title: newsForm.title,
          excerpt: newsForm.excerpt,
          content: newsForm.content,
          category: newsForm.category,
          image: newsForm.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
          date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      };
      onAddNews(newItem);
      setNewsForm({ title: '', excerpt: '', content: '', category: '', image: '' });
      alert('Новость опубликована!');
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-red-600/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
             <div>
                <h2 className="text-xl font-bold text-dark">Админ-панель</h2>
                <p className="text-xs text-secondary">Модерация и управление контентом</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 p-4 space-y-2">
                <button 
                  onClick={() => setActiveTab('moderation')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'moderation' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Модерация
                    {pendingAds.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingAds.length}</span>}
                </button>
                <button 
                  onClick={() => setActiveTab('active_ads')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'active_ads' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Все объявления
                </button>
                <button 
                  onClick={() => setActiveTab('news')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'news' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    Новости
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50">
                
                {activeTab === 'moderation' && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-dark mb-6">Ожидают проверки</h3>
                        
                        {pendingAds.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-dark">Всё чисто!</h3>
                                <p className="text-secondary">Нет новых объявлений для проверки.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingAds.map(ad => (
                                    <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                        <div className="w-full md:w-64 h-48 relative shrink-0 bg-gray-100">
                                            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                            {ad.isPremium && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">VIP</span>}
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            
                                            {editingAdId === ad.id ? (
                                                <div className="space-y-3 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg">
                                                    <h4 className="font-bold text-blue-800 text-sm">Режим редактирования</h4>
                                                    <input 
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.title || ''}
                                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                                        placeholder="Заголовок"
                                                    />
                                                    <textarea 
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.description || ''}
                                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                                        placeholder="Описание"
                                                        rows={3}
                                                    />
                                                    <input 
                                                        type="number"
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.price || ''}
                                                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                                        placeholder="Цена"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleSaveEdit(ad.id)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold"
                                                        >
                                                            Сохранить
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingAdId(null)}
                                                            className="text-gray-500 px-3 py-1 rounded text-sm font-medium"
                                                        >
                                                            Отмена
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-lg font-bold text-dark">{ad.title}</h4>
                                                        <span className="text-primary font-bold">{ad.price} ₽</span>
                                                    </div>
                                                    <div className="text-xs text-secondary mb-3 flex gap-2">
                                                        <span className="bg-gray-100 px-2 py-1 rounded">{ad.category}</span>
                                                        <span className="bg-gray-100 px-2 py-1 rounded">{ad.subCategory}</span>
                                                        <span>{ad.date}</span>
                                                    </div>
                                                    <p className="text-sm text-secondary line-clamp-2 mb-4">{ad.description}</p>
                                                </>
                                            )}
                                            
                                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                                <button 
                                                    onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    Одобрить
                                                </button>
                                                
                                                {!editingAdId && (
                                                    <button 
                                                        onClick={() => handleEditClick(ad)}
                                                        className="px-4 bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2 rounded-lg transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    Отклонить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'active_ads' && (
                     <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-dark mb-6">Активные объявления</h3>
                        <div className="space-y-6">
                             {approvedAds.map(ad => (
                                <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                    <div className="w-full md:w-48 h-40 relative shrink-0 bg-gray-100">
                                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col">
                                         {editingAdId === ad.id ? (
                                                <div className="space-y-3 mb-2 bg-blue-50 p-4 rounded-xl">
                                                    <input 
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.title || ''}
                                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                                    />
                                                    <textarea 
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.description || ''}
                                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                                        rows={2}
                                                    />
                                                    <input 
                                                        type="number"
                                                        className="w-full p-2 rounded border border-gray-300 text-sm"
                                                        value={editForm.price || ''}
                                                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setEditingAdId(null)} className="text-gray-500 text-sm font-medium">Отмена</button>
                                                        <button onClick={() => handleSaveEdit(ad.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Сохранить</button>
                                                    </div>
                                                </div>
                                         ) : (
                                            <>
                                                <h4 className="font-bold text-dark">{ad.title}</h4>
                                                <p className="text-sm text-secondary line-clamp-1 mb-2">{ad.description}</p>
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="font-bold text-primary">{ad.price} ₽</span>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleEditClick(ad)}
                                                            className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-100"
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button 
                                                            onClick={() => { if(confirm('Удалить объявление?')) onUpdateAdStatus(ad.id, 'rejected'); }}
                                                            className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                         )}
                                    </div>
                                </div>
                             ))}
                        </div>
                     </div>
                )}

                {activeTab === 'news' && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-dark mb-6">Создание новости</h3>
                        <form onSubmit={handleNewsSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                            
                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Заголовок</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newsForm.title}
                                    onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                                    placeholder="Громкий заголовок"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-2">Категория</label>
                                    <select 
                                        required
                                        value={newsForm.category}
                                        onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                                    >
                                        <option value="">Выберите...</option>
                                        <option value="Город">Город</option>
                                        <option value="Спорт">Спорт</option>
                                        <option value="Культура">Культура</option>
                                        <option value="ЖКХ">ЖКХ</option>
                                        <option value="Происшествия">Происшествия</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-2">URL Картинки</label>
                                    <input 
                                        type="text" 
                                        value={newsForm.image}
                                        onChange={e => setNewsForm({...newsForm, image: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Краткое описание (Анонс)</label>
                                <textarea 
                                    required
                                    rows={2}
                                    value={newsForm.excerpt}
                                    onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})}
                                    placeholder="Пара предложений для превью..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Полный текст новости</label>
                                <textarea 
                                    required
                                    rows={6}
                                    value={newsForm.content}
                                    onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                                    placeholder="Основной текст статьи..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-dark text-white font-bold text-lg py-3 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95">
                                Опубликовать
                            </button>

                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};