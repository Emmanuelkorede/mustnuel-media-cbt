import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext'; 
import AppTabs from '../components/navigation/AppTabs';

const SCHOOLS = [
  { id: 'ALL', label: 'All Schools' },
  { id: 'UI', label: 'UI' },
  { id: 'UNILAG', label: 'UNILAG' },
  { id: 'OAU', label: 'OAU' }
];

const TIMEFRAMES = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' }
];

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-xl shrink-0">🥇</span>;
  if (rank === 2) return <span className="text-xl shrink-0">🥈</span>;
  if (rank === 3) return <span className="text-xl shrink-0">🥉</span>;
  
  return (
    <p 
      className="text-xs font-bold text-text-muted text-center w-6 shrink-0" 
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      #{rank}
    </p>
  );
}

function RankRow({ entry, currentUserId }) {
  const isMe = entry.user_id === currentUserId;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
        isMe 
          ? 'bg-primary/5 border-primary shadow-sm' 
          : 'bg-surface border-border'
      }`}
    >
      <div className="w-6 flex items-center justify-center shrink-0">
        <RankBadge rank={entry.rank_position} />
      </div>

      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm border ${
          isMe 
            ? 'bg-primary text-white border-primary' 
            : 'bg-surface-2 text-text-primary border-border'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {(entry.display_name ?? 'U')[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            isMe ? 'text-primary' : 'text-text-primary'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {isMe ? 'You' : entry.display_name}
        </p>
        <p className="text-xs text-text-muted lowercase mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          Targeting <span className="uppercase font-medium text-text-secondary">{entry.school}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-center shrink-0">
          <p className="text-[10px] font-bold text-text-secondary leading-none">
            {entry.total_exams}
          </p>
          <p className="text-[8px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
            {entry.total_exams === 1 ? 'Exam' : 'Exams'}
          </p>
        </div>

        <div className="w-14 text-right">
          <p
            className={`text-sm font-black leading-none ${
              isMe ? 'text-primary' : 'text-text-primary'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {Math.round(entry.highest_score)}%
          </p>
          <p className="text-[9px] text-text-muted font-medium mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            peak score
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage({ onNavigate }) {
// Extract isActivated from your auth context instead of reading directly from user
  const { user, isActivated } = useAuth(); 
  const { setIsUpgradeModalOpen, isUpgradeModalOpen } = useApp();

  // Map your existing premium validation cleanly to the verified context flag
  const isPremiumUser = isActivated === true;

  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [myRowPosition, setMyRowPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kick non-premium users out or force open the UpgradeModal immediately on mount
  useEffect(() => {
    if (!isPremiumUser) {
      setIsUpgradeModalOpen(true);
      setIsLoading(false);
    }
  }, [isPremiumUser, setIsUpgradeModalOpen]);

  // Fallback structural handling if they close the modal but stay on this route path
  useEffect(() => {
    if (!isPremiumUser && !isUpgradeModalOpen) {
      // Safely bounce them back to dashboard/profile so they don't stare at an empty screen
      onNavigate?.('dashboard'); 
    }
  }, [isUpgradeModalOpen, isPremiumUser, onNavigate]);

  useEffect(() => {
    if (!user?.id || !isPremiumUser) return;

    let isMounted = true;
    const fetchRealtimeRankings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_leaderboard', {
          p_school: selectedSchool,
          p_timeframe: selectedTimeframe
        });

        if (error) throw error;
        if (!isMounted) return;

        if (data) {
          const userIndex = data.findIndex((row) => row.user_id === user.id);
          
          if (userIndex !== -1) {
            setMyRowPosition({ ...data[userIndex] });
          } else {
            setMyRowPosition(null);
          }

          const top15Listings = data.slice(0, 15);
          setLeaderboardRows(top15Listings);
        }
      } catch (err) {
        console.error('Leaderboard Fetch Execution Failed:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRealtimeRankings();

    return () => {
      isMounted = false;
    };
  }, [selectedSchool, selectedTimeframe, user?.id, isPremiumUser]);

  const isUserOutsideTop15 = myRowPosition && myRowPosition.rank_position > 15;

  return (
    <div className="fixed inset-0 flex flex-col bg-canvas select-none">
      
      {/* Top Header Section */}
      <header className="bg-surface border-b border-border pt-4 shrink-0">
        <div className="px-5 pb-3.5 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-body)' }}>
            Leaderboard
          </h1>
          <div className="bg-primary/10 rounded-full px-3 py-1 flex items-center gap-1">
            <span className="text-xs">⚡</span>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Live ranks</span>
          </div>
        </div>

        {/* Dual Side-by-Side Dropdowns Filter Bar */}
        <div className="flex gap-3 px-5 pb-4">
          <div className="flex-1 relative">
            <select
              value={selectedTimeframe}
              disabled={!isPremiumUser}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full bg-surface-2 text-text-primary border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {TIMEFRAMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-muted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          <div className="flex-1 relative">
            <select
              value={selectedSchool}
              disabled={!isPremiumUser}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full bg-surface-2 text-text-primary border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {SCHOOLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-muted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Render Viewport */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 pb-24">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-text-muted">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : !isPremiumUser ? (
          /* Empty placeholder rows while the app modal processes focus background */
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-xs font-medium">
            Premium account verification required...
          </div>
        ) : leaderboardRows.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-16 px-4 bg-surface border border-border rounded-2xl shadow-sm">
            <span className="text-3xl">🏆</span>
            <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              No calculations recorded
            </p>
            <p className="text-xs text-text-muted max-w-xs leading-normal" style={{ fontFamily: 'var(--font-body)' }}>
              Be the first to step up! Finish an exam-mode test session right now to claim rank position #1.
            </p>
          </div>
        ) : (
          <>
            {leaderboardRows.map((entry) => (
              <RankRow key={entry.user_id} entry={entry} currentUserId={user?.id} />
            ))}
          </>
        )}
      </div>

      {/* Sticky Bottom Persistent Identity Dock */}
      {isUserOutsideTop15 && isPremiumUser && !isLoading && (
        <div 
          className="absolute left-0 right-0 bg-surface border-t border-border px-5 py-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Your Competitive Standing
          </div>
          <RankRow entry={myRowPosition} currentUserId={user?.id} />
        </div>
      )}

      {/* Main System Core Tab Navigation */}
      <AppTabs active="leaderboard" onChange={(t) => onNavigate?.(t)} />
    </div>
  );
}