import { useState, useMemo, useEffect } from 'react';
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

  useEffect(() => {
    if (location.state?.sessionConfig) {
      session.launch(location.state.sessionConfig);
    }
  }, [location.state]);

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

  const activeSubjectIndex = useMemo(() => {
    if (questions.length === 0 || !questions[currentIndex]) return 0;
    const globalQuestion = questions[currentIndex];
    
    if (globalQuestion.subject !== activeSubject && subjects.includes(globalQuestion.subject)) {
      setActiveSubject(globalQuestion.subject);
    }

    const idx = filteredQuestions.findIndex((q) => q.id === globalQuestion.id);
    return idx !== -1 ? idx : 0;
  }, [currentIndex, questions, filteredQuestions, activeSubject, subjects]);

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

  // FIXED: Compare hook config directly to location state config. 
  // If they don't match yet, lock the screen into the loading state to block old metrics from rendering.
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
    <div className="min-h-screen bg-canvas flex flex-col text-text-primary select-none overflow-x-hidden">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {isStudyMode ? 'Study Session' : 'CBT Exam'}
          </h1>
          {!isStudyMode && timeLeft > 0 && (
            <span className="text-sm font-mono font-bold text-primary animate-pulse mt-0.5">
              ⏱ {formatDuration(timeLeft)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="!rounded-xl" onClick={() => setIsCalcOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="9" y1="22" x2="9" y2="16"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="16" y1="22" x2="16" y2="16"/>
            </svg>
          </Button>
          <Button 
            variant={isStudyMode ? "secondary" : "danger"} 
            size="sm" 
            className="!rounded-xl" 
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

      <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6 pb-8">
        {hasQuestions ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-muted bg-surface-2 border border-border px-2.5 py-1 rounded-md">
                QUESTION {activeSubjectIndex + 1} OF {filteredQuestions.length} ({activeSubject})
              </span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
              <QuestionRenderer text={currentQuestion.question_text} />
            </div>

            <div className="flex flex-col gap-2.5">
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
                    className="group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4 text-left w-full">
                      <span className={`
                        w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors duration-200
                        ${buttonVariant === 'option-selected' ? 'bg-primary text-white border-primary' : ''}
                        ${buttonVariant === 'option-correct' ? 'bg-green-500 text-white border-green-500' : ''}
                        ${buttonVariant === 'option-wrong' ? 'bg-red-500 text-white border-red-500' : ''}
                        ${buttonVariant === 'option-idle' ? 'bg-surface-2 text-text-secondary border-border group-hover:border-primary/40' : ''}
                      `} style={{ fontFamily: 'var(--font-mono)' }}>
                        {isCorrectOptionAndRevealed ? '✓' : letter}
                      </span>
                      
                      <div className="flex-1 pt-0.5">
                        <QuestionRenderer text={optionText} inline />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {isStudyMode && answers[currentQuestion.id] && (
              <div className="mt-4 p-5 rounded-2xl bg-surface border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-lg">💡</span> Explanation
                </h4>
                {currentQuestion.explanation ? (
                  <QuestionRenderer text={currentQuestion.explanation} className="text-sm text-text-secondary" />
                ) : (
                  <p className="text-sm text-text-muted italic">No detailed explanation provided for this item.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto select-none">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-muted mb-4 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              No Questions Loaded
            </h3>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Could not find database records matching your choices. Please verify that questions have been seeded into your Supabase database table with matching schools and subjects.
            </p>
          </div>
        )}
      </main>

      <footer 
        className="sticky bottom-0 z-40 bg-surface/80 backdrop-blur-md border-t border-border px-5 pt-3 flex gap-3 shadow-lg"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Button variant="secondary" fullWidth disabled={!hasQuestions || currentIndex === 0} onClick={prev}>
          Previous
        </Button>
        <Button variant="secondary" fullWidth disabled={!hasQuestions || currentIndex === questions.length - 1} onClick={next}>
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