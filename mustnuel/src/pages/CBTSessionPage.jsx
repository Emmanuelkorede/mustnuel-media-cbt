// =============================================================================
// src/pages/CBTSessionPage.jsx
// =============================================================================

import { useState, useMemo, useEffect } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SubjectTabs from '../components/CBT/SubjectTabs';
import QuestionRenderer from '../components/CBT/QuestionRenderer';
import Calculator from '../components/CBT/Calculator';
import SubmitPrompt from '../components/CBT/SubmitPrompt';

export default function CBTSessionPage({ 
  questions = [], 
  onNavigateToResults 
}) {
  // Master Session State Configurations
  const [activeSubject, setActiveSubject] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: optionIndex }
  const [questionStatusMap, setQuestionStatusMap] = useState({}); // { questionId: 'answered' | 'unattempted' }

  // Modal Sheet Visibility Controls
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique subjects from incoming database questions array dynamically
  const subjects = useMemo(() => {
    return [...new Set(questions.map((q) => q.subject))];
  }, [questions]);

  // Sync active subject once live database questions populate the state pipeline
  useEffect(() => {
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0]);
    }
  }, [subjects, activeSubject]);

  // Filter questions relative to the selected subject category 
  const filteredQuestions = useMemo(() => {
    if (!activeSubject) return [];
    return questions.filter((q) => q.subject === activeSubject);
  }, [questions, activeSubject]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const hasQuestions = filteredQuestions.length > 0 && currentQuestion;

  // Option select action handler
  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));

    setQuestionStatusMap((prev) => ({
      ...prev,
      [currentQuestion.id]: 'answered',
    }));
  };

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    setCurrentQuestionIndex(0);
  };

  // Clean form routing transmission handler without alerts or console locks
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    
    if (onNavigateToResults) {
      onNavigateToResults({
        selectedAnswers,
        rawQuestions: questions
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-text-primary select-none overflow-x-hidden">
      
      {/* Dynamic Native Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            CBT Portal
          </h1>
          <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
            Exam Mode
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="!rounded-xl" onClick={() => setIsCalcOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="9" y1="22" x2="9" y2="16"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="16" y1="22" x2="16" y2="16"/>
            </svg>
          </Button>
          <Button variant="danger" size="sm" className="!rounded-xl" onClick={() => setIsSubmitOpen(true)} disabled={questions.length === 0}>
            Submit
          </Button>
        </div>
      </header>

      {/* Horizontal Subject Selection Bar */}
      <SubjectTabs
        subjects={subjects}
        activeSubject={activeSubject}
        onChange={handleSubjectChange}
        questions={questions}
        questionStatusMap={questionStatusMap}
      />

      {/* Question Canvas Area */}
      <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
        {hasQuestions ? (
          <>
            {/* Question Counter Card Label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-muted bg-surface-2 border border-border px-2.5 py-1 rounded-md">
                QUESTION {currentQuestionIndex + 1} OF {filteredQuestions.length}
              </span>
            </div>

            {/* Dynamic Question String Container */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
              <QuestionRenderer text={currentQuestion.question} />
            </div>

            {/* Options Stack Group */}
            <div className="flex flex-col gap-2.5">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                return (
                  <Button
                    key={`${currentQuestion.id}-opt-${index}`}
                    variant={isSelected ? 'option-selected' : 'option-idle'}
                    fullWidth
                    onClick={() => handleSelectOption(index)}
                    className="group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4 text-left w-full">
                      {/* Visual bullet counter token */}
                      <span className={`
                        w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors duration-200
                        ${isSelected 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-2 text-text-secondary border-border group-hover:border-primary/40'
                        }
                      `} style={{ fontFamily: 'var(--font-mono)' }}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      
                      {/* Target text string */}
                      <div className="flex-1 pt-0.5">
                        <QuestionRenderer text={option} inline />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </>
        ) : (
          /* Inline Contextual Empty State Layout (Keeps UI Frame Intact) */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto select-none">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-muted mb-4 shadow-sm animate-pulse">
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
              There are currently no examination items configured or running under this active session profile.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Layout Control Panel Dock */}
      <footer 
        className="sticky bottom-0 z-40 bg-surface/80 backdrop-blur-md border-t border-border px-5 pt-3 flex gap-3 shadow-lg"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Button
          variant="secondary"
          fullWidth
          disabled={!hasQuestions || currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((i) => i - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={!hasQuestions || currentQuestionIndex === filteredQuestions.length - 1}
          onClick={() => setCurrentQuestionIndex((i) => i + 1)}
        >
          Next Item
        </Button>
      </footer>

      {/* Floating Auxiliary Bottom Sheets */}
      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
      
      <Modal isOpen={isSubmitOpen} onClose={() => !isSubmitting && setIsSubmitOpen(false)} title="Confirm Action">
        <SubmitPrompt
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          onSubmit={handleFinalSubmit}
          questions={questions}
          questionStatusMap={questionStatusMap}
          isSubmitting={isSubmitting}
        />
      </Modal>

    </div>
  );
}