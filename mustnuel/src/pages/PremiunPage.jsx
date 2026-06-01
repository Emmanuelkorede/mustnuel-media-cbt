// =============================================================================
// src/pages/PremiumPage.jsx
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext'; 
import { FiChevronLeft, FiCheck, FiCopy, FiUploadCloud, FiAlertCircle, FiAward } from 'react-icons/fi';

export default function PremiumPage() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Core App Configuration
  const BANK_ACCOUNT = '9130333471'; 
  const BANK_NAME = 'Palmpay'; 
  const ACCOUNT_NAME = 'Emmanuel Korede Job';
  const PREMIUM_PRICE = '₦5,000';

  useEffect(() => {
    if (!user?.id) return;
    
    async function checkSubmissionStatus() {
      try {
        // If the user context profile already shows they are premium, bypass checking queues
        if (user.is_premium) {
          setIsCheckingStatus(false);
          return;
        }

        const { data, error } = await supabase
          .from('premium_submissions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setExistingSubmission(data);
        }
      } catch (err) {
        console.error('[PremiumPage] Status sync error:', err.message);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkSubmissionStatus();
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage('');
    }
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to write clipboard text:', err);
    }
  };

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage('Please select a payment screenshot to upload.');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Uploading receipt to security vault...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_receipt.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload payload directly into the 'receipts' bucket
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Save record matching database snake_case structure
      const { data: newSubmission, error: dbError } = await supabase
        .from('premium_submissions')
        .insert([
          {
            user_id: user.id,
            receipt_url: publicUrl,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setExistingSubmission(newSubmission);
      setFile(null);
      setStatusMessage('');
    } catch (err) {
      console.error('[PremiumPage] Transfer logic block error:', err.message);
      setStatusMessage('Failed to register receipt. An active verification ticket may already be open.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-y-auto flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Header Bar Navigation */}
      <header className="w-full max-w-md mx-auto px-5 pt-12 pb-4 shrink-0 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-40 cursor-pointer"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          <FiChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Node: Secure Pay
          </span>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="w-full max-w-md mx-auto px-5 flex flex-col gap-6 pb-16">
        
        {/* Title Block */}
        <div>
          <h1 
            className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
          >
            Premium Upgrade
          </h1>
          <p 
            className="text-sm mt-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
          >
            Power up your preparation with infinite access bounds.
          </p>
        </div>

        {/* Premium Value Proposition Card */}
        <section 
          className="rounded-3xl p-6 border transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card), var(--shadow-glow-blue)'
          }}
        >
          <div className="flex justify-between items-center mb-5">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border"
              style={{ backgroundColor: 'var(--color-primary-subtle)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              Lifetime Access
            </span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black font-mono tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                {PREMIUM_PRICE}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                No hidden renewals
              </span>
            </div>
          </div>

          <div className="h-px w-full my-4" style={{ backgroundColor: 'var(--color-border)' }} />

          <ul className="flex flex-col gap-3.5 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 p-0.5 rounded-md text-white bg-blue-500 shrink-0"><FiCheck size={12} /></span>
              <span>Complete preparation coverage for <strong>UI, UNILAG, & OAU</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 p-0.5 rounded-md text-white bg-blue-500 shrink-0"><FiCheck size={12} /></span>
              <span>Dynamic exam simulators with expanded question limit ranges</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 p-0.5 rounded-md text-white bg-blue-500 shrink-0"><FiCheck size={12} /></span>
              <span>Descriptive breakdown explanations inside Study Review mode</span>
            </li>
          </ul>
        </section>

        {/* Dynamic State Management Interface */}
        {isCheckingStatus ? (
          <div 
            className="text-center py-8 text-xs font-mono tracking-wider animate-pulse"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Connecting to system ledger...
          </div>
        ) : user?.is_premium ? (
          /* State 1: User profile has already been set to true by Admin */
          <section 
            className="rounded-3xl p-6 border text-center flex flex-col items-center gap-4 transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-surface)', 
              borderColor: 'var(--color-success)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-green-600 to-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <FiAward size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                Premium Account Activated
              </h3>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                Your membership is fully verified and updated. All constraints on mocks, question pools, and platform mechanics are lifted permanently.
              </p>
            </div>
          </section>
        ) : existingSubmission ? (
          /* State 2: User has uploaded a file but profile isn't active yet */
          <section 
            className="rounded-3xl p-6 border text-center flex flex-col items-center gap-4 transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-surface)', 
              borderColor: 'var(--color-accent)',
              boxShadow: 'var(--shadow-card), var(--shadow-glow-amber)'
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
              <FiAlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-md font-bold tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                Verification In Queue
              </h3>
              <p className="text-xs mt-2 leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                Your receipt screenshot has been safely logged. System administrators are  verifying your transfer now. Access usually switches live within 1 to 12 hours.
              </p>
            </div>
            <div 
              className="text-[10px] font-mono border-t pt-3 w-full" 
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Ticket Unique ID: {existingSubmission.id}
            </div>
          </section>
        ) : (
          /* State 3: Interactive Two-Step Upload Form */
          <>
            {/* Step 1 Account Specifications */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-[11px] font-bold tracking-widest uppercase ml-1"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
              >
                Step 1 — Make Bank Transfer
              </label>

              <div 
                className="rounded-3xl p-5 border flex flex-col gap-4 shadow-sm"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div 
                  className="flex justify-between items-center p-3.5 rounded-2xl border"
                  style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                >
                  <div>
                    <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Account Number</span>
                    <p className="text-xl font-bold font-mono tracking-wide mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{BANK_ACCOUNT}</p>
                  </div>
                  <button
                    onClick={handleCopyAccount}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95 flex items-center gap-1.5"
                    style={{
                      backgroundColor: isCopied ? 'var(--color-primary)' : 'var(--color-canvas)',
                      borderColor: 'var(--color-border)',
                      color: isCopied ? '#ffffff' : 'var(--color-text-primary)'
                    }}
                  >
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs px-1" style={{ fontFamily: 'var(--font-body)' }}>
                  <div>
                    <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>Bank Provider</span>
                    <p className="font-bold mt-0.5 text-md" style={{ color: 'var(--color-text-primary)' }}>{BANK_NAME}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>Beneficiary Name</span>
                    <p className="font-bold mt-0.5 text-md truncate" style={{ color: 'var(--color-text-primary)' }}>{ACCOUNT_NAME}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 File Submission Gate */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-[11px] font-bold tracking-widest uppercase ml-1"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
              >
                Step 2 — Submit Transaction Proof
              </label>

              <form onSubmit={handleSubmitReceipt} className="flex flex-col gap-4">
                <div 
                  className="border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-200 relative flex flex-col items-center justify-center gap-2.5 min-h-[140px] group cursor-pointer"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                  />
                  <FiUploadCloud size={28} style={{ color: 'var(--color-text-muted)' }} className="group-hover:text-[var(--color-primary)] transition-colors duration-200" />
                  <div className="max-w-[260px] truncate">
                    <p className="text-xs font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}>
                      {file ? file.name : 'Upload Screenshot Evidence'}
                    </p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                      {file ? 'Tap folder zone to switch files' : 'Supports standard image formatting'}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full py-4 rounded-2xl text-xs font-bold tracking-wider text-white border-0 uppercase transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-[0.99] shadow-md"
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: file ? 'var(--shadow-glow-blue)' : 'none'
                  }}
                  onMouseEnter={e => (!isUploading && file) && (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
                  onMouseLeave={e => (!isUploading && file) && (e.target.style.backgroundColor = 'var(--color-primary)')}
                >
                  {isUploading ? 'Registering Assets…' : 'Submit for Verification'}
                </button>
              </form>

              {statusMessage && (
                <div 
                  className="p-3.5 rounded-xl border text-center text-xs font-medium leading-normal mt-1"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-error)',
                    backgroundColor: 'rgba(239,68,68,0.05)',
                    borderColor: 'rgba(239,68,68,0.15)'
                  }}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}