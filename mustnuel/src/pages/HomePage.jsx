// =============================================================================
// src/pages/HomePage.jsx
// -----------------------------------------------------------------------------
// Main dashboard. Shown after login + setup.
//
// Sections (top to bottom):
//   1. Top bar       — greeting, motivational text, notification bell
//   2. Activation banner — premium status card with school name
//   3. Quick actions — Study Mode + CBT Exam (stacked, full-width)
//   4. Metrics grid  — Streak, CBT count, Average score
//
// Props:
//   onNavigate(target) — routes to 'practice', 'notifications', etc.
// =============================================================================

import { useState, useEffect } from 'react';
import { motion }              from 'framer-motion';
import { useProfile }          from '../hooks/useProfile';
import AppTabs                 from '../components/navigation/AppTabs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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
  'The exam won\'t grade your excuses.',
];

function getTodayQuote() {
  const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
  return DAILY_QUOTES[dayIndex];
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------
function TopBar({ displayName, onNotificationPress, hasUnread }) {
  return (
    <div className="flex items-start justify-between px-5 pt-14 pb-4">
      <div className="flex flex-col gap-0.5">
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
        >
          {timeGreeting()}
        </p>
        <h1
          className="text-xl font-bold leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color:      'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {displayName}
        </h1>
        <p
          className="text-xs mt-0.5"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
        >
          {getTodayQuote()}
        </p>
      </div>

      {/* Notification bell */}
      <button
        onClick={onNotificationPress}
        className="relative w-10 h-10 rounded-2xl flex items-center justify-center mt-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          border:          '1px solid var(--color-border)',
        }}
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-secondary)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {hasUnread && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activation banner
// ---------------------------------------------------------------------------
function ActivationBanner({ isActivated, targetSchool }) {
  if (isActivated && targetSchool) {
    return (
      <div
        className="mx-5 rounded-3xl p-5 flex flex-col gap-1 overflow-hidden relative"
        style={{
          background:  'linear-gradient(135deg, var(--color-primary-subtle), var(--color-surface-2))',
          border:      '1px solid var(--color-primary-muted)',
        }}
      >
        {/* Subtle background watermark */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl font-black select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-display)',
            color:      'var(--color-primary)',
            opacity:    0.07,
            letterSpacing: '-0.04em',
          }}
        >
          {targetSchool}
        </div>

        {/* Activated badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(59,130,246,0.15)',
              color:           'var(--color-primary)',
              fontFamily:      'var(--font-body)',
            }}
          >
            ✦ Activated
          </span>
        </div>

        {/* School name — large, authoritative */}
        <p
          className="text-4xl font-black leading-none"
          style={{
            fontFamily:    'var(--font-display)',
            color:         'var(--color-text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {targetSchool}
        </p>
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
        >
          Full access · All years · All subjects
        </p>
      </div>
    );
  }

  // Not activated
  return (
    <div
      className="mx-5 rounded-3xl p-5 flex items-center justify-between gap-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(245,158,11,0.12)',
              color:           'var(--color-accent)',
              fontFamily:      'var(--font-body)',
            }}
          >
            ⚠ Free plan
          </span>
        </div>
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Unlock full access
        </p>
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
        >
          Submit your receipt to activate premium.
        </p>
      </div>
      <button
        className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white"
        style={{
          fontFamily:      'var(--font-body)',
          backgroundColor: 'var(--color-accent)',
        }}
      >
        Activate
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------
function QuickActions({ onStudy, onExam }) {
  return (
    <div className="px-5 flex flex-col gap-3">
      <p
        className="text-xs font-semibold uppercase"
        style={{
          fontFamily:    'var(--font-body)',
          color:         'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        Quick Start
      </p>

      {/* Study Mode */}
      <button
        onClick={onStudy}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-primary)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="text-left">
            <p
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Study Mode
            </p>
            <p
              className="text-xs text-white/70"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Answers revealed after each question
            </p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* CBT Exam */}
      <button
        onClick={onExam}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border:          '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="text-left">
            <p
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              CBT Exam
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
            >
              Timed simulation, no hints
            </p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------
function MetricCard({ label, value, sub, icon }) {
  return (
    <div
      className="flex-1 flex flex-col gap-2 px-4 py-4 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-base">{icon}</span>
      </div>
      <div>
        <p
          className="text-xl font-black leading-none"
          style={{
            fontFamily:    'var(--font-display)',
            color:         'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricsGrid({ streakCount, cbtCount, averageScore }) {
  return (
    <div className="px-5 flex flex-col gap-3">
      <p
        className="text-xs font-semibold uppercase"
        style={{
          fontFamily:    'var(--font-body)',
          color:         'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        Your Stats
      </p>
      <div className="flex gap-3">
        <MetricCard
          icon="🔥"
          value={streakCount}
          label="Day streak"
          sub={streakCount > 0 ? 'Keep it up' : 'Start today'}
        />
        <MetricCard
          icon="📋"
          value={cbtCount}
          label="CBTs done"
          sub={cbtCount > 0 ? 'Sessions' : 'None yet'}
        />
        <MetricCard
          icon="📈"
          value={averageScore > 0 ? `${Math.round(averageScore)}%` : '—'}
          label="Avg score"
          sub={averageScore > 0 ? 'Overall' : 'No data'}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main HomePage
// ---------------------------------------------------------------------------
export default function HomePage({ onNavigate }) {
  const {
    displayName,
    isActivated,
    targetSchool,
    streakCount,
    cbtCount,
    averageScore,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onNavigate?.(tab);
  };

  // Stagger children in on mount — one clean entrance, nothing more
  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Scrollable content — stops above the tab bar */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <motion.div
          className="flex flex-col gap-5 pb-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Top bar */}
          <motion.div variants={itemVariants}>
            <TopBar
              displayName={displayName}
              hasUnread={false}
              onNotificationPress={() => onNavigate?.('notifications')}
            />
          </motion.div>

          {/* Activation banner */}
          <motion.div variants={itemVariants}>
            <ActivationBanner
              isActivated={isActivated}
              targetSchool={targetSchool}
            />
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={itemVariants}>
            <QuickActions
              onStudy={() => onNavigate?.('practice', { mode: 'study' })}
              onExam={() => onNavigate?.('practice', { mode: 'exam' })}
            />
          </motion.div>

          {/* Metrics */}
          <motion.div variants={itemVariants}>
            <MetricsGrid
              streakCount={streakCount}
              cbtCount={cbtCount}
              averageScore={averageScore}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom tab bar */}
      <AppTabs active={activeTab} onChange={handleTabChange} />
    </div>
  );
}