import { FiZap, FiClipboard, FiTrendingUp } from 'react-icons/fi';

export default function MetricsGrid({ streakCount = 0, cbtCount = 0, averageScore = 0 }) {
  const metrics = [
    {
      icon: <FiZap size={18} style={{ color: streakCount > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />,
      value: streakCount,
      label: 'Day streak',
      sub: streakCount > 0 ? 'Keep it up' : 'Start today',
    },
    {
      icon: <FiClipboard size={18} style={{ color: cbtCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />,
      value: cbtCount,
      label: 'CBTs done',
      sub: cbtCount > 0 ? 'Sessions' : 'None yet',
    },
    {
      icon: <FiTrendingUp size={18} style={{ color: averageScore > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }} />,
      value: averageScore > 0 ? `${Math.round(averageScore)}%` : '—',
      label: 'Avg score',
      sub: averageScore > 0 ? 'Overall' : 'No data',
    },
  ];

  return (
    <div className="px-5 flex flex-col gap-3 w-full select-none">
      <p
        className="text-xs font-semibold uppercase"
        style={{
          fontFamily:    'var(--font-body)',
          color:         'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        Your Stats
      </p>

      <div className="flex gap-2.5 w-full">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex-1 flex flex-col justify-between gap-3 p-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] min-w-0"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              {m.icon}
            </div>
            
            <div className="min-w-0">
              <p
                className="text-xl font-black leading-none truncate"
                style={{
                  fontFamily:    'var(--font-display)',
                  color:         'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {m.value}
              </p>
              <p
                className="text-[11px] font-medium mt-1.5 truncate"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
              >
                {m.label}
              </p>
              <p
                className="text-[10px] mt-0.5 truncate"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
              >
                {m.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}