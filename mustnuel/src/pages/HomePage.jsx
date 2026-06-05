import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FiBell, FiChevronRight, FiBookOpen, FiClock } from 'react-icons/fi';
import ActivationBanner from '../components/widgets/ActivationBanner';
import MetricsGrid from '../components/widgets/MetricsGrid';
import { useProfile } from '../hooks/useProfile';
import { useApp } from '../context/AppContext'; 
import { supabase } from '../lib/supabaseClient'; // 👈 Imported Supabase client
import AppTabs from '../components/navigation/AppTabs';

// Lightweight time calculation helper for clean scannability
function simpleTimeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)         return "Just now";
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const DAILY_QUOTES = [
  'Stay focused, stay driven.',
  'Every question counts.',
  'Consistency beats intensity.',
  'Your target school is waiting.',
  'One more session. One step closer.',
  'Winners prepare. Losers just hope.',
  "The exam won't grade your excuses.",
];

function getTodayQuote() {
  const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
  return DAILY_QUOTES[dayIndex];
}

function TopBar({ displayName, onNotificationPress, hasUnread }) {
  return (
    <div 
      className="flex items-center justify-between px-5 pt-4 pb-3 border-b sticky top-0 z-20 backdrop-blur-md bg-opacity-95"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex flex-col min-w-0 flex-1 pr-4">
        <div className="flex items-baseline gap-1.5">
          <p
            className="text-[10px] font-bold uppercase tracking-wider shrink-0"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            {timeGreeting()},
          </p>
          <h1
            className="text-base font-black leading-none truncate"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {displayName}
          </h1>
        </div>
        <p
          className="text-[11px] mt-0.5 truncate"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
        >
          {getTodayQuote()}
        </p>
      </div>

      <button
        onClick={onNotificationPress}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border shrink-0"
        style={{
          backgroundColor: 'var(--color-surface-2)',
          borderColor: 'var(--color-border)',
        }}
        aria-label="Notifications"
      >
        <FiBell size={15} style={{ color: 'var(--color-text-secondary)' }} />
        {hasUnread && (
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        )}
      </button>
    </div>
  );
}

function QuickActions({ onStudy, onExam }) {
  return (
    <div className="px-5 flex flex-col gap-3 w-full">
      <p
        className="text-xs font-semibold uppercase"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        Quick Start
      </p>

      {/* Study Mode Button */}
      <button
        onClick={onStudy}
        className="w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-sm"
        style={{
          backgroundColor: 'var(--color-primary)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <FiBookOpen size={18} color="white" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <p
                className="text-sm font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Study Mode
              </p>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p
              className="text-xs text-white/80 truncate mt-0.5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Answers revealed after each question
            </p>
          </div>
        </div>
        <FiChevronRight size={18} color="white" className="shrink-0 ml-2" />
      </button>

      {/* CBT Exam Button */}
      <button
        onClick={onExam}
        className="w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.99] cursor-pointer border shadow-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FiClock size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="text-left min-w-0">
            <p
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              CBT Exam
            </p>
            <p
              className="text-xs truncate mt-0.5"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
            >
              Timed simulation, no hints
            </p>
          </div>
        </div>
        <FiChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} className="shrink-0 ml-2" />
      </button>
    </div>
  );
}

// 📢 MINIMAL HEADLINES COMPONENT
function HeadlinesWidget({ items, loading, onHeadlineClick }) {
  return (
    <div className="px-5 flex flex-col gap-2.5 w-full">
      <p
        className="text-xs font-semibold uppercase"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        Latest Announcements
      </p>

      <div 
        className="rounded-2xl border flex flex-col overflow-hidden divide-y"
        style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)',
          disabledColor: 'var(--color-border)' 
        }}
      >
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface animate-pulse w-full" />
          ))
        ) : items.length === 0 ? (
          <p className="text-[11px] text-text-muted p-4 text-center italic" style={{ fontFamily: 'var(--font-body)' }}>
            No updates log active at the moment.
          </p>
        ) : (
          items.map((noti) => (
            <button
              key={noti.id}
              onClick={() => onHeadlineClick(noti.id)}
              className="w-full text-left p-3.5 flex items-center justify-between gap-4 relative overflow-hidden transition active:bg-border/20 cursor-pointer"
            >
              {/* Vibe matching priority system indicator bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${noti.is_pinned ? "bg-amber-500" : "bg-primary"}`} />
              
              <div className="pl-1.5 flex flex-col gap-0.5 min-w-0 flex-1">
                <h4 
                  className="text-xs font-bold text-text-primary truncate tracking-tight"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {noti.is_pinned && <span className="text-amber-500 mr-1">📌</span>}
                  {noti.title}
                </h4>
                <span className="text-[9px] font-mono font-medium text-text-muted">
                  {simpleTimeAgo(noti.created_at)}
                </span>
              </div>

              <FiChevronRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { setIsUpgradeModalOpen } = useApp(); 
  
  const {
    displayName,
    isActivated,
    targetSchool,
    streakCount,
    cbtCount,
    averageScore,
  } = useProfile();

  // News engine state tracking
  const [headlines, setHeadlines] = useState([]);
  const [loadingHeadlines, setLoadingHeadlines] = useState(true);

  // Sync last 5 entries on initialization matching NotificationPage orders
  useEffect(() => {
    async function loadHeadlines() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, created_at, is_pinned")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5); // Strict limit cap to avoid cluttering HomePage space

        if (error) throw error;
        setHeadlines(data || []);
      } catch (err) {
        console.error("Home ticker sync breakdown:", err.message);
      } finally {
        setLoadingHeadlines(false);
      }
    }
    loadHeadlines();
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <TopBar
        displayName={displayName}
        hasUnread={headlines.some(h => h.is_pinned)} // Soft dot lighting rule trigger
        onNotificationPress={() => navigate('/notifications')}
      />

      <div
        className="flex-1 overflow-y-auto flex flex-col gap-6 pt-4"
        style={{ paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))' }}
      >
        <ActivationBanner
          isActivated={isActivated}
          targetSchool={targetSchool}
        />

        <QuickActions
          onStudy={() => {
            if (!isActivated) {
              setIsUpgradeModalOpen(true);
            } else {
              navigate('/practice', { state: { mode: 'study' } });
            }
          }}
          onExam={() => navigate('/practice', { state: { mode: 'exam' } })}
        />

        <MetricsGrid
          streakCount={streakCount}
          cbtCount={cbtCount}
          averageScore={averageScore}
        />

        {/* Headlines Section injected cleanly */}
        <HeadlinesWidget 
          items={headlines}
          loading={loadingHeadlines}
          onHeadlineClick={(id) => navigate(`/notifications/${id}`)}
        />
      </div>

      <AppTabs active="home" />
    </div>
  );
}