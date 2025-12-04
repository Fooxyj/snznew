
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, Newspaper, ShoppingBag, Coffee, Film, Map, 
  Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Briefcase, 
  User as UserIcon, Bell, Search, PlusCircle, LogIn, LogOut, MessageCircle, HelpCircle, Car, Gift, Users, Flag, Settings, Moon, Sun, Trophy, ShoppingCart, Truck, Heart, Repeat, Key, ChevronLeft, ArrowUp, Calendar, ChevronDown, ChevronRight, Droplets, Wrench, Building2, Trash2
} from 'lucide-react';
import { CATALOG_MENU, SERVICES_MENU } from '../constants';
import { Button } from './ui/Common';
import { UserRole, User, Notification } from '../types';
import { api } from '../services/api';
import { useTheme } from './ThemeProvider';
import { useCart } from './CartProvider';

const ICON_MAP: Record<string, React.FC<any>> = {
  Newspaper, ShoppingBag, Coffee, Film, Map, Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Key, Truck, Car, Droplets, Wrench, Building2, HelpCircle, Briefcase, Repeat, Users, Heart, Flag, Trophy, Gift, MessageCircle
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'info' | 'success'} | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State for collapsible menus
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let subPromise: Promise<{ unsubscribe: () => void }> | null = null;

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
            subPromise = api.subscribeToNotifications(u.id, (n) => {
                setNotifications(prev => [n, ...prev]);
                showToast(n.text);
            });
        }
    };
    load();

    return () => {
        if (subPromise) {
            subPromise.then(sub => sub.unsubscribe());
        }
    };
  }, []);

  // Scroll listener attached to the main container
  useEffect(() => {
    const handleScroll = () => {
        if (mainRef.current) {
            if (mainRef.current.scrollTop > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        }
    };

    const el = mainRef.current;
    if (el) {
        el.addEventListener('scroll', handleScroll);
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
      if (mainRef.current) {
          mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }, [location.pathname]);

  const scrollToTop = () => {
      if (mainRef.current) {
          mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const showToast = (msg: string) => {
      setToast({ msg, type: 'info' });
      setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await api.signOut();
    navigate('/auth');
    setIsSidebarOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsSidebarOpen(false);
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

  const handleDeleteNotif = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isHome = location.pathname === '/';

  // Exclusive Accordion Logic: Only one menu open at a time
  const toggleMenu = (id: string) => {
      setOpenMenus(prev => prev.includes(id) ? [] : [id]);
  };

  const renderMenuSection = (menuItems: any[]) => {
      return menuItems.map((item) => {
          const Icon = ICON_MAP[item.icon as string] || Home;
          const isOpen = openMenus.includes(item.id);
          const isItemActive = item.path ? isActive(item.path) : false;
          // Check if any child is active to keep expanded
          const isChildActive = item.submenu.some((sub: any) => isActive(sub.path));
          
          useEffect(() => {
              if (isChildActive && !isOpen) {
                  setOpenMenus([item.id]); // Open only this one
              }
          }, [isChildActive]);

          return (
              <div key={item.id} className="mb-1">
                  <div 
                    className={`flex items-center justify-between px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isItemActive || isChildActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    onClick={() => toggleMenu(item.id)}
                  >
                      <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${isItemActive || isChildActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                          {item.title}
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </div>
                  
                  {isOpen && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                          {item.submenu.map((sub: any, idx: number) => {
                              const SubIcon = sub.icon ? ICON_MAP[sub.icon] : null;
                              return (
                                <Link 
                                    key={idx} 
                                    to={sub.path}
                                    onClick={closeSidebar}
                                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive(sub.path) ? 'text-blue-600 font-medium bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                >
                                    {SubIcon && <SubIcon className={`w-4 h-4 mr-2 ${isActive(sub.path) ? 'text-blue-500' : 'text-gray-400'}`} />}
                                    {sub.title}
                                </Link>
                              );
                          })}
                      </div>
                  )}
              </div>
          );
      });
  };

  // Helper to render notification list content
  const renderNotificationList = () => (
      <div onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-50 dark:border-gray-700/50 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
            <span className="font-bold text-gray-900 dark:text-white">Уведомления</span>
            <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Нет новых уведомлений</p>
                </div>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors last:border-0 relative group">
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug pr-6">{n.text}</p>
                        <div className="flex justify-between items-center mt-1.5">
                            <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                            <button 
                                type="button"
                                onClick={(e) => handleDeleteNotif(e, n.id)} 
                                className="text-gray-300 hover:text-red-500 p-1 cursor-pointer z-20"
                                title="Удалить"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex transition-colors duration-200 font-sans">
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-24 right-6 z-[100] bg-white dark:bg-gray-800 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 flex items-center gap-4 animate-slide-in max-w-sm">
             <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Bell className="w-5 h-5" />
             </div>
             <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Уведомление</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{toast.msg}</p>
             </div>
          </div>
      )}

      {/* Backdrop for closing dropdowns */}
      {showNotif && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotif(false)} />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-40 px-4 py-3 flex items-center justify-between h-[64px]">
        {isHome ? (
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <Menu className="w-6 h-6" />
            </button>
        ) : (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <ChevronLeft className="w-6 h-6" />
            </button>
        )}
        
        {/* Mobile Search Input */}
        <form onSubmit={handleSearch} className="flex-1 mx-3 relative flex items-center h-10">
             <input 
                type="text" 
                placeholder="Поиск..." 
                className="w-full pl-9 pr-3 h-full bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white border-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
             />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </form>

        <div className="flex items-center gap-1 shrink-0 relative">
             <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl h-10 w-10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>}
             </Link>
             <div className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer h-10 w-10 flex items-center justify-center" onClick={handleNotifClick}>
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
            </div>

            {/* Mobile Notification Dropdown */}
            {showNotif && (
                <div className="absolute top-12 right-0 w-72 max-w-[90vw] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                    {renderNotificationList()}
                </div>
            )}
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <Link to="/" className="flex flex-col" onClick={closeSidebar}>
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none tracking-tight">Снежинск</h1>
            <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mt-1 ml-0.5">Онлайн</span>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-0.5 custom-scrollbar">
          <NavItem to="/" icon={Home} label="Главная" active={isActive('/')} onClick={closeSidebar} />
          
          <div className="mt-6 mb-2 px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Каталог
          </div>
          
          <NavItem to="/category/shops" icon={ShoppingBag} label="Магазины" active={isActive('/category/shops')} onClick={closeSidebar} />

          {renderMenuSection(CATALOG_MENU)}

          <NavItem to="/category/emergency" icon={Siren} label="Экстренные службы" active={isActive('/category/emergency')} onClick={closeSidebar} />

          <div className="mt-6 mb-2 px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Сервисы
          </div>
          
          {renderMenuSection(SERVICES_MENU)}

          <div className="pt-6 pb-4">
           {user && !hasBusiness && (
                <NavLink to="/business-connect" onClick={closeSidebar}>
                    <Button variant="secondary" size="sm" className="w-full border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-blue-600 hover:border-blue-300 bg-transparent hover:bg-blue-50/50">
                        <PlusCircle className="w-4 h-4 mr-2" /> Подключить бизнес
                    </Button>
                </NavLink>
           )}
           {user && hasBusiness && (
                <NavLink to="/business-crm" onClick={closeSidebar}>
                    <div className="bg-gray-900 dark:bg-black text-white p-3 rounded-xl flex items-center justify-between group cursor-pointer shadow-lg shadow-gray-200 dark:shadow-none hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-gray-700 rounded-lg">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">Кабинет бизнеса</span>
                        </div>
                    </div>
                </NavLink>
           )}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shrink-0">
            {user && (
              <Link to="/settings" onClick={closeSidebar} className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 mb-1">
                  <Settings className="w-4 h-4 mr-3" /> Настройки
              </Link>
            )}
            {user && (
                <button onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 mb-1">
                    <LogOut className="w-4 h-4 mr-3" /> Выйти
                </button>
            )}
            <button onClick={toggleTheme} className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20">
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />} 
                {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md h-20 px-8 z-30 sticky top-0 transition-colors duration-200">
             {/* Left side with Back button if not home */}
             <div className="flex items-center gap-4 flex-1">
                 {!isHome && (
                     <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                         <ChevronLeft className="w-5 h-5" />
                     </button>
                 )}
                 {/* Search */}
                 <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Поиск событий, мест, людей..." 
                      className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all dark:text-white dark:placeholder-gray-500 shadow-sm focus:shadow-md"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                 </form>
             </div>

             {/* Right Actions */}
             <div className="flex items-center space-x-5 ml-6">
                <Link to="/classifieds">
                    <Button variant="primary" size="sm" className="flex items-center gap-2 shadow-lg shadow-blue-500/20 rounded-xl px-5">
                        <PlusCircle className="w-4 h-4" />
                        <span>Подать</span>
                    </Button>
                </Link>

                <div className="flex items-center space-x-2 relative">
                    <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>}
                    </Link>

                    {user ? (
                        <>
                            <Link to="/chat" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </Link>
                            
                            {/* Notification Bell */}
                            <div className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" onClick={handleNotifClick}>
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>}
                            </div>

                            {/* Desktop Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    {renderNotificationList()}
                                </div>
                            )}

                            <Link to="/profile" className="flex items-center space-x-3 pl-3 py-1 pr-1 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                <div className="text-right hidden xl:block">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
                                    <p className="text--[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">{user.xp} XP</p>
                                </div>
                                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" />
                            </Link>
                        </>
                    ) : (
                        <Link to="/auth" className="ml-4">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl">
                                <LogIn className="w-4 h-4" /> Войти
                            </Button>
                        </Link>
                    )}
                </div>
             </div>
          </header>

          {/* Main Scrollable Area */}
          <main 
            ref={mainRef}
            className="flex-1 overflow-y-auto overflow-x-hidden pt-[72px] lg:pt-0 pb-20 lg:pb-0 bg-[#F8FAFC] dark:bg-gray-900 transition-colors duration-200"
          >
            {children}
          </main>

          {/* Scroll To Top Button */}
          <button 
            onClick={scrollToTop}
            className={`fixed bottom-24 right-4 lg:bottom-10 lg:right-10 z-[60] bg-blue-600/90 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          >
              <ArrowUp className="w-6 h-6" />
          </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-50 flex justify-around py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <Home className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
        </NavLink>
        <NavLink 
            to="/classifieds" 
            className={({isActive}) => `flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
        </NavLink>
        
        {/* Central Burger Menu Button */}
        <div className="relative -top-6 cursor-pointer" onClick={toggleSidebar}>
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-gray-900 transition-transform active:scale-95">
                <Building2 className="w-7 h-7" />
            </div>
        </div>

        <NavLink 
            to="/chat" 
            className={({isActive}) => `flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <MessageCircle className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
        </NavLink>
        <NavLink 
            to={user ? "/profile" : "/auth"} 
            className={({isActive}) => `flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            {user ? (
                 <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${isActive ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}>
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                 </div>
            ) : (
                <UserIcon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            )}
        </NavLink>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: any; label: string; active: boolean; onClick?: () => void }> = ({ to, icon: Icon, label, active, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={`
      flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 mb-1
      ${active 
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }
    `}
  >
    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500'}`} strokeWidth={active ? 2.5 : 2} />
    {label}
  </NavLink>
);
