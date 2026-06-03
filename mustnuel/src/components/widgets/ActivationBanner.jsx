import { useNavigate } from 'react-router';
import Badge from '../ui/Badge';

export default function ActivationBanner({ isActivated, targetSchool }) {
  const navigate = useNavigate();

  if (isActivated && targetSchool) {
    return (
      <div
        className="mx-5 rounded-3xl p-5 flex flex-col gap-1.5 select-none"
        style={{
          backgroundColor: 'var(--color-surface-2)',
          border:          '1px solid var(--color-border)',
        }}
      >
        <div className="flex flex-col gap-2 items-start w-full">
          <Badge variant="primary">✦ Activated</Badge>

          <div className="w-full mt-1">
            <p
              className="text-3xl font-black leading-tight truncate w-full"
              style={{
                fontFamily:    'var(--font-body)',
                color:         'var(--color-text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              {targetSchool}
            </p>
            <p
              className="text-xs mt-1"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
            >
              Full access · All years · All subjects
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-5 rounded-3xl p-5 flex items-center justify-between gap-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex">
          <Badge variant="warning">⚠ Free plan</Badge>
        </div>
        <p
          className="text-base font-bold mt-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Unlock full access
        </p>
        <p
          className="text-xs leading-normal break-words"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
        >
          Submit your receipt to activate premium.
        </p>
      </div>

      <button
        onClick={() => navigate('/premium')}
        className="shrink-0 px-4 py-3 rounded-xl text-xs font-bold text-white transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-sm"
        style={{ backgroundColor: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
        onMouseEnter={e => e.target.style.opacity = '0.9'}
        onMouseLeave={e => e.target.style.opacity = '1'}
      >
        Activate
      </button>
    </div>
  );
}