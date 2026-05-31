import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function shortLabel(subject = '') {
  const MAP = {
    'Mathematics':                 'Maths',
    'English Language':            'English',
    'Further Mathematics':         'F. Maths',
    'Christian Religious Studies': 'CRS',
    'Islamic Religious Studies':   'IRS',
    'Agricultural Science':        'Agric',
    'Technical Drawing':           'Tech Draw',
    'Literature in English':       'Lit',
    'Economics':                   'Econs',
    'Accounting':                  'Acctg',
  };
  return MAP[subject] ?? subject;
}

function scoreColor(score) {
  if (score >= 70) return '#22c55e'; // Tailwind green-500
  if (score >= 50) return '#f59e0b'; // Tailwind amber-500
  return '#ef4444'; // Tailwind red-500
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { subject, scorePercent } = payload[0].payload;
  return (
    <div className="bg-surface border border-border px-3 py-2 rounded-xl text-xs text-text-primary shadow-md">
      <p className="font-semibold">{subject}</p>
      <p style={{ color: scoreColor(scorePercent) }} className="font-bold mt-0.5">
        {scorePercent}%
      </p>
    </div>
  );
}

export default function PerformanceChart({ data = [], title }) {
  if (!data.length) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: shortLabel(d.subject),
  }));

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <p className="text-xs font-bold tracking-wider text-text-muted uppercase" style={{ fontFamily: 'var(--font-body)' }}>
          {title}
        </p>
      )}

      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: 'currentColor',
                fontSize: 10,
                fontFamily: 'var(--font-body)',
              }}
              className="text-text-muted"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{
                fill: 'currentColor',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
              className="text-text-muted"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
            <Bar dataKey="scorePercent" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={scoreColor(entry.scorePercent)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend Row */}
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          {[
            { label: '≥ 70%', color: '#22c55e' },
            { label: '50–69%', color: '#f59e0b' },
            { label: '< 50%',  color: '#ef4444' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}