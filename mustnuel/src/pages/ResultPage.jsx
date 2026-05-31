import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { useProfile } from '../hooks/useProfile'; // 👈 Import useProfile to get accurate activation status
import PerformanceChart from '../components/widgets/PerformanceChart';
import QuestionRenderer from '../components/CBT/QuestionRenderer';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const OPTION_MAPPING = [
  { letter: 'A', field: 'option_a' },
  { letter: 'B', field: 'option_b' },
  { letter: 'C', field: 'option_c' },
  { letter: 'D', field: 'option_d' },
];

function ScoreRing({ percent }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;

  const color = percent >= 70 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444';
  const grade = percent >= 70 ? 'Pass' : percent >= 50 ? 'Fair' : 'Fail';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            className="stroke-border"
            strokeWidth="10"
          />
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filled}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="text-3xl font-black leading-none"
            style={{ fontFamily: 'var(--font-display)', color, letterSpacing: '-0.03em' }}
          >
            {Math.round(percent)}%
          </p>
          <p className="text-xs font-semibold text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            {grade}
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ result }) {
  const chartData = useMemo(() => {
    return Object.entries(result.subjectScores ?? {}).map(([subject, stats]) => ({
      subject,
      scorePercent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
  }, [result.subjectScores]);

  const mins = Math.floor((result.timeSpent ?? 0) / 60);
  const secs = (result.timeSpent ?? 0) % 60;

  const skippedCount = useMemo(() => {
    return result.questions.filter((q) => !result.answers[q.id]).length;
  }, [result.questions, result.answers]);

  const wrongCount = result.totalQuestions - result.totalScore - skippedCount;

  const stats = [
    { label: 'Correct',   value: result.totalScore },
    { label: 'Wrong',     value: wrongCount },
    { label: 'Skipped',   value: skippedCount },
    { label: 'Time Spent', value: `${mins}m ${String(secs).padStart(2, '0')}s` },
  ];

  const scorePercent = result.totalQuestions > 0 ? (result.totalScore / result.totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex justify-center py-4">
        <ScoreRing percent={scorePercent} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 px-4 py-4 rounded-2xl bg-surface border border-border">
            <p
              className="text-xl font-black leading-none text-text-primary"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {s.value}
            </p>
            <p className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <PerformanceChart data={chartData} title="Subject Breakdown" />
      )}
    </div>
  );
}

const REVIEW_FILTERS = ['All', 'Wrong', 'Skipped'];

function ReviewTab({ questions = [], answers = {} }) {
  const { setIsUpgradeModalOpen } = useApp();
  const { isActivated } = useProfile(); // 👈 Pulling global verified premium status from your hook profile
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const userAnswer = answers[q.id];
      const isSkipped = !userAnswer;
      const isCorrect = userAnswer === q.correct_option;

      if (filter === 'Wrong') return !isCorrect && !isSkipped;
      if (filter === 'Skipped') return isSkipped;
      return true;
    });
  }, [questions, answers, filter]);

  const counts = useMemo(() => {
    let wrong = 0;
    let skipped = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) skipped++;
      else if (ans !== q.correct_option) wrong++;
    });
    return { All: questions.length, Wrong: wrong, Skipped: skipped };
  }, [questions, answers]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {REVIEW_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors
                ${active ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-text-secondary'}
              `}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {f}
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-bold font-mono
                  ${active ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-muted'}
                `}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions Review List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-surface border border-border">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-text-secondary" style={{ fontFamily: 'var(--font-body)' }}>
            {filter === 'Wrong' ? 'No wrong answers found!' : 'No skipped questions found!'}
          </p>
        </div>
      ) : (
        filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          const userAnswer = answers[q.id];
          const isSkipped = !userAnswer;
          const isCorrect = userAnswer === q.correct_option;

          let statusBadge = <Badge variant="error">Wrong</Badge>;
          if (isSkipped) statusBadge = <Badge variant="warning">Skipped</Badge>;
          if (isCorrect) statusBadge = <Badge variant="success">Correct</Badge>;

          return (
            <div key={q.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full flex items-start gap-3 px-4 py-4 text-left"
              >
                <span
                  className="shrink-0 text-xs font-bold font-mono px-2 py-1 rounded-lg mt-0.5 bg-surface-2 text-text-muted"
                >
                  Q{questions.indexOf(q) + 1}
                </span>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="text-sm text-text-primary leading-snug line-clamp-2">
                    <QuestionRenderer text={q.question_text} inline />
                  </div>
                  <div>{statusBadge}</div>
                </div>

                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 mt-1 text-text-muted transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border animate-in fade-in duration-200">
                  <div className="pt-3 flex flex-col gap-2.5">
                    {OPTION_MAPPING.map(({ letter, field }) => {
                      const isUserSelection = userAnswer === letter;
                      const isCorrectOption = q.correct_option === letter;
                      const optionText = q[field] ?? '';

                      let buttonVariant = 'option-idle';
                      if (isCorrectOption) {
                        buttonVariant = 'option-correct';
                      } else if (isUserSelection) {
                        buttonVariant = 'option-wrong';
                      }

                      return (
                        <Button
                          key={`${q.id}-rev-${letter}`}
                          variant={buttonVariant}
                          fullWidth
                          disabled
                          className="text-left cursor-default opacity-100"
                        >
                          <div className="flex items-start gap-4 text-left w-full">
                            <span className={`
                              w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border
                              ${buttonVariant === 'option-correct' ? 'bg-green-500 text-white border-green-500' : ''}
                              ${buttonVariant === 'option-wrong' ? 'bg-red-500 text-white border-red-500' : ''}
                              ${buttonVariant === 'option-idle' ? 'bg-surface-2 text-text-secondary border-border' : ''}
                            `} style={{ fontFamily: 'var(--font-mono)' }}>
                              {isCorrectOption ? '✓' : letter}
                            </span>
                            <div className="flex-1 pt-0.5">
                              <QuestionRenderer text={optionText} inline />
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  {q.explanation && (
                    <div className="rounded-2xl px-4 py-3.5 border border-green-500/20 bg-green-500/[0.03] relative overflow-hidden">
                      <p className="text-xs font-bold tracking-widest text-green-500 uppercase mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                        Explanation
                      </p>
                      
                      {isActivated ? ( // 👈 Checking verified profile column status directly here
                        <QuestionRenderer text={q.explanation} className="text-sm text-text-secondary" />
                      ) : (
                        <div className="pt-1 flex flex-col items-center text-center">
                          <p className="text-xs text-text-muted italic mb-3">
                            Detailed solutions and references are locked for free tier users.
                          </p>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="!rounded-xl shadow-sm text-xs font-bold px-4"
                            onClick={() => setIsUpgradeModalOpen?.(true)}
                          >
                            🔒 Upgrade to Unlock
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const TABS = ['Overview', 'Review Corrections'];

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const result = location.state?.result;

  if (!result) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-canvas p-6 text-center">
        <p className="text-sm text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
          No session report data found.
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/')}>
          Return to Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-canvas text-text-primary select-none">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border px-5 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Session Results
        </h1>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Done
        </button>
      </header>

      {/* Tab Switcher Layout */}
      <div className="flex shrink-0 border-b border-border bg-surface">
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-bold relative transition-colors
                ${active ? 'text-primary' : 'text-text-muted'}
              `}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {tab}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Context Box */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {activeTab === 'Overview' ? (
          <OverviewTab result={result} />
        ) : (
          <ReviewTab questions={result.questions} answers={result.answers} />
        )}
      </div>

      {/* Action Control Deck */}
      <div
        className="shrink-0 px-5 py-4 border-t border-border bg-canvas flex gap-3 shadow-lg"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Button variant="secondary" fullWidth onClick={() => navigate('/practice')}>
          Try Another Test
        </Button>
        <Button variant="primary" fullWidth onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}