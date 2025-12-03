
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home, EventsPage } from './pages/Home';
import { Classifieds } from './pages/Classifieds';
import { BusinessDirectory } from './pages/BusinessDirectory';
import { Profile, AdminDashboard, ConnectBusiness } from './pages/Dashboards';
import { AuthPage } from './pages/Auth';
import { NewsDetail } from './pages/NewsDetail';
import { NewsFeed } from './pages/NewsFeed';
import { ChatPage } from './pages/Chat';
import { SearchResults } from './pages/SearchResults';
import { LostFound } from './pages/LostFound';
import { TransportPage, EmergencyPage } from './pages/CityInfo';
import { RidesPage } from './pages/Rides';
import { JobsPage } from './pages/Jobs';
import { BonusShop } from './pages/BonusShop';
import { BusinessDetail } from './pages/BusinessDetail';
import { AdDetail } from './pages/AdDetail';
import { Communities } from './pages/Communities';
import { CommunityDetail } from './pages/CommunityDetail';
import { Quests } from './pages/Quests';
import { SettingsPage } from './pages/Settings';
import { Leaderboard } from './pages/Leaderboard';
import { EventDetail } from './pages/EventDetail';
import { CartPage } from './pages/Cart';
import { CharityPage } from './pages/Charity';
import { BusinessCRM } from './pages/BusinessCRM';
import { RentalsPage } from './pages/Rentals';
import { ThemeProvider } from './components/ThemeProvider';
import { CartProvider } from './components/CartProvider';
import { SplashScreen } from './components/SplashScreen';
import { api } from './services/api';

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Pre-fetch critical data (e.g. User) while showing Splash
        // Ensure splash shows for at least 1.5s for aesthetics
        const [_, user] = await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1500)), 
            api.getCurrentUser()
        ]);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setAppReady(true);
      }
    };
    initApp();
  }, []);

  if (!appReady) {
      return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/classifieds" element={<Classifieds />} />
              <Route path="/ad/:id" element={<AdDetail />} />
              
              {/* City Services */}
              <Route path="/news" element={<NewsFeed />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/charity" element={<CharityPage />} />
              <Route path="/rentals" element={<RentalsPage />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/rides" element={<RidesPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/bonus-shop" element={<BonusShop />} />
              <Route path="/category/transport" element={<TransportPage />} />
              <Route path="/category/emergency" element={<EmergencyPage />} />

              {/* Communities & Quests */}
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:id" element={<CommunityDetail />} />
              <Route path="/quests" element={<Quests />} />

              {/* Dynamic category route for business directories */}
              <Route path="/category/:id" element={<BusinessDirectory />} />
              <Route path="/business/:id" element={<BusinessDetail />} />
              <Route path="/business-crm" element={<BusinessCRM />} />
              
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/cart" element={<CartPage />} />
              
              <Route path="/search" element={<SearchResults />} />
              
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/business-connect" element={<ConnectBusiness />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
