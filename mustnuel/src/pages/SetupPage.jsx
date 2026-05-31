import { useNavigate } from 'react-router';
import { useState } from 'react';
import { FiChevronLeft, FiCheck, FiUser } from 'react-icons/fi';
import { useProfile } from '../hooks/useProfile';
import { SCHOOLS } from '../context/AppContext';

const SCHOOL_META = {
  UI:     { name: 'University of Ibadan',        location: 'Ibadan, Oyo State' },
  UNILAG: { name: 'University of Lagos',          location: 'Lagos, Lagos State' },
  OAU:    { name: 'Obafemi Awolowo University',    location: 'Ile-Ife, Osun State' },
};

const TRACK_OPTIONS = [
  { id: 'Science',    emoji: '🔬', desc: 'Physics · Chemistry · Biology · Maths' },
  { id: 'Arts',       emoji: '📚', desc: 'Literature · Government · CRS/IRK' },
  { id: 'Commercial', emoji: '💼', desc: 'Economics · Accounting · Commerce' },
];

function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          width: `${(step / total) * 100}%`
        }}
      />
    </div>
  );
}

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

      <div className="flex flex-col gap-5">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. Ada Obi"
          maxLength={32}
          autoFocus
          className="w-full px-4 py-4 rounded-xl text-base outline-none border transition-all duration-200"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        {/* Live Identity Preview Card */}
        <div 
          className="flex items-center gap-3 p-4 rounded-xl border border-dashed transition-all duration-200"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <FiUser size={20} style={{ color: value.trim() ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span 
              className="text-xs font-semibold uppercase tracking-wider" 
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
            >
              Profile Preview
            </span>
            <span 
              className="text-sm font-bold truncate" 
              style={{ fontFamily: 'var(--font-display)', color: value.trim() ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
            >
              {value.trim() ? value : 'Your Name Here'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          const meta = SCHOOL_META[id];
          const isSelected = value === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* School Image Placeholder Box */}
                <div 
                  className="w-12 h-12 rounded-xl shrink-0 border overflow-hidden bg-[--color-canvas] flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {id}
                </div>
                
                <div className="min-w-0">
                  <p className="text-base font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{id}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{meta.name}</p>
                  <p className="text-xs truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>{meta.location}</p>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <FiCheck size={12} color="white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <span className="text-2xl shrink-0">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{t.id}</p>
                <p className="text-xs mt-0.5 truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{t.desc}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <FiCheck size={12} color="white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TOTAL = 3;

export default function SetupPage() {
  const navigate = useNavigate();
  const { save, isSaving, saveError } = useProfile();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [track, setTrack] = useState('');

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return !!school;
    if (step === 3) return !!track;
    return false;
  };

  const goNext = async () => {
    if (!canProceed()) return;
    if (step < TOTAL) { 
      setStep(s => s + 1); 
    } else {
      const r = await save({ display_name: name.trim(), target_school: school, track });
      if (r.success) navigate('/home');
    }
  };

  const goPrev = () => { if (step > 1) setStep(s => s - 1); };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={step === 1}
            className="flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            <FiChevronLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            {step} / {TOTAL}
          </span>
        </div>
        <ProgressBar step={step} total={TOTAL} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {step === 1 && <StepName   value={name}   onChange={setName}   />}
        {step === 2 && <StepSchool value={school} onChange={setSchool} />}
        {step === 3 && <StepTrack  value={track}  onChange={setTrack}  />}
      </div>

      {/* Footer */}
      <div className="px-5 pb-12 pt-4 shrink-0">
        {saveError && (
          <p className="mb-3 text-xs text-center font-semibold animate-fade-in" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)' }}>
            {saveError}
          </p>
        )}
        <button
          onClick={goNext}
          disabled={!canProceed() || isSaving}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
          style={{ fontFamily: 'var(--font-display)', backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={e => !(!canProceed() || isSaving) && (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
          onMouseLeave={e => e.target.style.backgroundColor = 'var(--color-primary)'}
        >
          {isSaving ? 'Saving…' : step < TOTAL ? 'Continue' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}