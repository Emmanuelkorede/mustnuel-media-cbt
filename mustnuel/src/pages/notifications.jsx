
import { useNavigate } from 'react-router';
import { FiChevronLeft, FiBell } from 'react-icons/fi';

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas text-text-primary pb-32 transition-colors duration-200">
      
      {/* ── Fixed Sticky Top Navigation Bar ── */}
      <div 
        className="sticky top-0 z-40 px-4 pt-12 pb-4 flex items-center gap-3 border-b border-border backdrop-blur-md"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-canvas text-text-secondary active:scale-95 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <FiChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display leading-tight">Updates Board</h1>
          <p className="text-2xs text-text-muted font-body">Official alerts & institutional timelines</p>
        </div>
      </div>

      {/* ── Coming Soon Centered Container ── */}
      <div className="max-w-2xl mx-auto px-4 mt-16 flex flex-col items-center justify-center text-center">
        
        {/* Animated Icon Container */}
        <div className="w-20 h-20 rounded-3xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm relative mb-6">
          <FiBell size={32} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>

        {/* Coming Soon Alert Message */}
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-subtle text-primary mb-3">
          Coming Soon
        </span>
        
        <h2 className="text-xl font-bold font-display text-text-primary mb-2">
          Live Timeline Feeds
        </h2>
        
        <p className="text-xs font-body text-text-secondary max-w-[290px] leading-relaxed mb-8">
          We are developing our app to feed you with updates for  Post-UTME  such as registration portals, cutoff metrics, and test schedules directly from UI, UNILAG, and OAU.
        </p>

        {/* Visual Skeleton Loading Stream Placeholder */}
        <div className="w-full flex flex-col gap-3 opacity-40 select-none pointer-events-none">
          <div className="h-16 w-full bg-surface-2 border border-border rounded-xl flex items-center px-4 gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-1/3 bg-surface rounded" />
              <div className="h-2 w-2/3 bg-surface rounded" />
            </div>
          </div>
          <div className="h-16 w-full bg-surface-2 border border-border rounded-xl flex items-center px-4 gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-1/4 bg-surface rounded" />
              <div className="h-2 w-1/2 bg-surface rounded" />
            </div>
          </div>
        </div>

      </div>



    </div>
  );
}