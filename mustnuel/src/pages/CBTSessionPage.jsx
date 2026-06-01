// =============================================================================
// src/pages/CBTSessionPage.jsx
// =============================================================================
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTestSession } from '../hooks/useTestSession';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SubjectTabs from '../components/CBT/SubjectTabs';
import QuestionRenderer from '../components/CBT/QuestionRenderer';
import Calculator from '../components/CBT/Calculator';
import SubmitPrompt from '../components/CBT/SubmitPrompt';

const OPTION_MAPPING = [
  { letter: 'A', field: 'option_a' },
  { letter: 'B', field: 'option_b' },
  { letter: 'C', field: 'option_c' },
  { letter: 'D', field: 'option_d' },
];

export default function CBTSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { PRACTICE_MODES } = useApp();
  
  const session = useTestSession();
  const { 
    config,
    questions = [], 
    currentIndex, 
    answers, 
    registerAnswer, 
    next, 
    prev, 
    goTo,
    submitSession,
    timeLeft,
    isLoading 
  } = session;

  const [activeSubject, setActiveSubject] = useState('');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX 1: Safely lock the launch mechanism behind a ref so it strictly fires ONCE.
  // This completely stops the timer ticks from triggering rogue re-fetches.
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (location.state?.sessionConfig && !hasLaunched.current) {
      hasLaunched.current = true;
      session.launch(location.state.sessionConfig);
    }
  }, [location.state?.sessionConfig, session]);

  const isStudyMode = config?.mode === PRACTICE_MODES.STUDY;

  const subjects = useMemo(() => {
    return [...new Set(questions.map((q) => q.subject))];
  }, [questions]);

  useEffect(() => {
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0]);
    }
  }, [subjects, activeSubject]);

  const filteredQuestions = useMemo(() => {
    if (!activeSubject) return [];
    return questions.filter((q) => q.subject === activeSubject);
  }, [questions, activeSubject]);

  // FIX 2: Extracted the active subject synchronization OUT of the useMemo calculation
  // and into a safe, controlled useEffect pipeline to prevent render crashing.
  useEffect(() => {
    if (questions.length === 0 || !questions[currentIndex]) return;
    const globalQuestion = questions[currentIndex];
    
    if (globalQuestion.subject !== activeSubject && subjects.includes(globalQuestion.subject)) {
      setActiveSubject(globalQuestion.subject);
    }
  }, [currentIndex, questions, activeSubject, subjects]);

  const activeSubjectIndex = useMemo(() => {
    if (questions.length === 0 || !questions[currentIndex]) return 0;
    const globalQuestion = questions[currentIndex];
    const idx = filteredQuestions.findIndex((q) => q.id === globalQuestion.id);
    return idx !== -1 ? idx : 0;
  }, [currentIndex, questions, filteredQuestions]);

  const currentQuestion = filteredQuestions[activeSubjectIndex];
  const hasQuestions = questions.length > 0 && currentQuestion;

  const handleSelectOption = (optionLetter) => {
    if (!currentQuestion) return;
    registerAnswer(currentQuestion.id, optionLetter);
  };

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    const targetFirstQuestion = questions.findIndex((q) => q.subject === subject);
    if (targetFirstQuestion !== -1) {
      goTo(targetFirstQuestion);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const payload = await submitSession();
    setIsSubmitting(false);
    setIsSubmitOpen(false);
    navigate('/result', { state: { result: payload } });
  };

  const generatedStatusMap = useMemo(() => {
    const trackingMap = {};
    questions.forEach((q) => {
      trackingMap[q.id] = answers[q.id] ? 'answered' : 'unattempted';
    });
    return trackingMap;
  }, [questions, answers]);

  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const targetConfigMatches = config && location.state?.sessionConfig && 
    config.school === location.state.sessionConfig.school &&
    config.limit === location.state.sessionConfig.limit &&
    config.mode === location.state.sessionConfig.mode;

  if (isLoading || !targetConfigMatches) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-text-secondary" style={{ fontFamily: 'var(--font-body)' }}>
          Loading Examination Data...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-canvas flex flex-col text-text-primary select-none overflow-hidden">
      
      {/* Top Navigation Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between shrink-0 z-40">
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {isStudyMode ? 'Study Session' : 'CBT Exam'}
          </h1>
          {!isStudyMode && timeLeft > 0 && (
            <span className="text-xs font-mono font-bold text-primary animate-pulse mt-0.5">
              ⏱ {formatDuration(timeLeft)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="!rounded-xl !py-2" onClick={() => setIsCalcOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="9" y1="22" x2="9" y2="16"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="16" y1="22" x2="16" y2="16"/>
            </svg>
          </Button>
          <Button 
            variant={isStudyMode ? "secondary" : "danger"} 
            size="sm" 
            className="!rounded-xl !py-2" 
            onClick={() => setIsSubmitOpen(true)} 
            disabled={questions.length === 0}
          >
            {isStudyMode ? 'Finish' : 'Submit'}
          </Button>
        </div>
      </header>

      <SubjectTabs
        subjects={subjects}
        activeSubject={activeSubject}
        onChange={handleSubjectChange}
        questions={questions}
        questionStatusMap={generatedStatusMap}
      />

      {/* Strictly Scrollable Question Stream Panel */}
      <main className="flex-1 overflow-y-auto px-5 py-3.5 flex flex-col gap-4">
        {hasQuestions ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-md">
                QUESTION {activeSubjectIndex + 1} OF {filteredQuestions.length} ({activeSubject})
              </span>
            </div>

            {/* Tightened Question Container */}
            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm text-sm leading-relaxed">
              <QuestionRenderer text={currentQuestion.question_text} />
            </div>

            {/* Compressed Option Box Rows */}
            <div className="flex flex-col gap-2">
              {OPTION_MAPPING.map(({ letter, field }) => {
                const userAnswer = answers[currentQuestion.id];
                const hasAnswered = !!userAnswer;
                const correctOption = currentQuestion.correct_option;
                const optionText = currentQuestion[field] ?? '';

                let buttonVariant = 'option-idle';

                if (isStudyMode && hasAnswered) {
                  if (letter === correctOption) {
                    buttonVariant = 'option-correct';
                  } else if (letter === userAnswer) {
                    buttonVariant = 'option-wrong';
                  }
                } else if (userAnswer === letter) {
                  buttonVariant = 'option-selected';
                }

                const isCorrectOptionAndRevealed = isStudyMode && hasAnswered && letter === correctOption;

                return (
                  <Button
                    key={`${currentQuestion.id}-opt-${letter}`}
                    variant={buttonVariant}
                    fullWidth
                    disabled={isStudyMode && hasAnswered && userAnswer !== letter && letter !== correctOption}
                    onClick={() => handleSelectOption(letter)}
                    className="group relative overflow-hidden !py-2.5 !px-3.5 !rounded-xl transition-all duration-150 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 text-left w-full">
                      <span className={`
                        w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 border transition-colors duration-150
                        ${buttonVariant === 'option-selected' ? 'bg-primary text-white border-primary' : ''}
                        ${buttonVariant === 'option-correct' ? 'bg-green-500 text-white border-green-500' : ''}
                        ${buttonVariant === 'option-wrong' ? 'bg-red-500 text-white border-red-500' : ''}
                        ${buttonVariant === 'option-idle' ? 'bg-surface-2 text-text-secondary border-border group-hover:border-primary/40' : ''}
                      `} style={{ fontFamily: 'var(--font-mono)' }}>
                        {isCorrectOptionAndRevealed ? '✓' : letter}
                      </span>
                      
                      <div className="flex-1 text-xs font-medium leading-normal">
                        <QuestionRenderer text={optionText} inline />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Tightened Explanation Sheet */}
            {isStudyMode && answers[currentQuestion.id] && (
              <div className="mt-1 p-4 rounded-xl bg-surface border border-border shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                <h4 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-base">💡</span> Explanation
                </h4>
                {currentQuestion.explanation ? (
                  <QuestionRenderer text={currentQuestion.explanation} className="text-xs text-text-secondary leading-relaxed" />
                ) : (
                  <p className="text-xs text-text-muted italic">No detailed explanation provided for this item.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted mb-3 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
              No Questions Loaded
            </h3>
            <p className="text-xs text-text-muted max-w-xs leading-normal" style={{ fontFamily: 'var(--font-body)' }}>
              Could not find records matching your choices. Please check your system configuration setup.
            </p>
          </div>
        )}
      </main>

      {/* Permanently Fixed Static Bottom Toolbar */}
      <footer 
        className="bg-surface border-t border-border px-5 pt-2.5 pb-4 flex gap-2.5 shrink-0 z-40 shadow-sm"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Button 
          variant="secondary" 
          size="sm"
          fullWidth 
          disabled={!hasQuestions || currentIndex === 0} 
          onClick={prev}
          className="!py-3 !rounded-xl transition-all duration-150 active:scale-95"
        >
          Previous
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          fullWidth 
          disabled={!hasQuestions || currentIndex === questions.length - 1} 
          onClick={next}
          className="!py-3 !rounded-xl transition-all duration-150 active:scale-95"
        >
          Next Item
        </Button>
      </footer>

      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
      
      <Modal isOpen={isSubmitOpen} onClose={() => !isSubmitting && setIsSubmitOpen(false)} title="Confirm Action">
        <SubmitPrompt
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          onSubmit={handleFinalSubmit}
          questions={questions}
          questionStatusMap={generatedStatusMap}
          isSubmitting={isSubmitting}
        />
      </Modal>

    </div>
  );
}