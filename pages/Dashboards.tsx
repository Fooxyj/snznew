
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button, XPBar, Badge } from '../components/ui/Common';
import { Settings, Package, CheckCircle, AlertTriangle, Loader2, Trash2, MapPin, Edit, Upload, X, Heart, Users, FileText, ShoppingBag, Newspaper, ShieldAlert, PieChart, Plus, Star, Zap, Crown, Shield, Calendar, Ticket as TicketIcon, QrCode, Truck, Check } from 'lucide-react';
import { api } from '../services/api';
import { User, Ad, Business, UserRole, Booking, Ticket, Order } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { EditAdModal } from '../components/EditAdModal';

const BadgeIcon: React.FC<{ name: string }> = ({ name }) => {
    switch(name) {
        case 'verified': return <div className="text-blue-500 bg-blue-100 p-1 rounded-full" title="Проверенный"><Star className="w-3 h-3 fill-current" /></div>;
        case 'admin': return <div className="text-red-500 bg-red-100 p-1 rounded-full" title="Администратор"><Shield className="w-3 h-3 fill-current" /></div>;
        case 'quest_master': return <div className="text-purple-500 bg-purple-100 p-1 rounded-full" title="Мастер квестов"><Zap className="w-3 h-3 fill-current" /></div>;
        case 'early_adopter': return <div className="text-orange-500 bg-orange-100 p-1 rounded-full" title="Старожил"><Crown className="w-3 h-3 fill-current" /></div>;
        default: return null;
    }
};

