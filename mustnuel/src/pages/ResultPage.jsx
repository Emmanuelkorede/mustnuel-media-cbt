// =============================================================================
// src/pages/ResultPage.jsx
// =============================================================================
// Post-exam results screen.
//
// Two views toggled by a tab:
//   1. Overview  — score ring, subject breakdown chart, key metrics
//   2. Review    — question-by-question corrections with filter tabs
//                  (All / Wrong / Skipped)
//
// Props:
//   session     — the same useTestSession() instance (result is inside it)
//   onNavigate  — routing handler
// =============================================================================

import { useState } from 'react';
import Header           from '../components/navigation/Header';
import PerformanceChart from '../components/widgets/PerformanceChart';
import QuestionRenderer from '../components/CBT/QuestionRenderer';
import OptionButton     from '../components/CBT/OptionButton';
import Button           from '../components/ui/Button';
import Badge            from '../components/ui/Badge';

// ---------------------------------------------------------------------------
// Score ring — SVG circle progress
// ---------------------------------------------------------------------------
function ScoreRing({ percent }) {
  const radius      = 54;
  const circumference = 2 * Math.PI * radius;
  const filled      = (percent / 100) * circumference;

  const color = percent >= 70
    ? 'var(--color-success)'
    : percent >= 50
    ? 'var(--color-accent)'
    : 'var(--color-error)';

  const grade = percent >= 70 ? 'Pass' : percent >= 50 ? 'Fair' : 'Fail';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          {/* Track */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filled}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="text-3xl font-black leading-none"
            style={{ fontFamily: 'var(--font-display)', color, letterSpacing: '-0.03em' }}
          >
            {Math.round(percent)}%
          </p>
          <p
            className="text-xs font-semibold mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            {grade}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------
function OverviewTab({ result }) {
  const chartData = Object.entries(result.subject_breakdown ?? {}).map(
    ([subject, stats]) => ({ subject, scorePercent: stats.scorePercent })
  );

  const mins = Math.floor((result.time_taken_secs ?? 0) / 60);
  const secs = (result.time_taken_secs ?? 0) % 60;

  const stats = [
    { label: 'Correct',    value: result.correct_count },
    { label: 'Wrong',      value: result.total_questions - result.correct_count - (result.reviewItems?.filter(r => r.isSkipped).length ?? 0) },
    { label: 'Skipped',    value: result.reviewItems?.filter(r => r.isSkipped).length ?? 0 },
    { label: 'Time taken', value: `${mins}m ${String(secs).padStart(2,'0')}s` },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Score ring */}
      <div className="flex justify-center py-4">
        <ScoreRing percent={result.score_percent} />
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 px-4 py-4 rounded-2xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
            }}
          >
            <p
              className="text-xl font-black leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              {s.value}
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Subject breakdown chart */}
      {chartData.length > 0 && (
        <PerformanceChart data={chartData} title="Subject Breakdown" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab — corrections view
// ---------------------------------------------------------------------------
const REVIEW_FILTERS = ['All', 'Wrong', 'Skipped'];

function ReviewTab({ reviewItems = [] }) {
  const [filter,        setFilter]        = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filtered = reviewItems.filter((item) => {
    if (filter === 'Wrong')   return !item.isCorrect && !item.isSkipped;
    if (filter === 'Skipped') return item.isSkipped;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {REVIEW_FILTERS.map((f) => {
          const active = filter === f;
          const count  = reviewItems.filter((item) => {
            if (f === 'Wrong')   return !item.isCorrect && !item.isSkipped;
            if (f === 'Skipped') return item.isSkipped;
            return true;
          }).length;

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors"
              style={{
                fontFamily:      'var(--font-body)',
                backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor:     active ? 'var(--color-primary)' : 'var(--color-border)',
                color:           active ? '#ffffff'              : 'var(--color-text-secondary)',
              }}
            >
              {f}
              <span
                className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-2)',
                  color:           active ? '#ffffff' : 'var(--color-text-muted)',
                  fontFamily:      'var(--font-mono)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-2xl mb-2">🎉</p>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
          >
            {filter === 'Wrong' ? 'No wrong answers!' : 'No skipped questions!'}
          </p>
        </div>
      ) : (
        filtered.map((item, i) => {
          const isExpanded    = expandedIndex === i;
          const correctIndex  = item.options.findIndex((o) => o === item.correctAnswer);
          const statusBadge   = item.isSkipped  ? <Badge variant="warning">Skipped</Badge>
                              : item.isCorrect  ? <Badge variant="success">Correct</Badge>
                              :                   <Badge variant="error">Wrong</Badge>;

          return (
            <div
              key={item.questionId}
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor:     'var(--color-border)',
              }}
            >
              {/* Collapsed header — always visible */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full flex items-start gap-3 px-4 py-4 text-left"
              >
                <span
                  className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg mt-0.5"
                  style={{
                    fontFamily:      'var(--font-mono)',
                    backgroundColor: 'var(--color-surface-2)',
                    color:           'var(--color-text-muted)',
                  }}
                >
                  Q{reviewItems.indexOf(item) + 1}
                </span>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <p
                    className="text-sm leading-snug line-clamp-2"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}
                  >
                    {item.questionText}
                  </p>
                  {statusBadge}
                </div>

                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-text-muted)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 mt-1 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* Expanded — options + explanation */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 flex flex-col gap-3 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="pt-3 flex flex-col gap-2">
                    {item.options.map((opt, oi) => {
                      const isUserAnswer  = item.userAnswerIndex === oi;
                      const isCorrectOpt  = oi === correctIndex;
                      let state = 'idle';
                      if (item.isSkipped) {
                        state = isCorrectOpt ? 'revealed' : 'idle';
                      } else if (isCorrectOpt && isUserAnswer) {
                        state = 'correct';
                      } else if (isUserAnswer && !isCorrectOpt) {
                        state = 'wrong';
                      } else if (isCorrectOpt) {
                        state = 'revealed';
                      }

                      return (
                        <OptionButton
                          key={oi}
                          index={oi}
                          text={opt}
                          state={state}
                          disabled
                        />
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {item.explanation && (
                    <div
                      className="rounded-2xl px-4 py-3 border"
                      style={{
                        backgroundColor: 'rgba(34,197,94,0.05)',
                        borderColor:     'rgba(34,197,94,0.2)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase mb-1.5"
                        style={{
                          fontFamily:    'var(--font-body)',
                          color:         'var(--color-success)',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Explanation
                      </p>
                      <QuestionRenderer text={item.explanation} className="text-sm" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ResultPage
// ---------------------------------------------------------------------------
const TABS = ['Overview', 'Review Corrections'];

export default function ResultPage({ session, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const { result, reset } = session;

  if (!result) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          No result data.
        </p>
      </div>
    );
  }

  const handleDone = () => {
    reset();
    onNavigate?.('home');
  };

  const handleRetry = () => {
    reset();
    onNavigate?.('practice');
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Header */}
      <Header
        title="Results"
        rightSlot={
          <button
            onClick={handleDone}
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}
          >
            Done
          </button>
        }
      />

      {/* Tab switcher */}
      <div
        className="flex shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-sm font-semibold relative transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {tab}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {activeTab === 'Overview'
          ? <OverviewTab result={result} />
          : <ReviewTab reviewItems={result.reviewItems ?? []} />
        }
      </div>

      {/* Bottom CTA */}
      <div
        className="shrink-0 px-5 py-4 border-t flex gap-3"
        style={{
          borderColor:     'var(--color-border)',
          backgroundColor: 'var(--color-canvas)',
          paddingBottom:   'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Button variant="secondary" size="md" fullWidth onClick={handleRetry}>
          Try Again
        </Button>
        <Button variant="primary" size="md" fullWidth onClick={handleDone}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}