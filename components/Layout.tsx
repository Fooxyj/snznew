
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Menu, X, Home, Newspaper, ShoppingBag, Coffee, Film, Map, 
  Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Briefcase, 
  User as UserIcon, Bell, Search, PlusCircle, LogOut, MessageCircle, HelpCircle, Car, Gift, Users, Flag, Settings, Trophy, Heart, Repeat, Key, ChevronLeft, ArrowUp, Calendar, ChevronDown, ChevronRight, Droplets, Wrench, Building2, Trash2, Lightbulb, MessageSquare, AlertTriangle, Eye, CheckCheck, CheckCircle, Shield, LayoutGrid, Truck, Hammer, Star
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
  Newspaper, ShoppingBag, Coffee, Film, Map, Drama, Scissors, Dumbbell, Stethoscope, Bus, Siren, Key, Truck, Car, Droplets, Wrench, Building2, HelpCircle, Briefcase, Repeat, Users, Heart, Flag, Trophy, Gift, MessageCircle, AlertTriangle, Home, Eye, Calendar, LayoutGrid, Hammer, Star, Cloud: Cloud
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

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

  const { data: chatUnreadCount = 0 } = useQuery({
    queryKey: ['chatUnread'],
    queryFn: api.getUnreadChatsCount,
    enabled: !!user,
    initialData: 0,
    refetchInterval: 3000 
  });

  const hasBusiness = myBusinesses && myBusinesses.length > 0;

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
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const resetMenus = () => { setOpenMenus([]); setSidebarOpen(false); };
  const handleBack = () => navigate(-1);
  
  const handleLogout = async () => {
    await api.signOut();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setOpenMenus([]);
    navigate('/auth');
    setSidebarOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSidebarOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const isFullScreenPage = ['/chat', '/map', '/quests'].some(p => location.pathname.startsWith(p));
  
  const isChatActive = location.pathname.startsWith('/chat') && searchParams.get('id');

  const renderMenuSection = (menuItems: any[]) => {
      return menuItems.map((item) => {
          const Icon = ICON_MAP[item.icon as string] || Home;
          
          if (!item.submenu || item.submenu.length === 0) {
              return (
                  <Link 
                    key={item.id}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${isActive(item.path) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'}`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-400'}`} />
                    {item.title}
                  </Link>
              );
          }

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
    <div className="h-screen bg-white dark:bg-gray-900 flex overflow-hidden transition-colors duration-200">
      <SuggestIdeaModal isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} />

      <aside className={`fixed lg:static inset-y-0 left-0 z-[110] w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <Link to="/" className="flex flex-col" onClick={resetMenus}>
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">Снежинск</h1>
            <span className="text-[10px] font-bold tracking-[0.5em] text-gray-400 uppercase mt-1">Лайф</span>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-0.5 custom-scrollbar">
          <NavItem to="/" icon={Home} label="Главная" active={location.pathname === '/'} onClick={resetMenus} />
          <NavItem to="/map" icon={Map} label="Карта" active={isActive('/map')} onClick={resetMenus} />
          <div className="mt-6 mb-2 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Каталог и Услуги</div>
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
          <header className="flex items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-16 lg:h-20 px-4 lg:px-8 z-[90] sticky top-0 border-b dark:border-gray-800 shrink-0 gap-2 md:gap-4">
              
              {location.pathname === '/' ? (
                  <Link to="/" className="flex flex-col shrink-0">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tighter leading-none">СНЕЖИНСК</span>
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-0.5 leading-none">ЛАЙФ</span>
                  </Link>
              ) : (
                  <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl shrink-0">
                      <ChevronLeft className="w-6 h-6" />
                  </button>
              )}

              <form onSubmit={handleSearch} className="flex-1 relative group mx-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                      type="text" 
                      placeholder="Поиск..." 
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-xs font-medium border-transparent focus:border-blue-500/10" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                  />
              </form>

              <div className="flex items-center gap-1 shrink-0 ml-auto">
                  {user ? (
                      <>
                          <Link to="/chat" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                              {chatUnreadCount > 0 && <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>}
                          </Link>
                          <Link to="/profile" className="ml-1 shrink-0">
                              <img src={user.avatar} className="w-8 h-8 lg:w-11 lg:h-11 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" alt="Profile" />
                          </Link>
                      </>
                  ) : (
                      <Link to="/auth" className="shrink-0"><Button size="sm" className="rounded-xl px-4 py-2 text-[10px]">Войти</Button></Link>
                  )}
              </div>
          </header>

          <main ref={mainRef} className={`flex-1 ${isFullScreenPage ? 'overflow-hidden' : 'overflow-y-auto'} bg-white dark:bg-gray-900 relative`}>
             {children}
          </main>

          <button onClick={scrollToTop} className={`fixed bottom-24 right-4 lg:bottom-10 lg:right-10 z-[60] bg-blue-600 text-white p-3 rounded-full shadow-2xl transition-all duration-300 ${showScrollTop && !isFullScreenPage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <ArrowUp className="w-6 h-6" />
          </button>
      </div>

      {!isChatActive && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-[100] flex justify-around items-end pb-3 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] h-20 animate-in slide-in-from-bottom duration-300">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors flex-1 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <Home className="w-5 h-5" /> Главная
          </NavLink>

          <NavLink to="/classifieds" className={({isActive}) => `flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors flex-1 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <ShoppingBag className="w-5 h-5" /> Маркет
          </NavLink>
          
          <div className="flex-1 flex flex-col items-center -mt-8 mb-1">
              <button 
                  onClick={toggleSidebar}
                  className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-90 transition-all border-4 border-white dark:border-gray-900"
              >
                  <LayoutGrid className="w-6 h-6 text-white" />
              </button>
              <span className="text-[9px] font-black uppercase text-blue-600 mt-1">Город</span>
          </div>

          <NavLink to="/chat" className={({isActive}) => `flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors relative flex-1 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <MessageCircle className="w-5 h-5" /> {chatUnreadCount > 0 && <span className="absolute -top-1 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>} Сообщения
          </NavLink>
          <NavLink to={user ? "/profile" : "/auth"} className={({isActive}) => `flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors flex-1 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <UserIcon className="w-5 h-5" /> Профиль
          </NavLink>
        </div>
      )}
    </div>
  );
};
