import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiChevronLeft } from 'react-icons/fi';
import AppLogo from '../components/ui/AppLogo';

const SLIDES = [
  {
    id: 'simulation',
    icon: '🎯',
    title: 'Real CBT Simulation',
    body: 'Timed sessions built exactly like the real exam — Post-UTME question formats.',
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Track Your Progress',
    body: 'Subject-level breakdowns, score history, and streak tracking so you always know where you stand.',
  },
  {
    id: 'leaderboard',
    icon: '🏆',
    title: 'Weekly Leaderboards',
    body: 'Compete against students targeting the same school. Filter performance by month or week.',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const isFirst = index === 0;
  const isSecond = index === 1;
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const goNext = () => { if (!isLast) setIndex(index + 1); };
  const goPrev = () => { if (index > 0) setIndex(index - 1); };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Top Header — Clean Alignment */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2 shrink-0">
        <AppLogo size={40} />
        <button
          onClick={() => navigate('/auth')}
          className="text-sm px-4 py-2 rounded-xl border font-medium transition-all duration-200 active:scale-95 cursor-pointer hover:bg-[--color-surface] hover:text-[--color-text-primary]"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          Skip
        </button>
      </div>

      {/* Main Slide Body */}
      <div className="relative flex-1 overflow-hidden flex flex-col items-center justify-center px-8 select-none">
        <div className="text-7xl mb-8 transform hover:scale-105 transition-transform duration-200">
          {slide.icon}
        </div>

        <div className="text-center max-w-xs">
          <h2
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {slide.title}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}
          >
            {slide.body}
          </p>
        </div>
      </div>

      {/* Bottom Interface Elements */}
      <div className="px-5 pb-12 shrink-0 flex flex-col gap-5">
        
        {/* Navigation Dot Indicators */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-250"
              style={{
                width: i === index ? '20px' : '6px',
                backgroundColor: i === index ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        {/* Structured Dynamic Button Layer */}
        <div className="flex flex-col gap-3">
          {isFirst && (
            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:bg-[--color-primary-hover] active:scale-[0.99] cursor-pointer shadow-md"
              style={{
                fontFamily: 'var(--font-display)',
                backgroundColor: 'var(--color-primary)',
              }}
            >
              Next
            </button>
          )}

          {isSecond && (
            <div className="flex flex-col gap-3">
              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:bg-[--color-primary-hover] active:scale-[0.99] cursor-pointer shadow-md"
                style={{
                  fontFamily: 'var(--font-display)',
                  backgroundColor: 'var(--color-primary)',
                }}
              >
                Next
              </button>
              <button
                onClick={goPrev}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[--color-surface-2] active:scale-[0.99] cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <FiChevronLeft size={16} /> Previous
              </button>
            </div>
          )}

          {isLast && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:bg-[--color-primary-hover] active:scale-[0.99] cursor-pointer shadow-md"
                style={{
                  fontFamily: 'var(--font-display)',
                  backgroundColor: 'var(--color-primary)',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border transition-all duration-200 hover:bg-[--color-surface-2] active:scale-[0.99] cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}