import { useState, useEffect } from "react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if the user muted the banner recently
    const lastDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (lastDismissed) {
      const hoursPassed = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) return; 
    }

    // 2. Check if already installed / running inside the PWA standalone wrapper
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone) return;

    // 3. Detect iOS specifically (since Apple doesn't support the beforeinstallprompt event)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);

    if (isAppleMobile) {
      setIsIOS(true);
      setIsVisible(true);
    }

    // 4. Handle Android / Desktop Chrome intercepts
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  function handleDismiss() {
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
    setIsVisible(false);
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsVisible(false);
    } else {
      handleDismiss();
    }
    setDeferredPrompt(null);
  }

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-[99999] rounded-2xl shadow-2xl p-4 border flex flex-col gap-3"
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* App Icon Box */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
          style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)' }}
        >
          🎓
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm tracking-tight">Install Our App</h4>
          <p className="text-xs opacity-70 mt-0.5 leading-normal">
            {isIOS ? (
              <span>
                Tap the share icon <span className="font-bold">⎋</span> in your browser menu, then select <span className="font-bold">"Add to Home Screen"</span>.
              </span>
            ) : (
              "Install our lightning-fast application straight to your device home screen."
            )}
          </p>
        </div>

        {/* Close Button Cross */}
        <button 
          onClick={handleDismiss}
          className="p-1 opacity-40 hover:opacity-100 transition text-sm font-bold"
        >
          ✕
        </button>
      </div>

      {/* Control Buttons Container (Hidden completely on iOS) */}
{!isIOS && (
  <div className="flex items-center justify-end gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
    <button 
      onClick={handleDismiss}
      className="px-3 py-1.5 opacity-60 hover:opacity-100 font-medium"
    >
      Not Now
    </button>
    <button 
      onClick={handleAndroidInstall}
      className="px-4 py-2 rounded-xl font-bold transition active:scale-95 text-white bg-emerald-600 hover:bg-emerald-500"
    >
      Install App
    </button>
  </div>
)}
    </div>
  );
}