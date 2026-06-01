// =============================================================================
// src/pages/LeaderboardPage.jsx
// =============================================================================
// Weekly school leaderboard. Reads from public.weekly_winners.
// Filtered by the user's target school by default.
// School switcher at the top lets them browse other schools.
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase }   from '../lib/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import Header         from '../components/navigation/Header';
import AppTabs        from '../components/navigation/AppTabs';
import Spinner        from '../components/ui/Spinner';
import Badge          from '../components/ui/Badge';

const SCHOOLS = ['UI', 'UNILAG', 'OAU'];

// ISO Monday of the current week
function getThisWeekMonday() {
  const d   = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// Podium medal by rank
function medal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

// ---------------------------------------------------------------------------
// Podium — top 3
// ---------------------------------------------------------------------------
function Podium({ top3, currentUserId }) {
  if (top3.length === 0) return null;

  const order = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd
  const heights = ['h-20', 'h-28', 'h-16'];
  const rankOrder = [2, 1, 3];

  return (
    <div className="flex items-end justify-center gap-2 pt-4 pb-2">
      {order.map((entry, i) => {
        const isMe = entry?.user_id === currentUserId;
        return (
          <div key={entry?.id ?? i} className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
            {/* Avatar circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black border-2"
              style={{
                backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface-2)',
                borderColor:     isMe ? 'var(--color-primary)' : 'var(--color-border)',
                fontFamily:      'var(--font-display)',
                color:           isMe ? '#ffffff' : 'var(--color-text-primary)',
              }}
            >
              {(entry?.display_name ?? '?')[0].toUpperCase()}
            </div>

            {/* Name */}
            <p
              className="text-xs font-semibold text-center truncate w-full px-1"
              style={{
                fontFamily: 'var(--font-body)',
                color: isMe ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {isMe ? 'You' : (entry?.display_name ?? 'Unknown')}
            </p>

            {/* Podium block */}
            <div
              className={`w-full ${heights[i]} rounded-t-2xl flex items-start justify-center pt-2`}
              style={{
                backgroundColor: rankOrder[i] === 1
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-lg">{medal(rankOrder[i])}</span>
            </div>

            {/* Score */}
            <p
              className="text-xs font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              {entry?.score_percent?.toFixed(1)}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rank row
// ---------------------------------------------------------------------------
function RankRow({ entry, currentUserId, rank }) {
  const isMe = entry.user_id === currentUserId;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
      style={{
        backgroundColor: isMe ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
        border: `1px solid ${isMe ? 'var(--color-primary)' : 'var(--color-border)'}`,
      }}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {medal(rank) ? (
          <span className="text-lg">{medal(rank)}</span>
        ) : (
          <p
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            #{rank}
          </p>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{
          backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface-2)',
          color:           isMe ? '#ffffff' : 'var(--color-text-primary)',
          fontFamily:      'var(--font-display)',
        }}
      >
        {(entry.display_name ?? '?')[0].toUpperCase()}
      </div>

      {/* Name */}
      <p
        className="flex-1 text-sm font-semibold truncate"
        style={{
          fontFamily: 'var(--font-body)',
          color: isMe ? 'var(--color-primary)' : 'var(--color-text-primary)',
        }}
      >
        {isMe ? 'You' : (entry.display_name ?? 'Unknown')}
      </p>

      {/* Score */}
      <p
        className="text-sm font-black shrink-0"
        style={{
          fontFamily: 'var(--font-mono)',
          color: isMe ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {entry.score_percent?.toFixed(1)}%
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ school }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-16 rounded-3xl"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <span className="text-4xl">🏆</span>
      <p
        className="text-sm font-semibold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
      >
        No rankings yet for {school}
      </p>
      <p
        className="text-xs text-center max-w-xs"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
      >
        Complete a session this week to appear on the leaderboard.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function LeaderboardPage({ onNavigate }) {
  const { user, targetSchool } = useProfile();

  const [school,    setSchool]    = useState(targetSchool ?? SCHOOLS[0]);
  const [entries,   setEntries]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekStart  = getThisWeekMonday();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setEntries([]);

      const { data, error } = await supabase
        .from('weekly_winners')
        .select('*, profiles(display_name)')
        .eq('school', school)
        .eq('week_start', weekStart)
        .order('rank_position', { ascending: true })
        .limit(50);

      if (!error && data) {
        // Flatten display_name from joined profiles row
        setEntries(
          data.map((row) => ({
            ...row,
            display_name: row.profiles?.display_name ?? 'Unknown',
          }))
        );
      }

      setIsLoading(false);
    };

    load();
  }, [school, weekStart]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Find the current user's position
  const myEntry = entries.find((e) => e.user_id === user?.id);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <Header title="Leaderboard" showLogo />

      {/* School switcher */}
      <div
        className="flex gap-2 px-5 py-3 shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {SCHOOLS.map((s) => {
          const active = school === s;
          return (
            <button
              key={s}
              onClick={() => setSchool(s)}
              className="flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors"
              style={{
                fontFamily:      'var(--font-display)',
                backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor:     active ? 'var(--color-primary)' : 'var(--color-border)',
                color:           active ? '#ffffff'              : 'var(--color-text-secondary)',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Week label */}
      <div className="px-5 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase"
          style={{
            fontFamily:    'var(--font-body)',
            color:         'var(--color-text-muted)',
            letterSpacing: '0.1em',
          }}
        >
          This Week
        </p>
        {myEntry && (
          <Badge variant="primary">Your rank: #{myEntry.rank_position}</Badge>
        )}
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-4"
        style={{ paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))' }}
      >
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState school={school} />
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 2 && (
              <Podium top3={top3} currentUserId={user?.id} />
            )}

            {/* Ranked list — position 4 onwards */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2">
                {rest.map((entry) => (
                  <RankRow
                    key={entry.id}
                    entry={entry}
                    currentUserId={user?.id}
                    rank={entry.rank_position}
                  />
                ))}
              </div>
            )}

            {/* If current user not in top list, pin their row at bottom */}
            {myEntry && myEntry.rank_position > entries.length && (
              <div
                className="mt-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
                >
                  Your position
                </p>
                <RankRow
                  entry={myEntry}
                  currentUserId={user?.id}
                  rank={myEntry.rank_position}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AppTabs active="analytics" onChange={(t) => onNavigate?.(t)} />
    </div>
  );
}