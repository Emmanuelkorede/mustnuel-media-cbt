

import { useMemo } from 'react';
import Button from '../ui/Button';

export default function SubmitPrompt({ 
  isOpen, 
  onClose, 
  onSubmit, 
  questions = [], 
  questionStatusMap = {},
  isSubmitting = false 
}) {
  
  const stats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter(
      (q) => questionStatusMap[q.id] === 'answered'
    ).length;
    const remaining = total - answered;
    
    return { total, answered, remaining };
  }, [questions, questionStatusMap]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col gap-5 text-center select-none">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Submit Examination?
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
          You are about to close this computer-based testing session. You cannot alter your answers after submission.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-surface-2 border border-border p-4 rounded-2xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Answered</span>
          <span className="text-xl font-bold text-green-500 font-mono">{stats.answered}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Unattempted</span>
          <span className={`text-xl font-bold font-mono ${stats.remaining > 0 ? 'text-amber-500' : 'text-text-muted'}`}>
            {stats.remaining}
          </span>
        </div>
      </div>

      {stats.remaining > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/5 py-2.5 px-3 rounded-xl border border-amber-500/10" style={{ fontFamily: 'var(--font-body)' }}>
          ⚠️ Attention: You have {stats.remaining} unanswered question{stats.remaining === 1 ? '' : 's'} remaining!
        </p>
      )}

      <div className="flex flex-col gap-2 mt-2">
        <Button variant="primary" fullWidth onClick={onSubmit} loading={isSubmitting}>
          Yes, Submit Exam
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose} disabled={isSubmitting}>
          Cancel and Return
        </Button>
      </div>
    </div>
  );
}