import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import AppLogo from '../components/ui/AppLogo';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[--color-canvas] px-6 select-none">
      
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="transform scale-110">
          <AppLogo size={80} />
        </div>

        <div className="flex flex-col items-center">
          <h1 
            className="text-3xl font-extrabold tracking-tight leading-none text-[--color-text-primary]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            Mustnuel's
          </h1>
          <h1 
            className="text-3xl font-extrabold tracking-tight leading-tight text-[#3b82f6]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            Media
          </h1>
          
          <p 
            className="mt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[--color-text-secondary]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Post-UTME CBT Platform
          </p>
        </div>
      </div>

      <div className="absolute bottom-14 flex gap-1.5">
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse" 
          style={{ backgroundColor: '#3b82f6' }} 
        />
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:0.2s]" 
          style={{ backgroundColor: '#3b82f6' }} 
        />
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:0.4s]" 
          style={{ backgroundColor: '#3b82f6' }} 
        />
      </div>
    </div>
  );
}