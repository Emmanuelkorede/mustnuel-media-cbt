import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import PerformanceChart from '../components/widgets/PerformanceChart';
import Badge from '../components/ui/Badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
  });
}

function formatDuration(secs = 0) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function scoreVariant(score) {
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------
function StatCard({ icon, value, label }) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-4 rounded-2xl bg-surface border border-border shadow-sm">
      <span className="text-lg">{icon}</span>
      <div>
        <p
          className="text-xl font-black leading-none text-text-primary"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          {value}
        </p>
        <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------
function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-bold tracking-wider text-text-muted uppercase"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Score trend line chart — last 10 sessions
// ---------------------------------------------------------------------------
function TrendChart({ sessions }) {
  if (!sessions.length) return null;

  const data = sessions
    .slice(-10)
    .map((s, i) => ({
      index: i + 1,
      score: s.score_percent,
      label: formatDate(s.completed_at),
    }));

  return (
    <div className="rounded-2xl p-4 bg-surface border border-border shadow-sm">
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'var(--font-body)' }}
            className="text-text-muted"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            className="text-text-muted"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-surface border border-border px-3 py-2 rounded-xl text-xs text-text-primary shadow-md font-sans">
                  <p className="text-text-muted">{payload[0].payload.label}</p>
                  <p className="text-primary font-black mt-0.5">
                    {payload[0].value}%
                  </p>
                </div>
              );
            }}
            cursor={{ stroke: 'var(--color-border)' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#b91c1c" // Custom fallback or swap to standard application hex
            className="stroke-primary"
            strokeWidth={2.5}
            dot={{ r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent sessions list row
// ---------------------------------------------------------------------------
function SessionRow({ session }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface border border-border shadow-sm">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/5">
        <p className="text-sm font-black text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          {Math.round(session.score_percent)}%
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-text-primary" style={{ fontFamily: 'var(--font-body)' }}>
          {(session.subjects ?? []).join(', ') || 'Mixed Mock Assessment'}
        </p>
        <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          {session.school} · {session.year ?? 'Mock'} · {formatDate(session.completed_at)}
        </p>
        <p className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
          {session.correct_count}/{session.total_questions} correct · {formatDuration(session.time_taken_secs)}
        </p>
      </div>

      <Badge variant={scoreVariant(session.score_percent)}>
        {session.mode === 'study' ? 'Study' : 'Exam'}
      </Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Export
// ---------------------------------------------------------------------------
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadPerformanceStats = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      if (!error && data) setSessions(data);
      setIsLoading(false);
    };

    loadPerformanceStats();
  }, [user?.id]);

  // Computed aggregate score parameters
  const totalSessions = sessions.length;
  const overallAvg = totalSessions
    ? (sessions.reduce((s, r) => s + r.score_percent, 0) / totalSessions).toFixed(1)
    : '—';
  const bestScore = totalSessions
    ? Math.max(...sessions.map((r) => r.score_percent)).toFixed(1)
    : '—';
  const totalTimeSecs = sessions.reduce((s, r) => s + (r.time_taken_secs ?? 0), 0);
  const totalMins = Math.round(totalTimeSecs / 60);

  // Per-subject breakdowns
  const subjectMap = {};
  sessions.forEach((s) => {
    Object.entries(s.subject_breakdown ?? {}).forEach(([subj, stats]) => {
      if (!subjectMap[subj]) subjectMap[subj] = { total: 0, count: 0 };
      subjectMap[subj].total += stats.scorePercent;
      subjectMap[subj].count += 1;
    });
  });
  
  const subjectChartData = Object.entries(subjectMap).map(([subject, v]) => ({
    subject,
    scorePercent: parseFloat((v.total / v.count).toFixed(1)),
  }));

  return (
    <div className="fixed inset-0 flex flex-col bg-canvas select-none">
      {/* Target Back Header Bar */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border px-4 py-4 flex items-center shrink-0">
        <button
          onClick={() => navigate('/profile')}
          className="p-1 -ml-1 mr-2 rounded-xl text-text-secondary hover:bg-surface-2 transition-colors shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="text-base font-bold tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Performance Analytics
        </h1>
      </header>

      {/* Main Container Viewport */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 pb-8">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-text-muted">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : totalSessions === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 py-16 px-4 rounded-3xl bg-surface border border-border shadow-sm">
            <span className="text-4xl">📊</span>
            <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              No sessions found
            </p>
            <p className="text-xs text-text-muted max-w-xs leading-normal" style={{ fontFamily: 'var(--font-body)' }}>
              Complete a CBT test entry run from your dashboard to check real-time progress diagnostics here.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Information Block */}
            <div className="flex flex-col gap-3">
              <SectionLabel>Summary</SectionLabel>
              <div className="flex gap-3">
                <StatCard icon="📋" value={totalSessions} label="Sessions Run"  />
                <StatCard icon="📈" value={`${overallAvg}%`} label="Overall Average" />
              </div>
              <div className="flex gap-3">
                <StatCard icon="🏆" value={`${bestScore}%`} label="Personal Best" />
                <StatCard icon="⏱" value={`${totalMins}m`}  label="Total Time spent"  />
              </div>
            </div>

            {/* Score History Graph */}
            <div className="flex flex-col gap-3">
              <SectionLabel>Score Trend</SectionLabel>
              <TrendChart sessions={sessions} />
            </div>

            {/* Subject Breakdown Chart Module */}
            {subjectChartData.length > 0 && (
              <PerformanceChart data={subjectChartData} title="Subject Analysis" />
            )}

            {/* History Logs */}
            <div className="flex flex-col gap-3">
              <SectionLabel>Recent Sessions Logs</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {[...sessions].reverse().slice(0, 20).map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}