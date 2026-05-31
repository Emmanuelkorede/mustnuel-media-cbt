import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import Button from './Button';

export default function UpgradeModal() {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useApp();
  const navigate = useNavigate();

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-sm rounded-3xl p-6 text-center animate-in slide-in-from-bottom duration-200"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <span className="text-4xl block mb-3">🔒</span>
        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
          Premium Feature
        </h3>
        <p className="text-xs leading-relaxed mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          Unlock full access to specialized Study Modes, instant explanations, and our complete database of past questions.
        </p>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              setIsUpgradeModalOpen(false);
              navigate('/premium');
            }}
          >
            Activate Now ⚡️
          </Button>
          
          <button
            onClick={() => setIsUpgradeModalOpen(false)}
            className="text-xs font-semibold py-2"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}