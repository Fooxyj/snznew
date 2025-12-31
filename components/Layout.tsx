
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Menu, X, Home, Newspaper, ShoppingBag, Coffee, Film, Map, 
  Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Briefcase, 
  User as UserIcon, Bell, Search, PlusCircle, LogIn, LogOut, MessageCircle, HelpCircle, Car, Gift, Users, Flag, Settings, Trophy, Truck, Heart, Repeat, Key, ChevronLeft, ArrowUp, Calendar, ChevronDown, ChevronRight, Droplets, Wrench, Building2, Trash2, Lightbulb, MessageSquare, AlertTriangle, Eye, CheckCheck, CheckCircle, Shield, LayoutGrid
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CATALOG_MENU, SERVICES_MENU } from '../constants';
import { Button } from './ui/Common';
import { UserRole, Notification } from '../types';
import { api } from '../services/api';
import { useTheme } from './ThemeProvider';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { SuggestIdeaModal } from './SuggestIdeaModal';

const Cloud: React.FC<any> = (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
        <path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.2-3.1-2.8-5.5-5.9-5.5C4 10.5 1.5 13 1.5 16.1c0 2.2 1.3 4 3.2 4.9" />
        <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.5 0-.9.1-1.3.2" />
    </svg>
);

const ICON_MAP: Record<string, React.FC<any>> = {
  Newspaper, ShoppingBag, Coffee, Film, Map, Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Key, Truck, Car, Droplets, Wrench, Building2, HelpCircle, Briefcase, Repeat, Users, Heart, Flag, Trophy, Gift, MessageCircle, AlertTriangle, Home, Eye, Calendar, LayoutGrid, Cloud: Cloud
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link 
    to={to}
    onClick={onClick}
    className={`flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
    }`}
  >
    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-gray-500'}`} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'info' | 'success'} | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: api.getCurrentUser,
    staleTime: 1000 * 60 * 5 
  });

  const { data: myBusinesses = [] } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: api.getMyBusinesses,
    enabled: !!user
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    enabled: !!user,
    initialData: [],
    refetchInterval: 10000 
  });

  const { data: chatUnreadCount = 0 } = useQuery({
    queryKey: ['chatUnread'],
    queryFn: api.getUnreadChatsCount,
    enabled: !!user,
    initialData: 0,
    refetchInterval: 3000 
  });

  const hasBusiness = myBusinesses && myBusinesses.length > 0;

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase.channel('global-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => queryClient.invalidateQueries({ queryKey: ['ads'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => queryClient.invalidateQueries({ queryKey: ['stories'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        queryClient.invalidateQueries({ queryKey: ['businesses'] });
        queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  useEffect(() => {
    const handleScroll = () => {
        if (mainRef.current) {
            setShowScrollTop(mainRef.current.scrollTop > 300);
        }
    };
    const el = mainRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const scrollToTop = () => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const resetMenus = () => { setOpenMenus([]); setIsSidebarOpen(false); };
  const handleBack = () => navigate(-1);
  
  const handleLogout = async () => {
    await api.signOut();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setOpenMenus([]);
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

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const isFullScreenPage = ['/chat', '/map', '/quests'].some(p => location.pathname.startsWith(p));

  const renderMenuSection = (menuItems: any[]) => {
      return menuItems.map((item) => {
          const Icon = ICON_MAP[item.icon as string] || Home;
          const isOpen = openMenus.includes(item.id);
          const isChildActive = item.submenu.some((sub: any) => isActive(sub.path));
          
          return (
              <div key={item.id} className="mb-1">
                  <div 
                    className={`flex items-center justify-between px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${isChildActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                    onClick={() => setOpenMenus(prev => prev.includes(item.id) ? [] : [item.id])}
                  >
                      <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${isChildActive ? 'text-blue-600' : 'text-gray-400'}`} />
                          {item.title}
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </div>
                  {isOpen && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                          {item.submenu.map((sub: any, idx: number) => (
                            <Link 
                                key={idx} 
                                to={sub.path}
                                onClick={closeSidebar}
                                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive(sub.path) ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                {sub.title}
                            </Link>
                          ))}
                      </div>
                  )}
              </div>
          );
      });
  };

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-gray-900 flex overflow-hidden transition-colors duration-200">
      <SuggestIdeaModal isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} />

      {/* Sidebar Desktop/Mobile */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[110] w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <Link to="/" className="flex flex-col" onClick={resetMenus}>
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">Снежинск</h1>
            <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mt-1">Онлайн</span>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-0.5 custom-scrollbar">
          <NavItem to="/" icon={Home} label="Главная" active={location.pathname === '/'} onClick={resetMenus} />
          <NavItem to="/map" icon={Map} label="Карта" active={isActive('/map')} onClick={resetMenus} />
          <div className="mt-6 mb-2 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Каталог</div>
          <NavItem to="/category/shops" icon={ShoppingBag} label="Магазины" active={isActive('/category/shops')} onClick={resetMenus} />
          {renderMenuSection(CATALOG_MENU)}
          <div className="mt-6 mb-2 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Сервисы</div>
          {renderMenuSection(SERVICES_MENU)}
          {user && (
            <div className="mt-6">
              <Link to={hasBusiness ? "/business-crm" : "/business-connect"} onClick={resetMenus} className="block bg-gray-900 dark:bg-blue-600 text-white p-4 rounded-2xl font-bold text-center text-sm shadow-xl active:scale-95 transition-transform">
                {hasBusiness ? 'Кабинет бизнеса' : 'Подключить бизнес'}
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
           <Link to="/legal" onClick={closeSidebar} className="flex items-center text-sm font-medium text-gray-500 w-full p-2 hover:text-blue-600 transition-colors"><Shield className="w-4 h-4 mr-3" /> Правовая информация</Link>
           <button onClick={() => { setIsIdeaModalOpen(true); closeSidebar(); }} className="flex items-center text-sm font-medium text-gray-500 w-full p-2 hover:text-blue-600 transition-colors"><MessageSquare className="w-4 h-4 mr-3" /> Жалобы и предложения</button>
           {user && <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-500 w-full p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-1 transition-colors"><LogOut className="w-4 h-4 mr-3" /> Выход</button>}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Header */}
          <header className="flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-16 lg:h-20 px-4 lg:px-8 z-[90] sticky top-0 border-b dark:border-gray-800 shrink-0">
             <div className="flex items-center gap-4 flex-1">
                 <button onClick={location.pathname === '/' ? toggleSidebar : handleBack} className="p-2 -ml-2 text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
                     {location.pathname === '/' ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                 </button>
                 <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Поиск по городу..." className="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                 </form>
             </div>
             <div className="flex items-center gap-2 lg:gap-4 ml-4">
                {user ? (
                    <>
                        <Link to="/chat" className="relative p-2.5 text-gray-500 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-6 h-6" />
                            {chatUnreadCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>}
                        </Link>
                        <Link to="/profile" className="ml-2">
                            <img src={user.avatar} className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" alt="Profile" />
                        </Link>
                    </>
                ) : (
                    <Link to="/auth"><Button size="sm" className="rounded-xl">Войти</Button></Link>
                )}
             </div>
          </header>

          {/* Main Content Area */}
          <main ref={mainRef} className={`flex-1 ${isFullScreenPage ? 'overflow-hidden' : 'overflow-y-auto'} bg-[#F8FAFC] dark:bg-gray-900 relative`}>
             {children}
          </main>

          <button onClick={scrollToTop} className={`fixed bottom-24 right-4 lg:bottom-10 lg:right-10 z-[60] bg-blue-600 text-white p-3 rounded-full shadow-2xl transition-all duration-300 ${showScrollTop && !isFullScreenPage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <ArrowUp className="w-6 h-6" />
          </button>
      </div>

      {/* Bottom Nav Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-[100] flex justify-around py-3 shadow-2xl">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <Home className="w-6 h-6" /> Главная
        </NavLink>
        <NavLink to="/classifieds" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <ShoppingBag className="w-6 h-6" /> Маркет
        </NavLink>
        <NavLink to="/chat" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold uppercase transition-colors relative ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <MessageCircle className="w-6 h-6" /> {chatUnreadCount > 0 && <span className="absolute -top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>} Сообщения
        </NavLink>
        <NavLink to={user ? "/profile" : "/auth"} className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <UserIcon className="w-6 h-6" /> Профиль
        </NavLink>
      </div>
    </div>
  );
};
