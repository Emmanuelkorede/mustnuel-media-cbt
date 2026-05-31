
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) {
  
  // Base structural tailwind classes
  const base = `
    inline-flex items-center justify-center gap-3
    font-semibold rounded-2xl border select-none
    transition-all duration-200 active:scale-[0.98] cursor-pointer
    disabled:opacity-40 disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
  `;

  // Size variations
  const sizes = {
    sm: 'px-4 py-2.5 text-xs',
    md: 'px-5 py-3.5 text-sm',
    lg: 'px-6 py-4 text-sm',
  };

  // Modern design tokens mapping standard variants and specific CBT option button states
  const variants = {
    // ── Standard App Buttons ──
    primary: 'bg-primary text-white border-transparent hover:opacity-90',
    secondary: 'bg-surface text-text-primary border-border hover:bg-surface-2',
    ghost: 'bg-transparent text-text-secondary border-transparent hover:bg-surface-2',
    danger: 'bg-red-500/10 text-error border-red-500/20 hover:bg-red-500/20',

    // ── CBT Multiple Choice Option Buttons ──
    'option-idle': 'bg-surface text-text-primary border-border hover:border-primary/50 text-left justify-start',
    'option-selected': 'bg-primary/10 text-text-primary border-primary text-left justify-start',
    'option-correct': 'bg-green-500/10 text-text-primary border-green-500/40 text-left justify-start',
    'option-wrong': 'bg-red-500/10 text-text-primary border-red-500/40 text-left justify-start',
    'option-revealed': 'bg-green-500/5 text-text-primary border-green-500/25 text-left justify-start',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}