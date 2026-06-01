// =============================================================================
// src/pages/AdminDashboard.jsx
// =============================================================================
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FiUsers, FiAward, FiDatabase, FiMessageSquare, FiCheckCircle, FiClock } from 'react-icons/fi';
import AdminHeader from '../components/AdminHeader';
import AppTabs from '../components/navigation/AppTabs';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    premiumStudents: 0,
    totalQuestions: 0
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Call your secure RPC function to get all student rows safely bypassing RLS
        const { data: studentsList, error: rpcError } = await supabase
          .rpc('get_all_students_for_admin');

        if (rpcError) throw rpcError;

        // Calculate student metrics locally from the secure payload
        const totalStudents = studentsList ? studentsList.length : 0;
        const premiumStudents = studentsList ? studentsList.filter(s => s.is_premium).length : 0;

        // 2. Fetch questions count and active feedback queue concurrently
        // FIXED: Removed 'subject' field and added 'category' matching your schema
        const [questionsRes, feedbackRes] = await Promise.all([
          supabase.from('questions').select('id', { count: 'exact', head: true }),
          supabase.from('feedbacks')
            .select(`
              id,
              category,
              body,
              status,
              created_at,
              profiles:user_id (
                display_name,
                email
              )
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        if (questionsRes.error) throw questionsRes.error;
        if (feedbackRes.error) throw feedbackRes.error;

        setStats({
          totalStudents,
          premiumStudents,
          totalQuestions: questionsRes.count || 0
        });

        if (feedbackRes.data) {
          setFeedbacks(feedbackRes.data);
        }
      } catch (err) {
        console.error('Dashboard tracking data compilation failed:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleResolveFeedback = async (id) => {
    setActionLoadingId(id);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ status: 'resolved' }) // Removed updated_at completely
        .eq('id', id);

      if (error) throw error;
      
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to resolve feedback ticket:', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };
  return (
    <div className="min-h-screen bg-canvas flex flex-col select-none">
      <AdminHeader currentSubTab="dashboard" />

      {/* FIXED VISUAL VIEWPORT BOUNDARY BOX:
          - h-[calc(100vh-65px-64px)]: Subtracts both the top AdminHeader and bottom AppTabs heights perfectly.
          - overflow-y-auto: Forces the cards to scroll within this window, keeping them above the navigation bar.
          - pb-10: Extra bottom internal whitespace padding so cards sit clear of the bar.
      */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-2 h-[calc(100vh-65px-64px)] overflow-y-auto pb-10 flex flex-col gap-6 scrollbar-thin">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            System Metrics Overview
          </h2>
          <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            Real-time server infrastructure variables and pending triage items.
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-text-muted">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>
                    Total Enrolled
                  </span>
                  <span className="text-3xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                    {stats.totalStudents.toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <FiUsers size={22} />
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>
                    Premium Passes
                  </span>
                  <span className="text-3xl font-black text-primary tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                    {stats.premiumStudents.toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FiAward size={22} />
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>
                    CBT Question Bank
                  </span>
                  <span className="text-3xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                    {stats.totalQuestions.toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <FiDatabase size={22} />
                </div>
              </div>
            </div>

            {/* Support Feedbacks Queue */}
            <div className="flex flex-col gap-3 bg-surface border border-border rounded-2xl p-5 shadow-sm mb-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <FiMessageSquare className="text-text-secondary" size={16} />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Active Support Queue ({feedbacks.length})
                </h3>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-1">
                  <span className="text-xl">✨</span>
                  <p className="text-xs font-bold text-text-secondary" style={{ fontFamily: 'var(--font-body)' }}>
                    Support queue completely cleared!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-1">
                  {feedbacks.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-canvas/30"
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary truncate max-w-[160px]" style={{ fontFamily: 'var(--font-body)' }}>
                            {item.profiles?.display_name || item.profiles?.email?.split('@')[0] || 'Anonymous Student'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted font-mono">
                            <FiClock size={10} />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-wider text-primary text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
                          Type: {item.category}
                        </p>
                        <p className="text-[11px] text-text-secondary leading-relaxed break-words mt-0.5">
                          {item.body}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleResolveFeedback(item.id)}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-border/30 border border-border text-[11px] font-bold text-text-secondary transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <FiCheckCircle className="text-green-500 shrink-0" size={13} />
                          <span>{actionLoadingId === item.id ? 'Updating...' : 'Mark Resolved'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AppTabs active="admin" />
    </div>
  );
}