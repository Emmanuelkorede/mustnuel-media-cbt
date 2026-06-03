import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useProfile }     from '../hooks/useProfile';
import { useApp }         from '../context/AppContext';
import AppTabs            from '../components/navigation/AppTabs';
import Button             from '../components/ui/Button';

const QUANTITY_OPTIONS = [10, 20, 30, 40, 60];

function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider mb-2"
      style={{
        fontFamily:    'var(--font-body)',
        color:         'var(--color-text-muted)',
        letterSpacing: '0.1em',
      }}
    >
      {children}
    </p>
  );
}

function ModeSelector({ value, onChange }) {
  const { PRACTICE_MODES } = useApp();
  
  const modes = [
    {
      id:    PRACTICE_MODES.STUDY,
      label: 'Study',
      icon:  '📖',
      desc:  'Answers revealed after each question',
    },
    {
      id:    PRACTICE_MODES.EXAM,
      label: 'Exam',
      icon:  '⏱',
      desc:  'Timed, answers hidden until submit',
    },
  ];

  return (
    <div className="flex gap-3">
      {modes.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex-1 flex flex-col gap-1.5 px-4 py-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: active ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              borderColor:     active ? 'var(--color-primary)'        : 'var(--color-border)',
            }}
          >
            <span className="text-xl">{m.icon}</span>
            <p
              className="text-sm font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
            >
              {m.label}
            </p>
            <p
              className="text-xs leading-snug"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
            >
              {m.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function YearSelector({ year, isMock, onYearChange, onMockChange }) {
  const { AVAILABLE_YEARS } = useApp();

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onMockChange(!isMock)}
        className="flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.99] cursor-pointer"
        style={{
          backgroundColor: isMock ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
          borderColor:     isMock ? 'var(--color-primary)'        : 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎲</span>
          <div className="text-left">
            <p
              className="text-sm font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                color: isMock ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
            >
              Randomised Mock
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
            >
              Mixed questions from all years
            </p>
          </div>
        </div>
        <div
          className="w-10 h-6 rounded-full relative transition-colors"
          style={{ backgroundColor: isMock ? 'var(--color-primary)' : 'var(--color-border)' }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: isMock ? '1.25rem' : '0.125rem' }}
          />
        </div>
      </button>

      {!isMock && (
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_YEARS.map((y) => {
            const active = year === y;
            return (
              <button
                key={y}
                onClick={() => onYearChange(active ? null : y)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
                style={{
                  fontFamily:      'var(--font-mono)',
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  borderColor:     active ? 'var(--color-primary)' : 'var(--color-border)',
                  color:           active ? '#ffffff'              : 'var(--color-text-secondary)',
                }}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectSelector({ allSubjects = [], selected, recommended = [], onChange }) {
  const MAX_SUBJECTS = 4;
  const isMaxReached = selected.length >= MAX_SUBJECTS;

  const toggle = (s) => {
    if (selected.includes(s)) {
      onChange(selected.filter((x) => x !== s));
    } else {
      if (isMaxReached) return;
      onChange([...selected, s]);
    }
  };

  const selectRecommended = () => {
    const safeRecommended = recommended.slice(0, MAX_SUBJECTS);
    onChange(safeRecommended);
  };

  return (
    <div className="flex flex-col gap-3">
      {recommended.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            Recommended:
          </span>
          <button
            onClick={selectRecommended}
            className="text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
            style={{
              fontFamily:      'var(--font-body)',
              backgroundColor: 'rgba(59,130,246,0.08)',
              borderColor:     'var(--color-primary)',
              color:           'var(--color-primary)',
            }}
          >
            Select recommended
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allSubjects.map((s) => {
          const isSelected    = selected.includes(s);
          const isRecommended = recommended.includes(s);
          const isDisabled    = !isSelected && isMaxReached;

          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
              style={{
                fontFamily:      'var(--font-body)',
                backgroundColor: isSelected
                  ? 'var(--color-primary)'
                  : isRecommended
                  ? 'rgba(59,130,246,0.06)'
                  : 'var(--color-surface)',
                borderColor: isSelected
                  ? 'var(--color-primary)'
                  : isRecommended
                  ? 'rgba(59,130,246,0.3)'
                  : 'var(--color-border)',
                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p
          className="text-xs flex justify-between"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
        >
          <span>{selected.length} subject{selected.length > 1 ? 's' : ''} selected</span>
          {isMaxReached && <span className="text-error font-semibold">Maximum of 4 reached</span>}
        </p>
      )}
    </div>
  );
}

function TimerSelector({ value, onChange }) {
  const { TIMER_OPTIONS } = useApp();

  return (
    <div className="flex gap-2">
      {TIMER_OPTIONS.map((mins) => {
        const active = value === mins;
        return (
          <button
            key={mins}
            onClick={() => onChange(mins)}
            className="flex-1 py-3 rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer"
            style={{
              fontFamily:      'var(--font-mono)',
              backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
              borderColor:     active ? 'var(--color-primary)' : 'var(--color-border)',
              color:           active ? '#ffffff'              : 'var(--color-text-secondary)',
            }}
          >
            {mins}m
          </button>
        );
      })}
    </div>
  );
}

function QuestionQuantitySelector({ value, onChange, isActivated, onPremiumClick }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {QUANTITY_OPTIONS.map((num) => {
          const active = value === num;
          // Free users can select any value that is 20 or lower. Higher options get locked.
          const isLocked = !isActivated && num > 20;

          return (
            <button
              key={num}
              onClick={() => isLocked ? onPremiumClick() : onChange(num)}
              className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all duration-150 ${isLocked ? 'opacity-60 cursor-pointer' : 'active:scale-95 cursor-pointer'}`}
              style={{
                fontFamily:      'var(--font-mono)',
                backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor:     active ? 'var(--color-primary)' : 'var(--color-border)',
                color:           active ? '#ffffff'              : 'var(--color-text-secondary)',
              }}
            >
              {num} {isLocked ? '🔒' : 'Qs'}
            </button>
          );
        })}
      </div>
      {!isActivated && (
        <p className="text-[10px] italic text-center" style={{ color: 'var(--color-primary)' }}>
          *Premium options are locked. Free users can select 20 questions or fewer.
        </p>
      )}
    </div>
  );
}

export default function PracticeHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isActivated, targetSchool } = useProfile();
  const { POST_UTME_SUBJECTS_BY_SCHOOL, PRACTICE_MODES, setIsUpgradeModalOpen } = useApp(); 

  const school = targetSchool || 'UI'; 
  const schoolConfig = POST_UTME_SUBJECTS_BY_SCHOOL[school] || POST_UTME_SUBJECTS_BY_SCHOOL['UI'];

  const [mode,       setMode]     = useState(PRACTICE_MODES.EXAM);
  const [year,       setYear]     = useState(null);
  const [isMock,     setIsMock]   = useState(false);
  const [timer,      setTimer]    = useState(60);
  const [subjects,   setSubjects] = useState([]);
  const [qQuantity,  setQQuantity] = useState(isActivated ? 40 : 20); 

  useEffect(() => {
    // If user's tier premium checks fail, step them down only if their value exceeded the 20 ceiling
    if (!isActivated && qQuantity > 20) {
      setQQuantity(20);
    }
  }, [isActivated, qQuantity]);

  useEffect(() => {
    if (schoolConfig) {
      setSubjects(schoolConfig.default_selection.slice(0, 4));
    }
  }, [school, schoolConfig]);

  useEffect(() => {
    if (location.state?.mode) {
      if (location.state.mode === 'study') setMode(PRACTICE_MODES.STUDY);
      if (location.state.mode === 'exam')  setMode(PRACTICE_MODES.EXAM);
    }
  }, [location.state, PRACTICE_MODES]);

  const canLaunch = subjects.length > 0 && school && (isMock || year);

  const handleLaunch = () => {
    if (!canLaunch) return;

    // Zero database loading is processed here now. Redirecting instantly.
    navigate('/cbt-session', {
      state: {
        sessionConfig: {
          mode,
          school,
          subjects,
          year: isMock ? null : year,
          timerMinutes: mode === PRACTICE_MODES.STUDY ? 0 : timer,
          freeOnly: !isActivated,
          limit: qQuantity,
        }
      }
    });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col select-none"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <div 
        className="flex items-center justify-between px-5 pt-4 pb-3 sticky top-0 z-20 backdrop-blur-md bg-opacity-95"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom:    '1px solid var(--color-border)',
        }}
      >
        <div className="flex-1 text-left">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor:    'var(--color-border)',
              color:           'var(--color-text-secondary)',
            }}
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        <h1
          className="text-base font-black text-center whitespace-nowrap px-2"
          style={{
            fontFamily:    'var(--font-body)',
            color:         'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Practice Hub
        </h1>

        <div className="flex-1" />
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
        style={{ paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex flex-col">
          <SectionLabel>Mode</SectionLabel>
          <ModeSelector 
            value={mode} 
            onChange={(selectedMode) => {
              if (selectedMode === PRACTICE_MODES.STUDY && !isActivated) {
                setIsUpgradeModalOpen(true);
              } else {
                setMode(selectedMode);
              }
            }} 
          />
        </div>

        <div className="flex flex-col">
          <SectionLabel>Year</SectionLabel>
          <YearSelector
            year={year}
            isMock={isMock}
            onYearChange={setYear}
            onMockChange={(v) => { setIsMock(v); if (v) setYear(null); }}
          />
        </div>

        <div className="flex flex-col">
          <SectionLabel>Subjects for {school} Post-UTME</SectionLabel>
          <SubjectSelector
            allSubjects={schoolConfig?.subjects}
            selected={subjects}
            recommended={schoolConfig?.default_selection}
            onChange={setSubjects}
          />
        </div>

        <div className="flex flex-col">
          <SectionLabel>Number of Questions</SectionLabel>
          <QuestionQuantitySelector 
            value={qQuantity} 
            onChange={setQQuantity}
            isActivated={isActivated}
            onPremiumClick={() => setIsUpgradeModalOpen(true)}
          />
        </div>

        {mode === PRACTICE_MODES.EXAM && (
          <div className="flex flex-col">
            <SectionLabel>Timer</SectionLabel>
            <TimerSelector value={timer} onChange={setTimer} />
          </div>
        )}
      </div>

      <div
        className="px-5 pt-3 pb-4 border-t shadow-sm"
        style={{
          borderColor:     'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          paddingBottom:   'calc(68px + env(safe-area-inset-bottom, 0px) + 4px)',
        }}
      >
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!canLaunch}
          onClick={handleLaunch}
        >
          Launch Practice →
        </Button>
      </div>

      <AppTabs active="practice" />
    </div>
  );
}