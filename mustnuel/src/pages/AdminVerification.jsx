// =============================================================================
// src/pages/AdminVerification.jsx
// =============================================================================
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HiCheckCircle, HiXCircle, HiClock, HiCollection, HiExternalLink } from 'react-icons/hi';
import AdminHeader from '../components/AdminHeader';
import AppTabs from '../components/navigation/AppTabs';

export default function AdminVerification() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      
      
      let query = supabase
        .from('premium_submissions')
        .select(`
          id,
          receipt_url,
          status,
          submitted_at,
          reviewed_at,
          user_id,
          profiles:user_id (
            display_name,
            email,
            target_school
          )
        `);

      // Modify selector conditions based on current active control tab
      if (activeTab === 'pending') {
        query = query.eq('status', 'pending').order('submitted_at', { ascending: true });
      } else {
        query = query.in('status', ['approved', 'rejected']).order('reviewed_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to load validation queue items:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab]);

  const handleProcessTicket = async (submissionId, studentId, action) => {
    setActionId(submissionId);
    try {
      // Call our newly provisioned secure server-side RPC function
      const { error } = await supabase.rpc('process_premium_activation', {
        p_submission_id: submissionId,
        p_student_id: studentId,
        p_action: action
      });

      if (error) throw error;

      // Re-evaluate current stack elements following successful record commits
      setSubmissions((prev) => prev.filter((item) => item.id !== submissionId));
    } catch (err) {
      console.error('State mutation failed inside transaction pipeline:', err.message);
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col select-none">
      <AdminHeader currentSubTab="verification" />

      {/* FIXED VIEWPORT CONTAINER: Clips bounding dimensions safely above the navigation panel bar */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-4 h-[calc(100vh-65px-64px)] overflow-y-auto pb-12 flex flex-col gap-4 scrollbar-thin">
        
        {/* Toggle Controls Tab Header */}
        <div className="flex border-b border-border shrink-0 bg-surface rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-border/30'
            }`}
          >
            Pending Tickets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-border/30'
            }`}
          >
            Resolution Logs
          </button>
        </div>

        {/* Content Render Conditional States */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-text-muted">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl flex flex-col items-center gap-1">
            <HiCollection size={32} className="text-text-muted opacity-40" />
            <p className="text-xs font-bold text-text-secondary mt-2">
              {activeTab === 'pending' ? 'No incoming receipts to inspect!' : 'No historical logs captured.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:border-border-hover transition-colors"
              >
                {/* Header Information Stack */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-text-primary truncate" style={{ fontFamily: 'var(--font-body)' }}>
                      {ticket.profiles?.display_name || 'Incomplete Account'}
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono truncate">{ticket.profiles?.email}</p>
                    {ticket.profiles?.target_school && (
                      <span className="inline-block text-[10px] bg-canvas text-text-secondary px-2 py-0.5 rounded-md font-medium border border-border mt-1">
                        {ticket.profiles.target_school}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-muted">
                      <HiClock size={12} />
                      {new Date(ticket.submitted_at).toLocaleDateString()}
                    </span>
                    {ticket.status !== 'pending' && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ticket.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {ticket.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Receipt Visual Window */}
                <div className="relative group bg-canvas rounded-xl border border-border overflow-hidden h-48 flex items-center justify-center">
                  <img 
                    src={ticket.receipt_url} 
                    alt="Payment Receipt Screenshot Document" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  <a 
                    href={ticket.receipt_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    <HiExternalLink size={14} />
                  </a>
                </div>

                {/* Workflow Activation Action Panel Strip */}
                {ticket.status === 'pending' && (
                  <div className="flex gap-2 mt-auto pt-1">
                    <button
                      disabled={actionId !== null}
                      onClick={() => handleProcessTicket(ticket.id, ticket.user_id, 'reject')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-canvas border border-border hover:bg-red-500/5 hover:border-red-500/20 text-xs font-bold text-text-secondary transition-all cursor-pointer disabled:opacity-40"
                    >
                      <HiXCircle className="text-red-500 shrink-0" size={16} />
                      <span>{actionId === ticket.id ? 'Writing...' : 'Decline'}</span>
                    </button>

                    <button
                      disabled={actionId !== null}
                      onClick={() => handleProcessTicket(ticket.id, ticket.user_id, 'approve')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-40"
                    >
                      <HiCheckCircle className="shrink-0" size={16} />
                      <span>{actionId === ticket.id ? 'Processing...' : 'Approve Pass'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <AppTabs active="admin" />
    </div>
  );
}