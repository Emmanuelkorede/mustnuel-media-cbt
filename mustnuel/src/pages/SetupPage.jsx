// =============================================================================
// src/pages/SetupPage.jsx
// -----------------------------------------------------------------------------
// Post-signup 3-step profile setup. Clean, mobile-first.
// Step 1: Name  |  Step 2: School  |  Step 3: Track
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile }              from '../hooks/useProfile';
import { SCHOOLS, SUBJECTS_BY_TRACK } from '../context/AppContext';

const SCHOOL_META = {
  UI:     { name: 'University of Ibadan',          location: 'Ibadan, Oyo State' },
  UNILAG: { name: 'University of Lagos',           location: 'Lagos, Lagos State' },
  OAU:    { name: 'Obafemi Awolowo University',    location: 'Ile-Ife, Osun State' },
};

const TRACK_OPTIONS = [
  { id: 'Science',    emoji: '🔬', desc: 'Physics · Chemistry · Biology · Maths' },
  { id: 'Arts',       emoji: '📚', desc: 'Literature · Government · CRS/IRK' },
  { id: 'Commercial', emoji: '💼', desc: 'Economics · Accounting · Commerce' },
];

// ---------------------------------------------------------------------------
function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: 'var(--color-primary)' }}
        animate={{ width: `${(step / total) * 100}%` }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
function StepName({ value, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          What should we call you?
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          Your public display name on the platform.
        </p>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Ada Obi"
        maxLength={32}
        autoFocus
        className="w-full px-4 py-4 rounded-xl text-base outline-none border transition-colors"
        style={{
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
function StepSchool({ value, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Target institution
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          Filters your default question bank. You can change this later.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {SCHOOLS.map(id => {
          const meta       = SCHOOL_META[id];
          const isSelected = value === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border text-left transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                borderColor:     isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <div>
                <p className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{id}</p>
                <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{meta.name}</p>
                <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>{meta.location}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function StepTrack({ value, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Academic track
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          Highlights your core subjects. You have full access to all papers.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {TRACK_OPTIONS.map(t => {
          const isSelected = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border text-left transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                borderColor:     isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <span className="text-2xl shrink-0">{t.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{t.id}</p>
                <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{t.desc}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const TOTAL = 3;

export default function SetupPage({ onComplete }) {
  const { save, isSaving, saveError } = useProfile();
  const [step, setStep]     = useState(1);
  const [dir,  setDir]      = useState(1);
  const [name, setName]     = useState('');
  const [school, setSchool] = useState('');
  const [track, setTrack]   = useState('');

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return !!school;
    if (step === 3) return !!track;
  };

  const goNext = async () => {
    if (!canProceed()) return;
    if (step < TOTAL) { setDir(1); setStep(s => s + 1); }
    else {
      const r = await save({ display_name: name.trim(), target_school: school, track });
      if (r.success) onComplete?.();
    }
  };

  const goPrev = () => { if (step > 1) { setDir(-1); setStep(s => s - 1); } };

  const variants = {
    enter:  (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={step === 1}
            className="flex items-center gap-1 disabled:opacity-0 transition-opacity"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            {step} / {TOTAL}
          </span>
        </div>
        <ProgressBar step={step} total={TOTAL} />
      </div>

      {/* Step content */}
      <div className="relative flex-1 overflow-hidden px-5">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-x-5 top-2 bottom-0 overflow-y-auto"
          >
            {step === 1 && <StepName   value={name}   onChange={setName}   />}
            {step === 2 && <StepSchool value={school} onChange={setSchool} />}
            {step === 3 && <StepTrack  value={track}  onChange={setTrack}  />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 pb-12 pt-4 shrink-0">
        {saveError && (
          <p className="mb-3 text-xs text-center" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)' }}>
            {saveError}
          </p>
        )}
        <button
          onClick={goNext}
          disabled={!canProceed() || isSaving}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40 transition-opacity"
          style={{ fontFamily: 'var(--font-display)', backgroundColor: 'var(--color-primary)' }}
        >
          {isSaving ? 'Saving…' : step < TOTAL ? 'Continue' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}