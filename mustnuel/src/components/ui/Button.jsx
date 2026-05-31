// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
// size:    'sm' | 'md' | 'lg'

export default function Button({
  children,
  onClick,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  fullWidth = false,
  type     = 'button',
  className = '',
}) {
  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-2xl border
    transition-all duration-200 active:scale-[0.98] cursor-pointer
    disabled:opacity-40 disabled:pointer-events-none select-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizes = {
    sm: 'px-4 py-2.5 text-xs',
    md: 'px-5 py-3.5 text-sm',
    lg: 'px-6 py-4   text-sm',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color:           '#ffffff',
      borderColor:     'transparent',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color:           'var(--color-text-primary)',
      borderColor:     'var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color:           'var(--color-text-secondary)',
      borderColor:     'transparent',
    },
    danger: {
      backgroundColor: 'rgba(239,68,68,0.12)',
      color:           'var(--color-error)',
      borderColor:     'rgba(239,68,68,0.2)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        ...variants[variant],
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = '1')}
    >
      {loading && (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      {children}
    </button>
  );
}