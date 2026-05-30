// =============================================================================
// src/pages/OnboardingPage.jsx
// -----------------------------------------------------------------------------
// 3-slide walkthrough + final CTA frame.
// Clean, mobile-first. Swipeable. Minimal animation — only slide transitions.
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '../components/ui/AppLogo';

// ---------------------------------------------------------------------------
// Slide data
// ---------------------------------------------------------------------------
const SLIDES = [
  {
    id:    'simulation',
    icon:  '🎯',
    title: 'Real CBT Simulation',
    body:  'Timed sessions built exactly like the real exam — JAMB, WAEC, and Post-UTME question formats.',
  },
  {
    id:    'analytics',
    icon:  '📊',
    title: 'Track Your Progress',
    body:  'Subject-level breakdowns, score history, and streak tracking so you always know where you stand.',
  },
  {
    id:    'leaderboard',
    icon:  '🏆',
    title: 'Weekly Leaderboards',
    body:  'Compete against students targeting the same school. Rankings reset every Monday.',
  },
];

export default function OnboardingPage({ onNavigate }) {
  const [index, setIndex]     = useState(0);
  const [direction, setDir]   = useState(1);

  const isLast = index === SLIDES.length - 1;
  const slide  = SLIDES[index];

  const goTo = (next, dir) => { setDir(dir); setIndex(next); };
  const goNext = () => { if (!isLast) goTo(index + 1, 1); };
  const goPrev = () => { if (index > 0) goTo(index - 1, -1); };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -50) goNext();
    else if (info.offset.x > 50) goPrev();
  };

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2 shrink-0">
        <AppLogo size={32} />
        <button
          onClick={() => onNavigate?.('auth')}
          className="text-sm px-3 py-1.5 rounded-lg border"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          Skip
        </button>
      </div>

      {/* ── Slide content ── */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 select-none"
          >
            {/* Icon */}
            <div className="text-6xl mb-8">{slide.icon}</div>

            {/* Text */}
            <div className="text-center max-w-xs">
              <h2
                className="text-2xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {slide.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
              >
                {slide.body}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom controls ── */}
      <div className="px-5 pb-12 shrink-0 flex flex-col gap-5">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index ? 20 : 6,
                backgroundColor: i === index ? 'var(--color-primary)' : 'var(--color-border)',
              }}
              transition={{ duration: 0.25 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isLast ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => onNavigate?.('auth', { mode: 'signup' })}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  backgroundColor: 'var(--color-primary)',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => onNavigate?.('auth', { mode: 'signin' })}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                Sign In
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={goPrev}
                disabled={index === 0}
                className="w-12 h-12 rounded-xl border flex items-center justify-center disabled:opacity-20"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={goNext}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-white"
                style={{ fontFamily: 'var(--font-display)', backgroundColor: 'var(--color-primary)' }}
              >
                Next
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}