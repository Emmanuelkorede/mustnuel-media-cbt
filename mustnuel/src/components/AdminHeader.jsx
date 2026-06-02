// =============================================================================
// src/components/AdminHeader.jsx
// =============================================================================
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiMenu, FiX, FiSliders, FiCheckSquare, FiDatabase, FiMessageSquare } from 'react-icons/fi';

const ADMIN_SUB_TABS = [
  { id: 'dashboard', label: 'Metrics', icon: FiSliders, path: '/admin/dashboard' },
  { id: 'premium', label: 'Verifications', icon: FiCheckSquare, path: '/admin/verification' },
  { id: 'questions', label: 'CBT Bank', icon: FiDatabase, path: '/admin/upload' },
  { id: 'feedback', label: 'Support', icon: FiMessageSquare, path: '/admin/feedback' },
];

export default function AdminHeader({ currentSubTab }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Hamburger & Brand Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-surface-2 transition-colors md:hidden cursor-pointer focus:outline-none"
            aria-label="Toggle admin navigation menu"
          >
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-text-primary uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              Admin Portal
            </h1>
            <p className="text-[10px] font-medium text-primary uppercase tracking-wider">
              Management Control
            </p>
          </div>
        </div>

        {/* Center/Right Side: Desktop Standard Horizontal Inline Navbar Link Controls */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          {ADMIN_SUB_TABS.map((tab) => {
            const isActive = currentSubTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.path)}
                className={`flex items-center gap-2 px-4 h-11 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                  }
                `}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <Icon size={14} className={isActive ? 'text-primary' : 'text-text-muted'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Status Panel */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-text-muted font-mono uppercase tracking-wider">
            Secure Session
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Dropdown Drawer Menu List Panel */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface border-b border-border shadow-xl md:hidden animate-in slide-in-from-top duration-150 z-50">
          <nav className="flex flex-col p-3 gap-1">
            {ADMIN_SUB_TABS.map((tab) => {
              const isActive = currentSubTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigation(tab.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer
                    ${isActive 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-text-secondary hover:bg-surface-2'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}