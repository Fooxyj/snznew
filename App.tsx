import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ToastProvider';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeProvider';
import { SplashScreen } from './components/SplashScreen';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Onboarding } from './components/Onboarding';
import { PageLoader } from './components/ui/PageLoader';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DailyBonus } from './components/DailyBonus';
import { api } from './services/api';
import { UserRole } from './types';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
// Comment above fix: Map named export NewsFeed from NewsFeed.tsx for lazy loading as EventsPage since it handles the generic feed logic for both news and events
const EventsPage = lazy(() => import('./pages/NewsFeed').then(m => ({ default: m.NewsFeed })));
const Classifieds = lazy(() => import('./pages/Classifieds').then(m => ({ default: m.Classifieds })));
const BusinessDirectory = lazy(() => import('./pages/BusinessDirectory').then(m => ({ default: m.BusinessDirectory })));
const Profile = lazy(() => import('./pages/Dashboards').then(m => ({ default: m.Profile })));
const PublicProfile = lazy(() => import('./pages/PublicProfile').then(m => ({ default: m.PublicProfile })));
const AdminDashboard = lazy(() => import('./pages/Dashboards').then(m => ({ default: m.AdminDashboard })));
const ConnectBusiness = lazy(() => import('./pages/ConnectBusiness').then(m => ({ default: m.ConnectBusiness })));
const AuthPage = lazy(() => import('./pages/Auth').then(m => ({ default: m.AuthPage })));
const NewsDetail = lazy(() => import('./pages/NewsDetail').then(m => ({ default: m.NewsDetail })));
const NewsFeed = lazy(() => import('./pages/NewsFeed').then(m => ({ default: m.NewsFeed })));
const ChatPage = lazy(() => import('./pages/Chat').then(m => ({ default: m.ChatPage })));
const SearchResults = lazy(() => import('./pages/SearchResults').then(m => ({ default: m.SearchResults })));
const LostFound = lazy(() => import('./pages/LostFound').then(m => ({ default: m.LostFound })));
const TransportPage = lazy(() => import('./pages/CityInfo').then(m => ({ default: m.TransportPage })));
const EmergencyPage = lazy(() => import('./pages/CityInfo').then(m => ({ default: m.EmergencyPage })));
const RidesPage = lazy(() => import('./pages/Rides').then(m => ({ default: m.RidesPage })));
const JobsPage = lazy(() => import('./pages/Jobs').then(m => ({ default: m.JobsPage })));
const BonusShop = lazy(() => import('./pages/BonusShop').then(m => ({ default: m.BonusShop })));
const BusinessDetail = lazy(() => import('./pages/BusinessDetail').then(m => ({ default: m.BusinessDetail })));
const AdDetail = lazy(() => import('./pages/AdDetail').then(m => ({ default: m.AdDetail })));
const Communities = lazy(() => import('./pages/Communities').then(m => ({ default: m.Communities })));
const CommunityDetail = lazy(() => import('./pages/CommunityDetail').then(m => ({ default: m.CommunityDetail })));
const Quests = lazy(() => import('./pages/Quests').then(m => ({ default: m.Quests })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })));
const CharityPage = lazy(() => import('./pages/Charity').then(m => ({ default: m.CharityPage })));
const BusinessCRM = lazy(() => import('./pages/BusinessCRM').then(m => ({ default: m.BusinessCRM })));
const RentalsPage = lazy(() => import('./pages/Rentals').then(m => ({ default: m.RentalsPage })));
const Weather = lazy(() => import('./pages/Weather').then(m => ({ default: m.Weather })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const ExploreMap = lazy(() => import('./pages/ExploreMap').then(m => ({ default: m.ExploreMap })));
const CityMonitor = lazy(() => import('./pages/CityMonitor').then(m => ({ default: m.CityMonitor })));
const DeliveryPage = lazy(() => import('./pages/Delivery').then(m => ({ default: m.DeliveryPage })));
const HousingPage = lazy(() => import('./pages/Housing').then(m => ({ default: m.HousingPage })));
const SmartCity = lazy(() => import('./pages/SmartCity').then(m => ({ default: m.SmartCity })));
const LegalPage = lazy(() => import('./pages/Legal').then(m => ({ default: m.LegalPage })));

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [_, user] = await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1500)), 
            api.getCurrentUser()
        ]);
        if (user) api.updateLastSeen();
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setAppReady(true);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
      // Обновляем статус каждые 20 секунд для максимально высокой точности
      const interval = setInterval(() => {
          api.updateLastSeen();
      }, 1000 * 20); 
      return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
            <SplashScreen isVisible={!appReady} />
            
            <HashRouter>
              <Layout>
                <OfflineIndicator />
                <PWAInstallPrompt />
                <Onboarding />
                <DailyBonus />
                
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/news" element={<NewsFeed />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/classifieds" element={<Classifieds />} />
                    <Route path="/ad/:id" element={<AdDetail />} />
                    <Route path="/user/:id" element={<PublicProfile />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/category/transport" element={<TransportPage />} />
                    <Route path="/category/emergency" element={<EmergencyPage />} />
                    <Route path="/category/:id" element={<BusinessDirectory />} />
                    <Route path="/business/:id" element={<BusinessDetail />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/map" element={<ExploreMap />} />
                    <Route path="/charity" element={<CharityPage />} />
                    <Route path="/rentals" element={<RentalsPage />} />
                    <Route path="/lost-found" element={<LostFound />} />
                    <Route path="/rides" element={<RidesPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/bonus-shop" element={<BonusShop />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/community/:id" element={<CommunityDetail />} />
                    <Route path="/quests" element={<Quests />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/city-monitor" element={<CityMonitor />} />
                    <Route path="/delivery" element={<DeliveryPage />} />
                    <Route path="/housing" element={<HousingPage />} />
                    <Route path="/smart-city" element={<SmartCity />} />
                    <Route path="/legal" element={<LegalPage />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/business-connect" element={<ConnectBusiness />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.BUSINESS, UserRole.ADMIN]} />}>
                      <Route path="/business-crm" element={<BusinessCRM />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </HashRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;