// =============================================================================
// src/components/CBT/SubjectTabs.jsx
// =============================================================================

import { useMemo } from 'react';

export default function SubjectTabs({
  subjects = [],
  activeSubject,
  onChange,
  questionStatusMap = {},
  questions = [],
}) {
  
  // Memoize performance metrics for session progression state configurations
  const subjectStats = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      const subjectQs = questions.filter((q) => q.subject === subject);
      const answered = subjectQs.filter(
        (q) => questionStatusMap[q.id] === 'answered'
      ).length;
      acc[subject] = { total: subjectQs.length, answered };
      return acc;
    }, {});
  }, [subjects, questions, questionStatusMap]);

  // Strip layout from DOM entirely if only single-subject configuration exists
  if (subjects.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-2 shrink-0 select-none no-scrollbar touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {subjects.map((subject) => {
        const isActive = subject === activeSubject;
        const stats = subjectStats[subject] ?? { total: 0, answered: 0 };
        const allDone = stats.answered === stats.total && stats.total > 0;

        return (
          <button
            key={subject}
            onClick={() => onChange?.(subject)}
            className={`
              shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border 
              transition-all duration-200 cursor-pointer active:scale-[0.98]
              ${isActive 
                ? 'bg-primary border-primary' 
                : 'bg-surface border-border hover:bg-surface-2'
              }
            `}
          >
            {/* Subject Identifier Label */}
            <span
              className={`text-xs font-semibold whitespace-nowrap tracking-wide`}
              style={{ 
                fontFamily: 'var(--font-body)',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)'
              }}
            >
              {subject}
            </span>

            {/* Answered Progress Tracking Metric Token */}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums border border-transparent`}
              style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: isActive
                  ? 'rgba(255,255,255,0.2)'
                  : allDone
                  ? 'rgba(34,197,94,0.12)'
                  : 'var(--color-surface-2)',
                color: isActive
                  ? '#ffffff'
                  : allDone
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)',
                borderColor: (!isActive && allDone) ? 'rgba(34,197,94,0.2)' : 'transparent'
              }}
            >
              {stats.answered}/{stats.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}