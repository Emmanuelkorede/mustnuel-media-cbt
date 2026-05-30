// =============================================================================
// src/pages/SplashPage.jsx
// -----------------------------------------------------------------------------
// App launch screen. Logo centered, app name, subtle fade-in.
// No orbiting rings. No particles. No theatrics.
// Auto-advances to onboarding after 2s.
// =============================================================================

import { useEffect } from 'react';
import { motion }    from 'framer-motion';
import AppLogo       from '../components/ui/AppLogo';

export default function SplashPage({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[--color-canvas]"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <AppLogo size={64} />

        <div className="text-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            Exam<span style={{ color: 'var(--color-primary)' }}>Edge</span>
          </h1>
          <p
            className="mt-1 text-xs uppercase"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', letterSpacing: '0.18em' }}
          >
            CBT Practice Platform
          </p>
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-14 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}