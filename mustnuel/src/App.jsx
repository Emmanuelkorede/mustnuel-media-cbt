
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';

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

function ComingSoon({ label }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: 'var(--color-canvas)' }}>
      <span className="text-4xl">🚧</span>
      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
        {label}
      </p>
    </div>
  );
}

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

  if (isLoading || currentRoute === null) {
    return (
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'var(--color-canvas)' }}
      />
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
        <Route path="/profile" element={<ComingSoon label="Profile" />} />
        <Route path="/notifications" element={<ComingSoon label="Notifications" />} />
        
        {/* Fallback Catch-all: Redirects any unknown sub-paths securely */}
        <Route path="*" element={<Navigate to={user ? (isProfileComplete ? "/home" : "/setup") : "/onboarding"} replace />} />
      </Routes>
    </AnimatePresence>

    <UpgradeModal />
    </>
  );
}