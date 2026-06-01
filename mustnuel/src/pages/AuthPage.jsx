// =============================================================================
// src/pages/AuthPage.jsx
// =============================================================================
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

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
        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all duration-200"
        style={{
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
      />
    </div>
  );
}

export default function AuthPage({ initialMode = 'signin' }) {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, authError, isLoading: isGlobalLoading } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  
  // FIX: Dedicated local state to manage the lifecycle of form submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'signup';

  const switchMode = (next) => { 
    setMode(next); 
    setLocalError(''); 
    setConfirm(''); 
  };

  const validate = () => {
    if (!email.includes('@')) return 'Enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (isSignUp && password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setIsSubmitting(true); // Start loading state locally

    try {
      if (isSignUp) {
        const r = await signUp({ email, password });
        if (r.success) {
          navigate('/setup');
          return;
        }
      } else {
        const r = await signIn({ email, password });
        if (r.success) {
          navigate('/home');
          return;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Turn off loading state if submission fails or errors out
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;
  const isInteractionDisabled = isGlobalLoading || isSubmitting;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-8 flex flex-col gap-6 shrink-0">
        <button
          onClick={() => navigate('/onboarding')}
          disabled={isInteractionDisabled}
          className="flex items-center gap-1.5 w-fit text-sm font-medium transition-transform duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          <FiChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
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
      <div className="px-5 flex flex-col gap-4 pb-12">
        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          disabled={isInteractionDisabled}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-sm hover:bg-slate-50"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'white',
            color: '#111827',
            borderColor: '#e5e7eb',
          }}
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isSignUp ? 'new-password' : 'current-password'} />

        {isSignUp && (
          <Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        )}

        {/* Error */}
        {displayError && (
          <p
            className="text-xs px-3 py-3 rounded-xl font-medium border border-red-500/10"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)', backgroundColor: 'rgba(239,68,68,0.08)' }}
          >
            {displayError}
          </p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isInteractionDisabled}
          className="w-full py-4 mt-2 rounded-2xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center"
          style={{ fontFamily: 'var(--font-display)', backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={e => !isInteractionDisabled && (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
          onMouseLeave={e => !isInteractionDisabled && (e.target.style.backgroundColor = 'var(--color-primary)')}
        >
          {isSubmitting
            ? (isSignUp ? 'Creating account…' : 'Signing in…')
            : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>

        {/* Mode switch */}
        <p className="text-center text-sm mt-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
            disabled={isInteractionDisabled}
            className="font-bold transition-colors cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--color-primary)' }}
          >
            {isSignUp ? 'Sign In' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}