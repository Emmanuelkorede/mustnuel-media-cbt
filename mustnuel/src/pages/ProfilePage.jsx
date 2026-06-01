// =============================================================================
// src/pages/ProfilePage.jsx
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

// Imported UI Elements
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AppTabs from '../components/navigation/AppTabs';

// Static Configuration matching AppContext School signatures
const SCHOOL_METADATA = [
  { id: 'UI', name: 'University of Ibadan', logoUrl: 'ui_logo.png' },
  { id: 'UNILAG', name: 'University of Lagos', logoUrl: 'unilag-logo.png' },
  { id: 'OAU', name: 'Obafemi Awolowo University', logoUrl: 'oau-logo.jpg' },
];

const WHATSAPP_URL = "https://wa.me/2349122865246";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, isActivated, signOut, updateProfile } = useAuth();
  const { selectedSchool, setSelectedSchool, setIsUpgradeModalOpen } = useApp();
  const { isDark, toggleTheme } = useTheme();

  // Dialog / Modal Visibility States
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  // Inline Modal Success Indicators
  const [nameSuccess, setNameSuccess] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  
  // Feedback Data States
  const [fbCategory, setFbCategory] = useState('suggestion');
  const [fbMessage, setFbMessage] = useState('');
  const [fbLoading, setFbLoading] = useState(false);

  // Profile Action Input States
  const [newName, setNewName] = useState(profile?.display_name ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [schoolSaving, setSchoolSaving] = useState(false);

  // Sync state if profile objects change downstream
  useEffect(() => {
    if (profile?.display_name) {
      setNewName(profile.display_name);
    }
  }, [profile]);

  // Derived user details
  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  // Core Mutation Handlers
  async function handleSaveDisplayName() {
    if (!newName.trim() || newName.trim().length < 2) return;
    setNameLoading(true);
    try {
      const result = await updateProfile({ display_name: newName.trim() });
      if (result.success) {
        setNameSuccess(true);
        setTimeout(() => {
          setEditNameOpen(false);
          setNameSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to update display name:", err);
    } finally {
      setNameLoading(false);
    }
  }

  async function handleSwitchSchool(schoolId) {
    if (!isActivated) {
      setIsUpgradeModalOpen(true);
      return;
    }
    if (schoolId === selectedSchool) return;
    
    setSchoolSaving(true);
    try {
      setSelectedSchool(schoolId);
      await updateProfile({ target_school: schoolId });
    } catch (err) {
      console.error("Failed to update target school:", err);
    } finally {
      setSchoolSaving(false);
    }
  }

  async function handleAnalyticsNavigation() {
    if (!isActivated) {
      setIsUpgradeModalOpen(true);
    } else {
      navigate('/analytics');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  }

  async function handleSubmitFeedback() {
    if (!fbMessage.trim()) return;
    setFbLoading(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: user.id,
          category: fbCategory.toLowerCase(),
          body: fbMessage.trim()
        });

      if (error) throw error;
      
      setFeedbackSuccess(true);
      setFbMessage('');
      
      setTimeout(() => {
        setFeedbackOpen(false);
        setFeedbackSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setFbLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-text-primary pb-32 transition-colors duration-200">
      
      {/* ── Section 1: Hero Cover Header ── */}
      <div className="bg-gradient-to-br from-surface to-surface-2 pt-12 px-6 pb-8 flex flex-col items-center text-center relative border-b border-border">
        
        {/* Profile Avatar Badge with Inline Trigger */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white relative shadow-md mb-3 bg-gradient-to-tr from-primary to-primary-hover">
          {initials}
          <button 
            onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary border-2 border-surface flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            aria-label="Edit Name"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        <h1 className="text-xl font-bold font-display leading-tight mb-1">{profile?.display_name ?? "Student"}</h1>
        <p className="text-xs text-text-muted mb-4">{user?.email}</p>

        {/* Dynamic Status Row Tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isActivated ? (
            <Badge variant="accent">✨ Premium Member</Badge>
          ) : (
            <Badge variant="default">Free Plan</Badge>
          )}
          {selectedSchool && (
            <Badge variant="primary">{selectedSchool} Aspirant</Badge>
          )}
        </div>
      </div>

      {/* Main Structural Settings Dashboard List Container */}
      <div className="max-w-2xl mx-auto px-4 mt-5 flex flex-col gap-6">

        {/* ── Section 2: Premium Conversion Promotional Banner ── */}
        {!isActivated && (
          <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-4 flex items-center gap-4 shadow-sm text-white">
            <span className="text-3xl">🔐</span>
            <div className="flex-1">
              <p className="font-bold font-display text-sm">Upgrade Account Access</p>
              <p className="text-xs opacity-80 leading-normal">Unlock study mode filters, full score analysis & solutions.</p>
            </div>
            <button 
              onClick={() => navigate('/premium')} 
              className="bg-white text-primary rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap active:scale-95 transition-all"
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted p-4 pb-2 border-b border-border/40">Target School</p>
  
  {SCHOOL_METADATA.map((school) => {
    const isCurrent = selectedSchool === school.id;
    return (
      <div
        key={school.id}
        className={`flex items-center gap-3 p-4 border-b border-border/30 last:border-b-0 cursor-pointer transition-colors active:bg-surface-2 ${isCurrent ? "bg-primary-subtle/20" : ""}`}
        onClick={() => handleSwitchSchool(school.id)}
        role="radio"
        aria-checked={isCurrent}
      >
        {/* Replaced emoji with image container and placeholder URL support */}
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-2 flex items-center justify-center border border-border/40">
          <img 
            src={school.logoUrl} 
            alt={`${school.id} Logo`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if the image URL fails to load
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold leading-tight mb-0.5">{school.name}</p>
          {/* Removed dynamic custom background/color styles, standardized to clean badges */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-surface-2 text-text-secondary border border-border/40">
            {school.id}
          </span>
        </div>
        {schoolSaving && isCurrent ? (
          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        ) : (
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCurrent ? "border-primary bg-primary" : "border-border"}`}>
            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        )}
      </div>
    );
  })}
</div>

        {/* ── Section 4: Display Settings Preferences Block ── */}
        <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted p-4 pb-2 border-b border-border/40">Preferences</p>

          {/* Theme Dynamic Controller Row */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">
              {isDark ? "🌙" : "☀️"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Dark Interface Mode</p>
              <p className="text-xs text-text-muted">{isDark ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="flex items-center cursor-pointer" onClick={toggleTheme} role="switch" aria-checked={isDark}>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isDark ? "bg-primary" : "bg-border"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 5: Secure Account Management Block ── */}
        <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted p-4 pb-2 border-b border-border/40">Account Settings</p>

          <div className="flex items-center gap-3 p-4 border-b border-border/30 cursor-pointer active:bg-surface-2" onClick={handleAnalyticsNavigation}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-primary-subtle text-primary">📊</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Performance Analytics</p>
              <p className="text-xs text-text-muted">Track history logs, score ratios & limits</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-border/30 cursor-pointer active:bg-surface-2" onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">✏️</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Display Name</p>
              <p className="text-xs text-text-muted">{profile?.display_name ?? "Not configured"}</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">✉️</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Email Identity</p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 cursor-pointer active:bg-surface-2" onClick={() => setLogoutOpen(true)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-red-500/10 text-error">🚪</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-error leading-tight mb-0.5">Sign Out</p>
              <p className="text-xs text-text-muted">Terminate your current secure session</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        {/* ── Section 6: About Platform & Customer Support Block ── */}
        <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted p-4 pb-2 border-b border-border/40">About & Support</p>
          
          <div className="flex items-center gap-3 p-4 border-b border-border/30 cursor-pointer active:bg-surface-2" onClick={() => navigate('/notifications')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">📢</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Official Updates Board</p>
              <p className="text-xs text-text-muted">Platform news & target institutional timelines</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-border/30 cursor-pointer active:bg-surface-2" onClick={() => setFeedbackOpen(true)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">✍️</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Send Feedback</p>
              <p className="text-xs text-text-muted">Report platform bugs or request custom features</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-border/30 cursor-pointer active:bg-surface-2" onClick={() => setAboutOpen(true)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-surface-2">💡</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">About Platform</p>
              <p className="text-xs text-text-muted">Post-UTME CBT Testing engine systems summary</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 cursor-pointer active:bg-surface-2 no-underline text-inherit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-green-500/10 text-success">💬</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5">Get in Touch</p>
              <p className="text-xs text-text-muted">Chat directly with product help desk via WhatsApp</p>
            </div>
            <svg className="text-text-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>

        {/* Footer Blueprint Summary */}
        <div className="text-center text-xs text-text-muted pt-2 pb-4 flex flex-col items-center gap-1">
          <span className="font-bold tracking-wide text-sm font-display text-text-primary">
            Mutnuel <span className="text-primary">Media</span>
          </span>
          <span>v1.0.0 · Tailored for Nigerian Aspirants 🎓</span>
        </div>
      </div>

      {/* ── Sub-Component Control Modals (Strict Identical Layout Sizing specs) ── */}
      
      {/* Name Editor Overlay Sheet */}
      <Modal isOpen={editNameOpen} onClose={() => setEditNameOpen(false)} title="Change Display Name">
        <div className="flex flex-col gap-4 pt-1 pb-32 h-[380px] justify-between">
          {nameSuccess ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-8 m-auto animate-fade-in">
              <div className="text-3xl">🎉</div>
              <p className="text-sm font-bold text-success">Display Name Updated!</p>
              <p className="text-xs text-text-muted">Syncing cloud identity profile catalogs...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-text-secondary leading-relaxed">This name will represent your score history rankings across platform leaderboards.</p>
                <input
                  className="w-full bg-surface-2 border border-border rounded-xl p-3 text-sm text-text-primary outline-none focus:border-primary transition-all"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter display name"
                  maxLength={30}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveDisplayName()}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 mt-auto">
                <Button variant="ghost" size="sm" onClick={() => setEditNameOpen(false)}>Cancel</Button>
                <Button size="md" loading={nameLoading} onClick={handleSaveDisplayName}>Save Changes</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Feedback Delivery Form Overlay */}
      <Modal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Submit Feedback Form">
        <div className="flex flex-col gap-4 pt-1 pb-32 h-[380px] justify-between">
          {feedbackSuccess ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-8 m-auto animate-fade-in">
              <div className="text-3xl">🚀</div>
              <p className="text-sm font-bold text-success">Feedback Sent Successfully!</p>
              <p className="text-xs text-text-muted">Thank you for improving Mutnuel Media systems.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value)}
                    className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug</option>
                    <option value="question">Question</option>
                  </select>
                </div>

                <div>
                  <textarea
                    className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary min-h-[95px] resize-none"
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Provide exact error logs or explicit feedback recommendations here..."
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-auto">
                <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
                <Button size="md" loading={fbLoading} onClick={handleSubmitFeedback}>Send Feedback</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Logout Security Confirmation Sheet Overlay */}
      <Modal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} title="Confirm Session Sign-Out">
        <div className="flex flex-col gap-5 pt-1">
          <p className="text-xs text-text-secondary leading-relaxed">Are you absolutely sure you want to exit your profile? Your active configuration preferences remain secured inside cloud databases.</p>
          <div className="flex gap-3">
            <Button variant="ghost" size="md" fullWidth onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="danger" size="md" fullWidth onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </Modal>

      {/* Core Platform Specification Informational PopUp */}
      <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="About Mutnuel Media">
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="text-4xl">🎯</div>
          <p className="text-sm font-bold text-text-primary">Computer Based Testing Module</p>
          <p className="text-xs text-text-secondary leading-relaxed max-w-[340px]">
            Delivering automated evaluation blueprints modeled directly upon authentic historical structures utilized by UI, UNILAG, and OAU. Built to assist candidates with rigorous time metrics and detailed solution tracking.
          </p>
          <Button fullWidth onClick={() => setAboutOpen(false)}>Acknowledge</Button>
        </div>
      </Modal>

      {/* Main System Core Tab Navigation layout layer */}
      <AppTabs active="profile" onChange={(t) => navigate(t === 'profile' ? '/profile' : `/${t}`)} />

    </div>
  );
}