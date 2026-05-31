export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: {
      backgroundColor: 'var(--color-surface-2)',
      color:           'var(--color-text-secondary)',
      border:          '1px solid var(--color-border)',
    },
    primary: {
      backgroundColor: 'var(--color-primary-subtle)',
      color:           'var(--color-primary)',
      border:          '1px solid var(--color-primary)',
    },
    success: {
      backgroundColor: 'rgba(34,197,94,0.10)',
      color:           'var(--color-success)',
      border:          '1px solid rgba(34,197,94,0.2)',
    },
    warning: {
      backgroundColor: 'rgba(245,158,11,0.12)',
      color:           'var(--color-accent)',
      border:          '1px solid var(--color-accent)',
    },
    error: {
      backgroundColor: 'rgba(239,68,68,0.10)',
      color:           'var(--color-error)',
      border:          '1px solid rgba(239,68,68,0.2)',
    },
    accent: {
      backgroundColor: 'rgba(245,158,11,0.10)',
      color:           'var(--color-accent)',
      border:          '1px solid rgba(245,158,11,0.2)',
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold tracking-wide select-none ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        ...variants[variant],
      }}
    >
      {children}
    </span>
  );
}