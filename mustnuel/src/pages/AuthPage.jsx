// =============================================================================
// src/pages/AuthPage.jsx
// -----------------------------------------------------------------------------
// Sign In / Sign Up. Clean, mobile-first, no clutter.
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo  from '../components/ui/AppLogo';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Google icon
// ---------------------------------------------------------------------------
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Input field
// ---------------------------------------------------------------------------
function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-colors"
        style={{
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function AuthPage({ initialMode = 'signin', onNavigate }) {
  const { signIn, signUp, signInWithGoogle, authError, isLoading } = useAuth();

  const [mode, setMode]         = useState(initialMode);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [localError, setLocalError] = useState('');

  const isSignUp = mode === 'signup';

  const switchMode = (next) => { setMode(next); setLocalError(''); setConfirm(''); };

  const validate = () => {
    if (!email.includes('@'))              return 'Enter a valid email address.';
    if (password.length < 8)               return 'Password must be at least 8 characters.';
    if (isSignUp && password !== confirm)  return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setLocalError(err); return; }
    setLocalError('');

    if (isSignUp) {
      const r = await signUp({ email, password });
      if (r.success) onNavigate?.('setup');
    } else {
      const r = await signIn({ email, password });
      if (r.success) onNavigate?.('home');
    }
  };

  const displayError = localError || authError;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-8 flex flex-col gap-6">
        <button
          onClick={() => onNavigate?.('onboarding')}
          className="flex items-center gap-2 w-fit"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
          >
            {isSignUp ? 'Start your prep journey.' : 'Pick up where you left off.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 flex flex-col gap-4 pb-10">
        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'white',
            color: '#111827',
            borderColor: '#e5e7eb',
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}/>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }}/>
        </div>

        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isSignUp ? 'new-password' : 'current-password'} />

        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {displayError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs px-3 py-2.5 rounded-lg"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)', backgroundColor: 'rgba(239,68,68,0.08)' }}
            >
              {displayError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-display)', backgroundColor: 'var(--color-primary)' }}
        >
          {isLoading
            ? (isSignUp ? 'Creating account…' : 'Signing in…')
            : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>

        {/* Mode switch */}
        <p className="text-center text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
            className="font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {isSignUp ? 'Sign In' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}