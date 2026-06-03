import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import AdminVerification from './pages/AdminVerification';

import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthPage from './pages/AuthPage';
import SetupPage from './pages/SetupPage';
import HomePage from './pages/HomePage';
import PracticeHubPage from './pages/PracticeHubPage';
import UpgradeModal from './components/ui/UpgradeModal';
import CBTSessionPage from './pages/CBTSessionPage';
import ResultPage from './pages/ResultPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/notifications';
import PremiumPage from './pages/PremiunPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import PWAInstallBanner from './components/PWAInstallBanner';
import AdminUpload from './pages/AdminUpload';
import NotificationPage from './pages/notifications';

export default function App() {
  const { user, isLoading, isProfileComplete } = useAuth();
  const [authMode, setAuthMode] = useState('signin');
  
  const navigate = useNavigate();
  const location = useLocation();

  const currentRoute = location.pathname === '/' ? null : location.pathname.replace('/', '');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (currentRoute === null) {
        navigate('/splash', { replace: true });
      } else if (!['splash', 'onboarding', 'auth'].includes(currentRoute)) {
        navigate('/onboarding', { replace: true });
      }
      return;
    }

    if (isProfileComplete) {
      if (currentRoute === null || ['splash', 'onboarding', 'auth', 'setup'].includes(currentRoute)) {
        navigate('/home', { replace: true });
      }
    } else {
      if (currentRoute !== 'setup') {
        navigate('/setup', { replace: true });
      }
    }
  }, [isLoading, user, isProfileComplete, currentRoute, navigate]);

  const onNavigate = (target, options = {}) => {
    if (target === 'auth' && options?.mode) {
      setAuthMode(options.mode);
    }
    
    if (!user && ['home', 'setup', 'practice', 'analytics', 'profile', 'notifications'].includes(target)) {
      return;
    }
    if (user && ['splash', 'onboarding', 'auth'].includes(target)) {
      return;
    }

    navigate(`/${target}`);
  };

  // ── FIX: Force skeleton view to remain active during intermediate layout routing updates ──
  const isMismatched = user && (
    (isProfileComplete && ['splash', 'onboarding', 'auth', 'setup'].includes(currentRoute)) ||
    (!isProfileComplete && currentRoute !== 'setup' && currentRoute !== null)
  );

  if (isLoading || currentRoute === null || isMismatched) {
    return (
      <div className="fixed inset-0 flex flex-col select-none pointer-events-none" style={{ backgroundColor: 'var(--color-canvas)' }}>
        
        {/* Fake Top Branding / Header Area */}
        <div className="w-full px-6 pt-14 pb-6 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="h-5 w-24 rounded-md animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Fake Dashboard Content Stream Block */}
        <div className="flex-1 px-4 pt-6 flex flex-col gap-4 overflow-hidden">
          {/* Main Hero Promo Placeholder */}
          <div className="w-full h-32 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
          
          {/* Grid or Stacked Box Row Modules */}
          <div className="h-4 w-1/3 rounded mt-2 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="w-full h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
          <div className="w-full h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
          <div className="w-full h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
        </div>

        {/* Statically Anchored Fake AppTabs Bar */}
        <div 
          className="w-full flex items-center justify-around px-2 border-t"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            paddingBottom: 'env(safe-area-inset-bottom, 12px)',
            paddingTop: '8px',
            height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="flex flex-col items-center gap-1.5 flex-1 py-1">
            <div className="w-5 h-5 rounded-md animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="w-8 h-2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 py-1">
            <div className="w-5 h-5 rounded-md animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="w-8 h-2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 py-1">
            <div className="w-5 h-5 rounded-md animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="w-8 h-2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 py-1">
            <div className="w-5 h-5 rounded-md animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="w-8 h-2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
        </div>

      </div>
    );
  }

  return (
    <>  
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/splash" element={<SplashPage onComplete={() => navigate('/onboarding')} />} />
        <Route path="/onboarding" element={<OnboardingPage onNavigate={onNavigate} />} />
        <Route path="/auth" element={<AuthPage initialMode={authMode} onNavigate={onNavigate} />} />
        <Route path="/setup" element={<SetupPage onComplete={() => navigate('/home')} />} />
        <Route path="/home" element={<HomePage onNavigate={onNavigate} />} />
        <Route path="/practice" element={<PracticeHubPage />} />
        <Route path="/cbt-session" element={<CBTSessionPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/notification/:id" element={<NotificationPage />} />
        <Route path="/premium" element={<PremiumPage />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
        </Route>

        {/* Fallback Catch-all: Redirects any unknown sub-paths securely */}
        <Route path="*" element={<Navigate to={user ? (isProfileComplete ? "/home" : "/setup") : "/onboarding"} replace />} />
      </Routes>
    </AnimatePresence>

    <UpgradeModal />
    <PWAInstallBanner />
    </>
  );
}