// ... (EditProfileModal and EditBusinessModal remain unchanged) ...
// Edit Profile Modal
const EditProfileModal: React.FC<{ user: User; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ user, isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [avatar, setAvatar] = useState(user.avatar);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const url = await api.uploadImage(file);
            setAvatar(url);
        } catch (e: any) {
            alert(e.message || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateProfile({ name, phone, avatar });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert("Ошибка сохранения: " + (e.message || "Неизвестная ошибка"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Редактирование профиля</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 relative group">
                            <img src={avatar} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="w-6 h-6 text-white" />
                                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Нажмите на фото, чтобы изменить</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                        <input type="text" className="w-full border rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                        <input type="tel" className="w-full border rounded-lg px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7" />
                    </div>
                    <Button disabled={loading} className="w-full">{loading ? 'Сохранение...' : 'Сохранить'}</Button>
                </form>
            </div>
        </div>
    );
};

// Edit Business Modal
const EditBusinessModal: React.FC<{ business: Business; isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ business, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: business.name,
        phone: business.phone,
        category: business.category,
        address: business.address,
        description: business.description,
        workHours: business.workHours,
        image: business.image
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateBusiness(business.id, formData);
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Редактирование бизнеса</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                        <input className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                        <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="Магазины">Магазины</option>
                            <option value="Кафе и рестораны">Кафе и рестораны</option>
                            <option value="Спортзалы и секции">Спортзалы и секции</option>
                            <option value="Услуги">Услуги (Ремонт, Обучение)</option>
                            <option value="Аренда и Отдых">Аренда и Отдых (Бани, Домики)</option>
                            <option value="Медицина">Медицина (Аптеки, Клиники)</option>
                            <option value="Красота">Красота (Салоны, Мастера)</option>
                            <option value="Культура">Культура (Музеи, Театры)</option>
                            <option value="Туризм">Туризм (Экскурсии)</option>
                            <option value="Кино">Кино</option>
                            <option value="Транспорт">Транспорт</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                        <input className="w-full border rounded-lg px-3 py-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время работы</label>
                        <input className="w-full border rounded-lg px-3 py-2" value={formData.workHours} onChange={e => setFormData({...formData, workHours: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                        <input className="w-full border rounded-lg px-3 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                        <textarea className="w-full border rounded-lg px-3 py-2 resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.image ? (
                            <div className="relative group">
                                <img src={formData.image} alt="" className="h-24 mx-auto rounded object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs">Изменить</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                        ) : (
                            <div className="relative cursor-pointer">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{uploading ? "..." : "Фото"}</span>
                                <input type="file" className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <Button disabled={loading || uploading} className="w-full">{loading ? 'Сохранение...' : 'Сохранить изменения'}</Button>
                </form>
            </div>
        </div>
    );
};

// ... (Profile component remains unchanged) ...
// Profile Component
export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'tickets' | 'ads' | 'biz' | 'fav'>('stats');
  
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [myBiz, setMyBiz] = useState<Business[]>([]);
  const [myFavs, setMyFavs] = useState<Ad[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Edit Business Logic
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  // Data loader
  const loadData = async () => {
    const u = await api.getCurrentUser();
    setUser(u);
    if (u) {
        const [content, bookings, tickets, orders] = await Promise.all([
            api.getUserContent(u.id),
            api.getMyBookings(),
            api.getMyTickets(),
            api.getMyOrders()
        ]);
        setMyAds(content.ads);
        setMyBiz(content.businesses);
        setMyFavs(content.favorites || []);
        setMyBookings(bookings);
        setMyTickets(tickets);
        setMyOrders(orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteAd = async (id: string) => {
      if(confirm('Вы уверены, что хотите удалить это объявление?')) {
          try {
            await api.deleteAd(id);
            loadData(); // Reload
          } catch (e: any) {
            alert("Не удалось удалить: " + (e.message || "Ошибка"));
          }
      }
  };

  const handleDeleteBiz = async (id: string) => {
      if(confirm('Вы уверены, что хотите удалить эту организацию? Все товары и записи также будут удалены.')) {
          try {
            await api.deleteBusiness(id);
            loadData(); // Reload
          } catch (e: any) {
            alert("Не удалось удалить: " + (e.message || "Возможно, есть связанные данные, мешающие удалению."));
          }
      }
  };

  const getOrderStatus = (status: string) => {
      switch(status) {
          case 'new': return { label: 'Принят', color: 'text-gray-500', step: 1 };
          case 'cooking': return { label: 'Готовится', color: 'text-orange-500', step: 2 };
          case 'delivery': return { label: 'В пути', color: 'text-blue-500', step: 3 };
          case 'done': return { label: 'Доставлен', color: 'text-green-500', step: 4 };
          default: return { label: 'Неизвестно', color: 'text-gray-500', step: 0 };
      }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;
  if (!user) return <div className="p-10 text-center">Пожалуйста, войдите в систему</div>;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <EditProfileModal 
        user={user} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSuccess={loadData}
      />
      
      {editingBusiness && (
          <EditBusinessModal 
            business={editingBusiness}
            isOpen={!!editingBusiness}
            onClose={() => setEditingBusiness(null)}
            onSuccess={loadData}
          />
      )}

      {editingAd && (
          <EditAdModal 
            ad={editingAd}
            isOpen={!!editingAd}
            onClose={() => setEditingAd(null)}
            onSuccess={loadData}
          />
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <img src={user.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-50 dark:border-blue-900 object-cover" />
          {user.role === UserRole.ADMIN && (
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-4 border-white dark:border-gray-800" title="Администратор">
                  <ShieldAlert className="w-5 h-5" />
              </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                  {user.badges && user.badges.map(b => <BadgeIcon key={b} name={b} />)}
              </div>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              {user.phone && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.phone}</p>}
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="dark:border-gray-600 dark:text-gray-300">
                    <Edit className="w-4 h-4 mr-2" /> Редактировать
                </Button>
                {/* ONLY SHOW ADMIN BUTTON FOR ADMINS */}
                {user.role === UserRole.ADMIN && (
                    <Button variant="danger" size="sm" onClick={() => window.location.hash = '#/admin'}>
                        <Settings className="w-4 h-4 mr-2" /> Админка
                    </Button>
                )}
            </div>
          </div>
          
          <div className="mt-6 max-w-md">
            <XPBar xp={user.xp} />
            <p className="text-xs text-gray-400 mt-2">Публикуйте объявления и оставляйте отзывы, чтобы повышать уровень!</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pt-2 rounded-t-xl overflow-x-auto">
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Статистика</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Заказы ({myOrders.length})</button>
          <button onClick={() => setActiveTab('tickets')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tickets' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Билеты</button>
          <button onClick={() => setActiveTab('ads')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ads' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Объявления</button>
          <button onClick={() => setActiveTab('biz')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'biz' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Организации</button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl border dark:border-gray-700 shadow-sm p-6 min-h-[300px]">
         
         {activeTab === 'stats' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-blue-700 dark:text-blue-400">{myAds.length}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-300">Объявлений</span>
               </div>
               <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-orange-700 dark:text-orange-400">{myBiz.length}</span>
                  <span className="text-sm text-orange-600 dark:text-orange-300">Бизнесов</span>
               </div>
               <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-green-700 dark:text-green-400">{Math.floor(user.xp / 100)}</span>
                  <span className="text-sm text-green-600 dark:text-green-300">Бонусов</span>
               </div>
               <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-purple-700 dark:text-purple-400">{user.xp}</span>
                  <span className="text-sm text-purple-600 dark:text-purple-300">Всего XP</span>
               </div>
             </div>
         )}

         {activeTab === 'orders' && (
             <div className="space-y-6">
                 {myOrders.length > 0 ? myOrders.map(order => {
                     const statusInfo = getOrderStatus(order.status);
                     return (
                         <div key={order.id} className="border dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all">
                             <div className="flex flex-col md:flex-row justify-between mb-4">
                                 <div>
                                     <h4 className="font-bold text-lg dark:text-white mb-1">{order.businessName || 'Заказ'}</h4>
                                     <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <div className="text-right mt-2 md:mt-0">
                                     <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{order.totalPrice} ₽</div>
                                     <p className="text-xs text-gray-400">{order.address}</p>
                                 </div>
                             </div>
                             
                             {/* Tracker */}
                             <div className="relative pt-4 pb-2">
                                 <div className="h-1 bg-gray-200 dark:bg-gray-700 w-full rounded-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                                 <div className={`h-1 bg-green-500 rounded-full absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-1000`} style={{ width: `${(statusInfo.step / 4) * 100}%` }}></div>
                                 
                                 <div className="relative z-10 flex justify-between">
                                     {['new', 'cooking', 'delivery', 'done'].map((s, idx) => {
                                         const isActive = idx + 1 <= statusInfo.step;
                                         return (
                                             <div key={s} className="flex flex-col items-center">
                                                 <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}></div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>
                             <div className={`text-center font-bold text-sm mt-3 ${statusInfo.color}`}>
                                 {statusInfo.label}
                             </div>
                         </div>
                     );
                 }) : (
                     <div className="text-center py-10 text-gray-400">У вас нет заказов</div>
                 )}
             </div>
         )}

         {activeTab === 'tickets' && (
             <div className="space-y-4">
                 {myTickets.length > 0 ? myTickets.map(t => (
                     <div key={t.id} className="relative flex flex-col md:flex-row bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                         {/* Perforated edge illusion */}
                         <div className="hidden md:block absolute top-0 bottom-0 left-2/3 border-l-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                         <div className="hidden md:block absolute -top-3 left-[66.66%] -ml-3 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-b dark:border-gray-700"></div>
                         <div className="hidden md:block absolute -bottom-3 left-[66.66%] -ml-3 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-t dark:border-gray-700"></div>

                         <div className="flex-1 p-5 flex gap-4">
                             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0 overflow-hidden">
                                 <img src={t.eventImage} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-lg dark:text-white mb-1">{t.eventTitle}</h4>
                                 <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                     <Calendar className="w-4 h-4" /> {t.eventDate}
                                 </div>
                                 <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                     <MapPin className="w-4 h-4" /> {t.eventLocation}
                                 </div>
                             </div>
                         </div>

                         <div className="md:w-1/3 bg-gray-50 dark:bg-gray-700/30 p-5 flex flex-col justify-center items-center text-center border-t md:border-t-0">
                             <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ряд {t.row + 1}, Место {t.col + 1}</div>
                             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{t.price} ₽</div>
                             <div className="bg-white p-1 rounded">
                                <QrCode className="w-16 h-16 text-black" />
                             </div>
                             <div className="text-[10px] text-gray-400 mt-2 font-mono">{t.qrCode}</div>
                         </div>
                     </div>
                 )) : (
                     <div className="text-center py-10 text-gray-400">У вас нет купленных билетов</div>
                 )}
             </div>
         )}

         {activeTab === 'ads' && (
             <div className="space-y-4">
                 {myAds.length > 0 ? myAds.map(ad => (
                     <div key={ad.id} className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
                         <img src={ad.image} alt="" className="w-16 h-16 rounded object-cover bg-gray-100" />
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{ad.title}</h4>
                                {ad.status === 'pending' && <Badge color="orange">На проверке</Badge>}
                             </div>
                             <p className="text-blue-600 dark:text-blue-400 font-medium">{ad.price} {ad.currency}</p>
                             <div className="flex items-center gap-2 mt-1">
                                 <Badge color={ad.isVip ? "orange" : "gray"}>{ad.isVip ? "VIP" : ad.category}</Badge>
                                 <span className="text-xs text-gray-400">{ad.date}</span>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingAd(ad)}>
                                 <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="danger" size="sm" onClick={() => handleDeleteAd(ad.id)}>
                                 <Trash2 className="w-4 h-4" />
                             </Button>
                         </div>
                     </div>
                 )) : (
                     <div className="text-center py-10 text-gray-400">У вас пока нет активных объявлений</div>
                 )}
             </div>
         )}

         {activeTab === 'biz' && (
             <div className="space-y-4">
                 <div className="flex justify-end mb-4">
                     <Link to="/business-connect">
                         <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Добавить еще бизнес
                         </Button>
                     </Link>
                 </div>
                 
                 {myBiz.length > 0 ? myBiz.map(biz => (
                     <div key={biz.id} className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
                         <img src={biz.image} alt="" className="w-16 h-16 rounded object-cover bg-gray-100" />
                         <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-gray-900 dark:text-white truncate">{biz.name}</h4>
                             <p className="text-sm text-gray-500 line-clamp-1">{biz.address}</p>
                             <div className="flex items-center gap-2 mt-1">
                                 <Badge color="blue">{biz.category}</Badge>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingBusiness(biz)}>
                                 <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="danger" size="sm" onClick={() => handleDeleteBiz(biz.id)}>
                                 <Trash2 className="w-4 h-4" />
                             </Button>
                         </div>
                     </div>
                 )) : (
                     <div className="text-center py-10 text-gray-400">
                         <p className="mb-4">У вас нет подключенных организаций</p>
                     </div>
                 )}
             </div>
         )}

         {activeTab === 'fav' && (
            <div className="space-y-4">
                {myFavs.length > 0 ? myFavs.map(ad => (
                    <div key={ad.id} className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
                        <img src={ad.image} alt="" className="w-16 h-16 rounded object-cover bg-gray-100" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{ad.title}</h4>
                            <p className="text-blue-600 dark:text-blue-400 font-medium">{ad.price} {ad.currency}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge color="gray">{ad.category}</Badge>
                                <span className="text-xs text-gray-400">{ad.date}</span>
                            </div>
                        </div>
                        <div className="text-red-500">
                            <Heart className="w-5 h-5 fill-current" />
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-400">У вас нет сохраненных объявлений</div>
                )}
            </div>
         )}
      </div>
    </div>
  );
};

// Admin Dashboard
const data = [
  { name: 'Пн', visits: 4000 },
  { name: 'Вт', visits: 3000 },
  { name: 'Ср', visits: 2000 },
  { name: 'Чт', visits: 2780 },
  { name: 'Пт', visits: 1890 },
  { name: 'Сб', visits: 2390 },
  { name: 'Вс', visits: 3490 },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ users: 0, ads: 0, businesses: 0, news: 0 });
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
        // SECURITY CHECK
        const user = await api.getCurrentUser();
        if (!user || user.role !== UserRole.ADMIN) {
            alert("Доступ запрещен!");
            navigate('/');
            return;
        }

        const s = await api.getSystemStats();
        setStats(s);
        const c = await api.getAllContent();
        setRecentItems(Array.isArray(c) ? c : []);
        
        // Load pending moderation
        const pending = await api.getPendingAds();
        setPendingAds(pending);

    } catch (e) {
        console.error(e);
        setRecentItems([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
      if (confirm('Админ: Удалить эту запись?')) {
          try {
            await api.deleteAd(id);
            loadData();
          } catch(e: any) {
            alert("Ошибка удаления: " + e.message);
          }
      }
  };

  const handleApproveAd = async (id: string) => {
      if(confirm("Одобрить объявление?")) {
          await api.approveAd(id);
          loadData();
      }
  };

  const handleRejectAd = async (id: string) => {
      if(confirm("Отклонить объявление? Оно будет удалено.")) {
          await api.rejectAd(id);
          loadData();
      }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const validOptions = pollOptions.filter(o => o.trim().length > 0);
          if (validOptions.length < 2) {
              alert("Минимум 2 варианта ответа");
              return;
          }
          await api.createPoll(pollQuestion, validOptions);
          alert("Опрос создан и опубликован!");
          setPollQuestion('');
          setPollOptions(['', '']);
      } catch (e: any) {
          alert("Ошибка создания опроса: " + e.message);
      }
  };

  const handleOptionChange = (idx: number, val: string) => {
      const newOpts = [...pollOptions];
      newOpts[idx] = val;
      setPollOptions(newOpts);
  };

  if (loading) return <div className="p-10 text-center">Проверка прав доступа...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Центр управления (Админка)</h1>
        <Button variant="secondary" onClick={loadData}>Обновить данные</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
           <div>
               <p className="text-gray-500 text-sm">Пользователей</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-orange-100 rounded-full text-orange-600"><FileText className="w-6 h-6" /></div>
           <div>
               <p className="text-gray-500 text-sm">Объявлений</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ads}</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-green-100 rounded-full text-green-600"><ShoppingBag className="w-6 h-6" /></div>
           <div>
               <p className="text-gray-500 text-sm">Компаний</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.businesses}</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Newspaper className="w-6 h-6" /></div>
           <div>
               <p className="text-gray-500 text-sm">Новостей</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.news}</h3>
           </div>
        </div>
      </div>

      {/* MODERATION QUEUE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                  <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg dark:text-white">Модерация объявлений ({pendingAds.length})</h3>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {pendingAds.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Нет объявлений, ожидающих проверки.</p>
              ) : (
                  pendingAds.map(ad => (
                      <div key={ad.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl gap-4">
                          <div className="flex gap-4 items-center">
                              <img src={ad.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt="" />
                              <div>
                                  <h4 className="font-bold dark:text-white">{ad.title}</h4>
                                  <p className="text-xs text-gray-500">{ad.category} • {ad.price} ₽</p>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{ad.description}</p>
                              </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                onClick={() => handleApproveAd(ad.id)}
                              >
                                  <Check className="w-4 h-4 mr-1" /> Одобрить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger"
                                className="flex-1 sm:flex-none"
                                onClick={() => handleRejectAd(ad.id)}
                              >
                                  <X className="w-4 h-4 mr-1" /> Отклонить
                              </Button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Poll Creator */}
         <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                 <PieChart className="w-5 h-5 text-blue-600" />
                 <h3 className="font-bold text-lg dark:text-white">Создать опрос</h3>
             </div>
             <form onSubmit={handleCreatePoll} className="space-y-3">
                 <div>
                     <label className="text-xs font-bold text-gray-500">Вопрос</label>
                     <input 
                        required
                        className="w-full border rounded-lg p-2 text-sm mt-1" 
                        placeholder="Например: Где установить елку?"
                        value={pollQuestion}
                        onChange={e => setPollQuestion(e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500">Варианты ответов</label>
                     {pollOptions.map((opt, idx) => (
                         <input 
                            key={idx}
                            className="w-full border rounded-lg p-2 text-sm"
                            placeholder={`Вариант ${idx + 1}`}
                            value={opt}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            required
                         />
                     ))}
                     <button 
                        type="button" 
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-xs text-blue-600 font-medium flex items-center gap-1"
                     >
                         <Plus className="w-3 h-3" /> Добавить вариант
                     </button>
                 </div>
                 <Button className="w-full mt-2" size="sm">Опубликовать опрос</Button>
             </form>
         </div>

         {/* Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Посещаемость портала</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Moderation Queue / Activity Log */}
         <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Лента активности</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
               {recentItems.length === 0 ? <p className="text-gray-400 text-sm">Нет недавних действий</p> : recentItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group">
                     <div>
                        <p className="text-sm font-medium line-clamp-1 dark:text-gray-200">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type} • {item.date}</p>
                     </div>
                     <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="danger" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg">
                Вы вошли как Администратор. Будьте осторожны с удалением данных.
            </div>
         </div>
      </div>
    </div>
  );
};

// ... (ConnectBusiness remains unchanged) ...
// Connect Business Page
export const ConnectBusiness: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: 'Магазины',
        address: '',
        description: '',
        workHours: '09:00 - 18:00',
        image: ''
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert(e.message || "Ошибка загрузки фото");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBusiness(formData);
            alert("Бизнес успешно добавлен в каталог!");
            navigate('/category/shops');
        } catch (e: any) {
            alert("Ошибка: " + (e.message || "Неизвестная ошибка"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border dark:border-gray-700">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Подключите свой бизнес</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                    Заполните форму, и ваша компания сразу появится в каталоге Снежинска.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название организации</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border rounded-lg px-4 py-2" 
                            placeholder='ООО "Ромашка"' 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                        <select 
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="Магазины">Магазины</option>
                            <option value="Кафе и рестораны">Кафе и рестораны</option>
                            <option value="Спортзалы и секции">Спортзалы и секции</option>
                            <option value="Услуги">Услуги (Ремонт, Обучение)</option>
                            <option value="Аренда и Отдых">Аренда и Отдых (Бани, Домики)</option>
                            <option value="Медицина">Медицина (Аптеки, Больницы)</option>
                            <option value="Красота">Красота (Салоны, Мастера)</option>
                            <option value="Культура">Культура (Музеи, Театры)</option>
                            <option value="Туризм">Туризм (Экскурсии)</option>
                            <option value="Кино">Кино</option>
                            <option value="Транспорт">Транспорт</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border rounded-lg px-4 py-2" 
                            placeholder='ул. Ленина, 1' 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full border rounded-lg px-4 py-2 resize-none" 
                            placeholder='Чем вы занимаетесь...' 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                        <input 
                            type="tel" 
                            required
                            className="w-full border rounded-lg px-4 py-2" 
                            placeholder='+7 (999) 000-00-00' 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Фотография / Логотип</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative hover:bg-gray-50 transition-colors">
                            {formData.image ? (
                                <div className="relative group">
                                    <img src={formData.image} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-bold">Изменить фото</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    )}
                                    <p className="text-sm text-gray-500">{uploading ? "Загрузка..." : "Нажмите для загрузки"}</p>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Button size="lg" className="w-full" disabled={loading || uploading}>
                        {loading ? 'Сохранение...' : 'Создать компанию'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
