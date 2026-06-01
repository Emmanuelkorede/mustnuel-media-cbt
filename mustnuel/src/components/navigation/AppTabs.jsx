// =============================================================================
// src/components/ui/AppTabs.jsx
// =============================================================================
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Updated path directly to your context provider

const TABS = [
  {
    id:    'home',
    label: 'Home',
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
        {!active && <path d="M9 21V12h6v9"/>}
        {active  && <path d="M9 21V12h6v9" fill="none" stroke="white" strokeWidth="1.8"/>}
      </svg>
    ),
  },
  {
    id:    'practice',
    label: 'Practice',
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"
          fill={active ? 'currentColor' : 'none'}/>
        {active
          ? <path d="M9 9h6M9 12h6M9 15h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          : <path d="M9 9h6M9 12h6M9 15h4"/>}
      </svg>
    ),
  },
  {
    id:    'leaderboard',
    label: 'Leaderboard',
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <>
              <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" stroke="none"/>
              <rect x="10" y="7"  width="4" height="14" rx="1" fill="currentColor" stroke="none"/>
              <rect x="17" y="3"  width="4" height="18" rx="1" fill="currentColor" stroke="none"/>
            </>
          : <>
              <rect x="3"  y="12" width="4" height="9"  rx="1"/>
              <rect x="10" y="7"  width="4" height="14" rx="1"/>
              <rect x="17" y="3"  width="4" height="18" rx="1"/>
            </>}
      </svg>
    ),
  },
  {
    id:    'profile',
    label: 'Profile',
    icon:  (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'}/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          fill={active ? 'currentColor' : 'none'}
          stroke={active ? 'none' : 'currentColor'}/>
      </svg>
    ),
  },
];

const ADMIN_TAB = {
  id:    'admin',
  label: 'Admin',
  icon:  (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" fill={active ? 'currentColor' : 'none'} />
      <path d="M9 17v-5m3 5V9m3 8v-3" stroke={active ? "white" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function AppTabs({ active }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // Uses your context flag directly

  const activeTabsList = isAdmin ? [...TABS, ADMIN_TAB] : TABS;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop:       '1px solid var(--color-border)',
        paddingBottom:   'env(safe-area-inset-bottom, 12px)',
        paddingTop:      '8px',
        height:          'calc(60px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {activeTabsList.map((tab) => {
        const isActive = active === tab.id;
        
        const handleRouteNavigation = () => {
          if (tab.id === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate(`/${tab.id}`);
          }
        };

        return (
          <button
            key={tab.id}
            onClick={handleRouteNavigation}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors"
            style={{
              color: isActive
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)',
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <div className="w-6 h-6 flex items-center justify-center">
              {tab.icon(isActive)}
            </div>

            <span
              className="text-2xs font-medium uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize:   '0.58rem',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}