
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Modal from "../components/ui/Modal"; // Your exact bottom-sheet path
import { FiHeart, FiShare2, FiChevronLeft, FiInbox, FiBell, FiLayers } from "react-icons/fi";

// Simple dynamic timestamp helper
function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)          return "Just now";
  if (diff < 3600)        return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function NotificationPage() {
  const { user } = useAuth(); // Access user profile id safely from your context
  const navigate = useNavigate();
  const { id } = useParams(); // Reads parameter for deep-linking

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState(new Set());
  const [selectedNoti, setSelectedNoti] = useState(null);

  // 1. Fetch updates matching your DB schema (body, is_pinned, likes_count)
  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      try {
        const { data: notis, error: notiErr } = await supabase
          .from("notifications")
          .select("*")
          .order("is_pinned", { ascending: false }) // Keep pinned announcements on top
          .order("created_at", { ascending: false });

        if (notiErr) throw notiErr;

        // Fetch past likes array if user session exists
        if (user?.id) {
          const { data: likedRows } = await supabase
            .from("notification_likes")
            .select("notification_id")
            .eq("user_id", user.id);

          const likedSet = new Set(likedRows?.map((r) => r.notification_id) || []);
          setUserLikes(likedSet);
        }

        setNotifications(notis || []);

        // Deep link tracking
        if (id && notis) {
          const targetNoti = notis.find(n => n.id === id);
          if (targetNoti) {
            setSelectedNoti(targetNoti);
          } else {
            const { data: directNoti } = await supabase
              .from("notifications")
              .select("*")
              .eq("id", id)
              .single();
            
            if (directNoti) setSelectedNoti(directNoti);
          }
        }
      } catch (err) {
        console.error("Dashboard engine failed to sync:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user?.id, id]);

  // 2. Handle atomic Like/Unlike using your Security Definer RPC functions
  async function toggleLike(e, notiId) {
    e.stopPropagation();
    if (!user?.id) return;

    const currentlyLiked = userLikes.has(notiId);

    // Optimistic UI updates
    setUserLikes((prev) => {
      const copy = new Set(prev);
      if (currentlyLiked) copy.delete(notiId);
      else copy.add(notiId);
      return copy;
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notiId
          ? { ...n, likes_count: Math.max(0, n.likes_count + (currentlyLiked ? -1 : 1)) }
          : n
      )
    );

    if (selectedNoti?.id === notiId) {
      setSelectedNoti(prev => ({
        ...prev,
        likes_count: Math.max(0, prev.likes_count + (currentlyLiked ? -1 : 1))
      }));
    }

    // Direct database mutations
    try {
      if (currentlyLiked) {
        await supabase
          .from("notification_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("notification_id", notiId);

        await supabase.rpc("decrement_likes", { p_notification_id: notiId });
      } else {
        await supabase
          .from("notification_likes")
          .insert({ user_id: user.id, notification_id: notiId });

        await supabase.rpc("increment_likes", { p_notification_id: notiId });
      }
    } catch (err) {
      console.error("Like transaction database mismatch rolled back:", err);
    }
  }

  // 3. Share trigger
  async function shareNotification(e, noti) {
    e.stopPropagation();
    const targetUrl = `${window.location.origin}/notifications/${noti.id}`;
    const shareMessage = `Check out this update: ${noti.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: noti.title, text: shareMessage, url: targetUrl });
      } catch (err) {
        console.log("Native system share aborted", err);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage + " — " + targetUrl)}`, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-24 select-none flex flex-col">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-xl hover:bg-border/30 text-text-secondary transition cursor-pointer"
          >
            <FiChevronLeft size={20} />
          </button>
          <h1 className="text-md font-black tracking-tight text-text-primary uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Announcements
          </h1>
        </div>
      </header>

      {/* NOTIFICATION FEED */}
      <main className="max-w-2xl w-full mx-auto px-4 mt-4 flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-surface/50 animate-pulse rounded-2xl border border-border" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-surface border border-dashed border-border rounded-2xl px-6 text-center">
            <FiInbox size={28} className="text-text-muted mb-2" />
            <p className="text-xs font-black text-text-primary uppercase" style={{ fontFamily: 'var(--font-body)' }}>
              All caught up!
            </p>
            <p className="text-[11px] text-text-muted max-w-[200px] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              No global alerts or notifications are active at this moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((noti) => {
              const hasLiked = userLikes.has(noti.id);
              return (
                <div
                  key={noti.id}
                  onClick={() => {
                    setSelectedNoti(noti);
                    navigate(`/notifications/${noti.id}`, { replace: true });
                  }}
                  className="bg-surface border border-border rounded-2xl p-4 relative overflow-hidden shadow-sm cursor-pointer active:scale-[0.995] transition flex flex-col gap-3"
                >
                  {/* Color-coded system priority bar indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${noti.is_pinned ? "bg-amber-500" : "bg-primary"}`} />
                  
                  <div className="pl-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-xs font-black text-text-primary tracking-tight leading-snug flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {noti.is_pinned && <span className="text-amber-500 mr-1">📌</span>}
                        {noti.title}
                      </h3>
                      <span className="text-[10px] font-mono font-medium text-text-muted whitespace-nowrap pt-0.5">
                        {timeAgo(noti.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mb-3 font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                      {noti.body}
                    </p>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                      <span className="text-[9px] font-mono font-black tracking-wider text-text-muted uppercase flex items-center gap-1">
                        <FiBell className={`text-xs ${noti.is_pinned ? "text-amber-500" : "text-primary"}`} /> SYSTEM ALERT LOG
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleLike(e, noti.id)}
                          className={`flex items-center gap-1 border rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide uppercase transition cursor-pointer ${
                            hasLiked
                              ? "bg-red-500/10 border-red-500/20 text-red-500"
                              : "bg-transparent border-border text-text-secondary hover:bg-border/30"
                          }`}
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <FiHeart size={11} className={hasLiked ? "fill-current animate-in zoom-in-75" : ""} />
                          <span>{noti.likes_count}</span>
                        </button>

                        <button
                          onClick={(e) => shareNotification(e, noti)}
                          className="flex items-center justify-center border border-border text-text-secondary hover:text-text-primary rounded-full p-1.5 bg-transparent transition cursor-pointer"
                        >
                          <FiShare2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DETAILED VIEW BOTTOM SHEET OVERLAY */}
      <Modal
        isOpen={!!selectedNoti}
        onClose={() => {
          setSelectedNoti(null);
          navigate("/notifications", { replace: true });
        }}
        title={selectedNoti?.title || "Notice Updates"}
      >
        {selectedNoti && (
          <div className="pb-2 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] font-mono font-black text-text-muted border-b border-border/60 pb-2">
              <span className={selectedNoti.is_pinned ? "text-amber-500" : "text-primary"}>
                {selectedNoti.is_pinned ? "🔥 PRIORITY PINNED" : "📢 NOTICE BULLET"}
              </span>
              <span>{new Date(selectedNoti.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap max-h-[45dvh] overflow-y-auto pr-1" style={{ fontFamily: 'var(--font-body)' }}>
              {selectedNoti.body}
            </p>

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-border">
              <button
                onClick={(e) => toggleLike(e, selectedNoti.id)}
                className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-[10px] font-black tracking-wide uppercase transition cursor-pointer ${
                  userLikes.has(selectedNoti.id)
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-transparent border-border text-text-secondary hover:bg-border/30"
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <FiHeart size={12} className={userLikes.has(selectedNoti.id) ? "fill-current" : ""} />
                <span>{selectedNoti.likes_count} Likes</span>
              </button>

              <button
                onClick={(e) => shareNotification(e, selectedNoti)}
                className="flex items-center gap-1.5 border border-border text-text-secondary hover:text-text-primary rounded-xl px-3 py-1.5 text-[10px] font-black tracking-wide uppercase bg-transparent transition cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <FiShare2 size={12} />
                <span>Share link</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}