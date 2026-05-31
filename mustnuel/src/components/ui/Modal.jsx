
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  
  // Lock underlying viewport scroll when a sheet overlay details tab is visible
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom Sheet Frame */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[28px] overflow-hidden bg-surface border border-border border-b-none max-h-[90dvh]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Structural Grab Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-border" />
            </div>

            {/* Header Toolbar Layout */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
                <h2 
                  className="text-base font-bold text-text-primary"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {title}
                </h2>
                
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface-2 text-text-muted transition-colors hover:text-text-secondary"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6"  y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Content Display Scroll Wrapper */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {children}
            </div>

            {/* Dynamic Apple Home Indicator Bottom Safe-Area Spacing */}
            <div className="h-[env(safe-area-inset-bottom,16px)] shrink-0" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}