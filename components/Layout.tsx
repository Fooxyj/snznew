
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, Newspaper, ShoppingBag, Coffee, Film, Map, 
  Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Briefcase, 
  User as UserIcon, Bell, Search, PlusCircle, LogIn, LogOut, MessageCircle, HelpCircle, Eye, Car, Gift, Users, Flag, Settings, Moon, Sun, Trophy, ShoppingCart, Wallet, Truck, Lightbulb, Heart, Repeat, Key
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Button } from './ui/Common';
import { UserRole, User, Notification } from '../types';
import { api } from '../services/api';
import { useTheme } from './ThemeProvider';
import { useCart } from './CartProvider';

const ICON_MAP: Record<string, React.FC<any>> = {
  Newspaper, ShoppingBag, Coffee, Film, Map, Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Key
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'info' | 'success'} | null>(null);
  
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial Load
    const load = async () => {
        const u = await api.getCurrentUser();
        setUser(u);
        if (u) {
            // Check if user has business
            const biz = await api.getMyBusiness();
            setHasBusiness(!!biz);

            api.getNotifications().then(setNotifications);
            
            // Subscribe to real-time notifications
            const sub = api.subscribeToNotifications(u.id, (n) => {
                setNotifications(prev => [n, ...prev]);
                showToast(n.text);
            });

            return () => sub.unsubscribe();
        }
    };
    load();
  }, []);

  const showToast = (msg: string) => {
      setToast({ msg, type: 'info' });
      setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await api.signOut();
    navigate('/auth');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotifClick = async () => {
      setShowNotif(!showNotif);
      if (!showNotif && user) {
          // Mark all as read locally for UI
          const unread = notifications.filter(n => !n.isRead);
          unread.forEach(n => api.markNotificationRead(n.id));
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-20 right-5 z-[100] bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 shadow-xl rounded-lg p-4 flex items-center gap-3 animate-slide-in max-w-sm">
             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bell className="w-5 h-5" />
             </div>
             <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Новое уведомление</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{toast.msg}</p>
             </div>
          </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Mobile Search Input */}
        <form onSubmit={handleSearch} className="flex-1 mx-4 relative">
             <input 
                type="text" 
                placeholder="Поиск..." 
                className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-colors dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
             />
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        </form>

        <div className="flex items-center gap-3">
             <Link to="/cart" className="relative cursor-pointer text-gray-600 dark:text-gray-300">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white dark:border-gray-800">{cartCount}</span>}
             </Link>
             <div className="relative cursor-pointer" onClick={handleNotifClick}>
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
            </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col">
            <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400 leading-none">Снежинск</h1>
            <span className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase mt-1">Онлайн</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavItem to="/" icon={Home} label="Главная" active={isActive('/')} />
          
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Разделы
          </div>
          
          {CATEGORIES.map(cat => (
            <NavItem 
              key={cat.id}
              to={cat.id === 'news' ? '/news' : `/category/${cat.id}`} 
              icon={ICON_MAP[cat.icon as string] || Home} 
              label={cat.label} 
              active={isActive(cat.id === 'news' ? '/news' : `/category/${cat.id}`)}
            />
          ))}

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Сервисы
          </div>
          <NavItem to="/charity" icon={Heart} label="Добро" active={isActive('/charity')} />
          <NavItem to="/smart-city" icon={Eye} label="Умный Город" active={isActive('/smart-city')} />
          <NavItem to="/rentals" icon={Repeat} label="Прокат вещей" active={isActive('/rentals')} />
          <NavItem to="/housing" icon={Lightbulb} label="ЖКХ / Мой Дом" active={isActive('/housing')} />
          <NavItem to="/wallet" icon={Wallet} label="Кошелек" active={isActive('/wallet')} />
          <NavItem to="/delivery" icon={Truck} label="Курьерам" active={isActive('/delivery')} />
          <NavItem to="/communities" icon={Users} label="Сообщества" active={isActive('/communities')} />
          <NavItem to="/quests" icon={Flag} label="Квесты" active={isActive('/quests')} />
          <NavItem to="/monitor" icon={Eye} label="Городской контроль" active={isActive('/monitor')} />
          <NavItem to="/rides" icon={Car} label="Попутчики" active={isActive('/rides')} />
          <NavItem to="/jobs" icon={Briefcase} label="Работа" active={isActive('/jobs')} />
          <NavItem to="/classifieds" icon={ShoppingBag} label="Доска объявлений" active={isActive('/classifieds')} />
          <NavItem to="/lost-found" icon={HelpCircle} label="Бюро находок" active={isActive('/lost-found')} />
          <NavItem to="/bonus-shop" icon={Gift} label="Магазин бонусов" active={isActive('/bonus-shop')} />
          <NavItem to="/leaderboard" icon={Trophy} label="Доска Почета" active={isActive('/leaderboard')} />

          {user && (
            <NavItem to="/chat" icon={MessageCircle} label="Сообщения" active={isActive('/chat')} />
          )}
          {user && !hasBusiness && (
             <div className="px-3 mt-6">
               <NavLink to="/business-connect">
                <Button variant="secondary" size="sm" className="w-full shadow-lg shadow-orange-100 dark:shadow-none border border-orange-200 dark:border-orange-900">
                  Подключить бизнес
                </Button>
               </NavLink>
             </div>
           )}
           {user && hasBusiness && (
             <div className="px-3 mt-6">
               <NavLink to="/business-crm">
                <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-md">
                  <Briefcase className="w-4 h-4 mr-2" /> Кабинет бизнеса
                </Button>
               </NavLink>
             </div>
           )}
        </nav>
        
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
            {user && (
              <Link to="/settings" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Settings className="w-4 h-4 mr-2" /> Настройки
              </Link>
            )}
            {user && (
                <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <LogOut className="w-4 h-4 mr-2" /> Выйти
                </button>
            )}
            <button onClick={toggleTheme} className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />} 
                {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 h-16 px-8 border-b dark:border-gray-700 shadow-sm z-30 sticky top-0 transition-colors duration-200">
             {/* Search */}
             <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Поиск событий, объявлений, мест..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-300 dark:focus:border-blue-700 transition-all dark:text-white dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </form>

             {/* Right Actions */}
             <div className="flex items-center space-x-6 ml-6">
                <Link to="/classifieds">
                    <Button variant="primary" size="sm" className="flex items-center gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" />
                        <span>Подать объявление</span>
                    </Button>
                </Link>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                <div className="flex items-center space-x-4 relative">
                    <button onClick={toggleTheme} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>

                    <Link to="/cart" className="relative cursor-pointer text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white dark:border-gray-800">{cartCount}</span>}
                    </Link>

                    {user ? (
                        <>
                            <Link to="/chat" className="relative cursor-pointer text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </Link>
                            
                            {/* Notification Bell */}
                            <div className="relative cursor-pointer" onClick={handleNotifClick}>
                                <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>}
                            </div>

                            {/* Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden">
                                    <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-700 dark:text-gray-200 flex justify-between">
                                        <span>Уведомления</span>
                                        <button onClick={() => setShowNotif(false)}><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-gray-400 py-6">Нет новых уведомлений</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <Link to="/profile" className="flex items-center space-x-3 pl-2 py-1 pr-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                                <div className="text-right hidden xl:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.xp} XP</p>
                                </div>
                                <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 object-cover" />
                            </Link>
                        </>
                    ) : (
                        <Link to="/auth">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                <LogIn className="w-4 h-4" /> Войти
                            </Button>
                        </Link>
                    )}
                </div>
             </div>
          </header>

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 pb-20 lg:pb-0 bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
            {children}
          </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Главная</span>
        </NavLink>
        <NavLink 
            to="/classifieds" 
            className={({isActive}) => `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <ShoppingBag className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Объявления</span>
        </NavLink>
        <NavLink 
            to="/chat" 
            className={({isActive}) => `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Чат</span>
        </NavLink>
        <NavLink 
            to={user ? "/profile" : "/auth"} 
            className={({isActive}) => `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            {user ? (
                 <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}>
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                 </div>
            ) : (
                <UserIcon className="w-6 h-6 mb-1" />
            )}
            <span className="text-[10px] font-medium mt-0.5">{user ? 'Профиль' : 'Войти'}</span>
        </NavLink>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: any; label: string; active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <NavLink 
    to={to} 
    className={`
      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5
      ${active 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
      }
    `}
  >
    <Icon className={`w-4 h-4 mr-3 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500'}`} />
    {label}
  </NavLink>
);
