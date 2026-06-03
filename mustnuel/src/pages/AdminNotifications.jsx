// =============================================================================
// src/pages/AdminNotifications.jsx
// =============================================================================
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FiBell, FiCheckCircle, FiAlertTriangle, FiTrash2, FiLayers, FiEye, FiInbox } from "react-icons/fi";
import AdminHeader from "../components/AdminHeader";
import AppTabs from "../components/navigation/AppTabs";

export default function AdminNotifications() {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Input form state variables
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  
  // System operational states
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load a quick running log of previously dispatched updates
  async function fetchHistoryLog() {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, is_pinned, created_at, likes_count")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setRecentNotifs(data || []);
    } catch (err) {
      console.error("Failed to compile historical log:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchHistoryLog();
    }
  }, [isAdmin]);

  // Block rendering if Auth is initializing or if a non-admin client gains route entry
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-xs font-mono text-text-muted">
        Validating system authority privileges...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas text-center select-none">
        <FiAlertTriangle size={32} className="text-red-500 mb-2" />
        <h3 className="text-sm font-black text-text-primary uppercase" style={{ fontFamily: 'var(--font-display)' }}>Access Violation</h3>
        <p className="text-xs text-text-muted max-w-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>
          Your account credentials do not hold authorization clearance to access global notification configurations.
        </p>
      </div>
    );
  }

  // Handle row payload creation to public.notifications
  async function handlePublishNotification(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setPublishing(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        is_pinned: isPinned,
        created_by: user?.id || null, // Dynamic fallback assignment
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("notifications")
        .insert([payload]);

      if (error) throw error;

      // Clean out variables upon successful table deployment
      setTitle("");
      setBody("");
      setIsPinned(false);
      setStatus({ type: "success", message: "Global dashboard notification successfully broadcasted!" });
      
      // Update running log stream
      fetchHistoryLog();
    } catch (err) {
      setStatus({ type: "error", message: `Broadcast failed: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  }

  // Handle immediate deletion of old announcements
  async function handleDeleteNotification(id) {
    if (!window.confirm("Are you sure you want to delete this notice permanently?")) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchHistoryLog();
    } catch (err) {
      alert(`Deletion failure: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col select-none">
      <AdminHeader currentSubTab="notifications" />

      {/* MAIN CONTENT VIEWPORT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-4 h-[calc(100vh-65px-64px)] overflow-y-auto pb-24 flex flex-col gap-5 scrollbar-thin">
        
        {/* Module Title Section */}
        <div className="shrink-0">
          <h2 className="text-xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            News Broadcast Hub
          </h2>
          <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            Deploy native notifications, announcements, and critical updates directly to student dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start shrink-0">
          
          {/* DISPATCH INPUT CONTROLS */}
          <section className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
            <form onSubmit={handlePublishNotification} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Post-UTME Registrations Suspended"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-border bg-canvas text-text-primary focus:outline-none focus:border-primary font-medium"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                  Notification Body Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type structural notification copy details here... Line breaks are preserved."
                  required
                  rows={5}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-canvas text-text-primary focus:outline-none focus:border-primary font-medium leading-relaxed scrollbar-thin"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* PRIORITY TOGGLE CRITERIA */}
              <div className="flex items-center justify-between p-3 bg-canvas border border-border/60 rounded-xl">
                <div className="pr-2">
                  <p className="text-xs font-black text-text-primary flex items-center gap-1" style={{ fontFamily: 'var(--font-body)' }}>
                    <span>📌</span> Pin to Top Priority
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                    Keeps this record sticky at the very apex of student feeds.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                />
              </div>

              {/* OPERATIONAL RESPONSIVENESS CAPABILITIES */}
              {status.message && (
                <div className={`p-3 rounded-xl border text-[11px] font-mono flex items-start gap-2 ${
                  status.type === "success" 
                    ? "bg-green-500/5 border-green-500/20 text-green-500" 
                    : "bg-red-500/5 border-red-500/20 text-red-500"
                }`}>
                  {status.type === "success" ? <FiCheckCircle size={14} className="shrink-0 mt-0.5" /> : <FiAlertTriangle size={14} className="shrink-0 mt-0.5" />}
                  <span>{status.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={publishing || !title.trim() || !body.trim()}
                className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-[0.99]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {publishing ? "Transmitting Stream Packets..." : "🚀 Deploy Announcement Live"}
              </button>
            </form>
          </section>

          {/* MOBILE REAL-TIME PREVIEW CARD SCREEN */}
          <section className="flex flex-col gap-2">
            <h3 className="text-[10px] uppercase font-black tracking-wider text-text-muted flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
              <FiEye size={12} className="text-primary" />
              <span>Feed Card Preview (Live View)</span>
            </h3>
            
            <div className="bg-canvas border border-dashed border-border rounded-2xl p-4 min-h-[180px] flex flex-col justify-center items-center">
              {title.trim() || body.trim() ? (
                <div className="bg-surface border border-border rounded-2xl p-4 relative overflow-hidden w-full shadow-sm flex flex-col gap-3">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPinned ? "bg-amber-500" : "bg-primary"}`} />
                  <div className="pl-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h4 className="text-xs font-black text-text-primary tracking-tight leading-snug truncate" style={{ fontFamily: 'var(--font-body)' }}>
                        {isPinned && <span className="text-amber-500 mr-1">📌</span>}
                        {title || "Untitled Announcement Header"}
                      </h4>
                      <span className="text-[9px] font-mono text-text-muted whitespace-nowrap">Just now</span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mb-3 whitespace-pre-wrap font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                      {body || "No contextual body text drafted yet. Type into form controls above to dynamically view alignment formatting."}
                    </p>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[9px] font-mono font-black text-text-muted uppercase">
                      <span className="flex items-center gap-1">
                        <FiBell className={`text-xs ${isPinned ? "text-amber-500" : "text-primary"}`} /> SYSTEM ALERT LOG
                      </span>
                      <span className="border border-border rounded-full px-2 py-0.5 font-sans font-black tracking-wide text-[8px]">❤️ 0 LIKES</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-text-muted font-mono italic">
                  Draft structural information to generate staging mockup displays.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* RECENT OUTBOUND DISPATCH HISTORY MATRIX */}
        <section className="flex flex-col gap-2 shrink-0">
          <h3 className="text-[10px] uppercase font-black tracking-wider text-text-muted flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
            <FiLayers size={12} className="text-primary" />
            <span>Recent Running Dispatches (Last 10 Broadcasts)</span>
          </h3>
          
          {loadingHistory ? (
            <div className="h-20 bg-surface/50 animate-pulse rounded-2xl border border-border" />
          ) : recentNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-surface border border-dashed border-border rounded-2xl text-center">
              <FiInbox size={22} className="text-text-muted mb-1" />
              <p className="text-xs font-mono italic text-text-muted">No historical logs available inside this context.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border/40 overflow-hidden shadow-sm">
              {recentNotifs.map((notif) => (
                <div key={notif.id} className="p-3.5 flex items-start justify-between gap-4 text-xs hover:bg-canvas/40 transition">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-text-primary tracking-tight truncate" style={{ fontFamily: 'var(--font-body)' }}>
                        {notif.title}
                      </h5>
                      {notif.is_pinned && (
                        <span className="bg-amber-500/10 text-amber-500 text-[8px] px-1.5 py-0.5 font-black tracking-wide rounded uppercase font-sans">
                          PINNED
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted font-mono">
                        {new Date(notif.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1 font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                      {notif.body}
                    </p>
                    <p className="text-[9px] text-text-muted font-mono font-black uppercase tracking-wider">
                      👍 Counted {notif.likes_count || 0} user updates likes
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/5 rounded-xl transition shrink-0 cursor-pointer"
                    title="Purge announcement"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AppTabs active="admin" />
    </div>
  );
}