// =============================================================================
// src/components/ui/AppLogo.jsx
// -----------------------------------------------------------------------------
// The application logo mark. Import this anywhere you need the logo.
// The background particles / glows from SplashPage are NOT part of this
// component — those are splash-screen-only effects that live in SplashPage.
//
// Props:
//   size     — number, controls width & height in px (default: 48)
//   className — extra classes for positioning/spacing
// =============================================================================

export default function AppLogo({ size = 48, className = '' }) {
  const s = size;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ExamEdge logo"
    >
      {/* Outer rounded square background */}
      <rect width="48" height="48" rx="14" fill="#1e3a5f" />

      {/* Open book — left page */}
      <path
        d="M10 16 C10 16 18 14 24 16 L24 34 C18 32 10 34 10 34 Z"
        fill="white"
        opacity="0.95"
      />

      {/* Open book — right page */}
      <path
        d="M38 16 C38 16 30 14 24 16 L24 34 C30 32 38 34 38 34 Z"
        fill="white"
        opacity="0.70"
      />

      {/* Spine */}
      <line x1="24" y1="16" x2="24" y2="34" stroke="#3b82f6" strokeWidth="1.5" />

      {/* Lines on left page */}
      <line x1="13" y1="21" x2="21" y2="20.5" stroke="#3b82f6" strokeWidth="1" opacity="0.7" />
      <line x1="13" y1="25" x2="21" y2="24.5" stroke="#3b82f6" strokeWidth="1" opacity="0.7" />
      <line x1="13" y1="29" x2="21" y2="28.5" stroke="#3b82f6" strokeWidth="1" opacity="0.7" />

      {/* Lines on right page */}
      <line x1="35" y1="21" x2="27" y2="20.5" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
      <line x1="35" y1="25" x2="27" y2="24.5" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
      <line x1="35" y1="29" x2="27" y2="28.5" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />

      {/* Accent dot top-right */}
      <circle cx="38" cy="10" r="4" fill="#f59e0b" />
    </svg>
  );
}