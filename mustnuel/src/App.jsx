// =============================================================================
// src/App.jsx
// =============================================================================

import { useState, useEffect } from 'react';
import { AnimatePresence }         from 'framer-motion';
import { useAuth }                     from './context/AuthContext';

import SplashPage     from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthPage       from './pages/AuthPage';
import SetupPage      from './pages/SetupPage';
import HomePage       from './pages/HomePage';

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
  const [route, setRoute] = useState(null);
  const [authMode, setAuthMode] = useState('signin');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (route === null) {
        setRoute('splash');
      } else if (!['splash', 'onboarding', 'auth'].includes(route)) {
        setRoute('onboarding');
      }
      return;
    }

    if (isProfileComplete) {
      if (route === null || ['splash', 'onboarding', 'auth', 'setup'].includes(route)) {
        setRoute('home');
      }
    } else {
      if (route !== 'setup') {
        setRoute('setup');
      }
    }
  }, [isLoading, user, isProfileComplete, route]);

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

    setRoute(target);
  };

  if (isLoading || route === null) {
    return (
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'var(--color-canvas)' }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {route === 'splash' && <SplashPage key="splash" onComplete={() => setRoute('onboarding')} />}
      {route === 'onboarding' && <OnboardingPage key="onboarding" onNavigate={onNavigate} />}
      {route === 'auth' && <AuthPage key="auth" initialMode={authMode} onNavigate={onNavigate} />}
      {route === 'setup' && <SetupPage key="setup" onComplete={() => setRoute('home')} />}
      {route === 'home' && <HomePage key="home" onNavigate={onNavigate} />}
      {route === 'practice' && <ComingSoon key="practice" label="Practice Hub" />}
      {route === 'analytics' && <ComingSoon key="analytics" label="Analytics" />}
      {route === 'profile' && <ComingSoon key="profile" label="Profile" />}
      {route === 'notifications' && <ComingSoon key="notifications" label="Notifications" />}
    </AnimatePresence>
  );
}