

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// Constants — subject pools per track
// These drive the subject selector in PracticeHubPage and SetupPage.
// ---------------------------------------------------------------------------
export const SCHOOLS = ['UI', 'UNILAG', 'OAU'];

export const TRACKS = {
  Science:    'Science',
  Arts:       'Arts',
  Commercial: 'Commercial',
};

// Default subjects for each academic track.
// Students can freely access any subject regardless of their track —
// these just control which subjects are pre-highlighted in the UI.
export const SUBJECTS_BY_TRACK = {
  Science: [
    'Mathematics',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology',
  ],
  Arts: [
    'Mathematics',
    'English Language',
    'Literature in English',
    'Government',
    'Christian Religious Studies',
  ],
  Commercial: [
    'Mathematics',
    'English Language',
    'Economics',
    'Accounting',
    'Commerce',
  ],
};

// Full subject catalogue (union of all tracks + additional papers)
export const ALL_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Accounting',
  'Commerce',
  'Government',
  'Literature in English',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Geography',
  'Agricultural Science',
  'Further Mathematics',
  'Technical Drawing',
  'Yoruba',
  'Igbo',
  'Hausa',
];

// Exam years available in the question bank (descending)
export const AVAILABLE_YEARS = Array.from(
  { length: 2024 - 2000 + 1 },
  (_, i) => 2024 - i
);

// Practice modes
export const PRACTICE_MODES = {
  STUDY:  'study',   // Answers revealed after each question
  EXAM:   'exam',    // Timed, answers hidden until submission
};

// Default timer options (in minutes)
export const TIMER_OPTIONS = [30, 45, 60, 90, 120];

// ---------------------------------------------------------------------------
// Context creation
// ---------------------------------------------------------------------------
const AppContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------
export function AppProvider({ children }) {
  const { profile } = useAuth();

  // =========================================================================
  // 1. THEME STATE
  // =========================================================================

  // Initialise from localStorage, fall back to OS preference
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('cbt_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sync the theme class on the <html> element whenever theme changes.
  // Tailwind's darkMode: 'class' strategy reads this.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cbt_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // =========================================================================
  // 2. SCHOOL & SUBJECT SELECTION
  // =========================================================================

  // The school the user has chosen to practice for.
  // Seeded from their profile (set during onboarding) but can be changed.
  const [selectedSchool, setSelectedSchool] = useState(
    profile?.target_school ?? null
  );

  // Sync selectedSchool if the profile loads/changes after mount
  useEffect(() => {
    if (profile?.target_school && !selectedSchool) {
      setSelectedSchool(profile.target_school);
    }
  }, [profile?.target_school, selectedSchool]);

  // =========================================================================
  // 3. PRACTICE HUB CONFIGURATION
  // This state is built up in PracticeHubPage and consumed by CBTSessionPage.
  // =========================================================================

  const DEFAULT_PRACTICE_CONFIG = {
    mode:            PRACTICE_MODES.EXAM,   // 'study' | 'exam'
    school:          null,                  // Overrides selectedSchool if set
    year:            null,                  // null = use random mock pool
    subjects:        [],                    // Array of subject strings
    timerMinutes:    60,                    // Session duration
    isMock:          false,                 // True when year is null (randomised)
  };

  const [practiceConfig, setPracticeConfig] = useState(DEFAULT_PRACTICE_CONFIG);

  // Partial update helper — merges a partial config object in safely
  const updatePracticeConfig = useCallback((partial) => {
    setPracticeConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  // Reset config back to defaults (called after a session ends)
  const resetPracticeConfig = useCallback(() => {
    setPracticeConfig(DEFAULT_PRACTICE_CONFIG);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // 4. ACTIVE CBT SESSION STATE
  // Holds the live question set and answer map during an exam.
  // =========================================================================

  const [activeQuestions, setActiveQuestions] = useState([]);   // Array of question objects
  const [userAnswers, setUserAnswers]           = useState({});  // { [questionId]: selectedOption }
  const [sessionActive, setSessionActive]       = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Record the user's answer for a specific question
  const recordAnswer = useCallback((questionId, selectedOption) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  }, []);

  // Start a new session with a loaded question set
  const startSession = useCallback((questions) => {
    setActiveQuestions(questions);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setSessionActive(true);
  }, []);

  // Clear all session state (called on submit or exit)
  const endSession = useCallback(() => {
    setActiveQuestions([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setSessionActive(false);
  }, []);

  // =========================================================================
  // 5. GLOBAL UI STATE
  // =========================================================================

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'practice' | 'analytics' | 'profile'

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  // =========================================================================
  // 6. DERIVED VALUES
  // Computed properties that depend on the state above.
  // Using useMemo to avoid re-computation on unrelated renders.
  // =========================================================================

  const recommendedSubjects = useMemo(() => {
    const track = profile?.track ?? 'Science';
    return SUBJECTS_BY_TRACK[track] ?? SUBJECTS_BY_TRACK.Science;
  }, [profile?.track]);

  // How many questions the user has answered in the current session
  const answeredCount = useMemo(
    () => Object.keys(userAnswers).length,
    [userAnswers]
  );

  // How many questions remain unanswered
  const unansweredCount = useMemo(
    () => activeQuestions.length - answeredCount,
    [activeQuestions.length, answeredCount]
  );

  // =========================================================================
  // Context value
  // =========================================================================
  const value = {
    // --- Theme ---
    theme,
    toggleTheme,
    isDark: theme === 'dark',

    // --- School ---
    selectedSchool,
    setSelectedSchool,

    // --- Practice Hub Config ---
    practiceConfig,
    updatePracticeConfig,
    resetPracticeConfig,

    // --- Active Session ---
    activeQuestions,
    userAnswers,
    sessionActive,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    recordAnswer,
    startSession,
    endSession,
    answeredCount,
    unansweredCount,

    // --- UI ---
    isNotificationPanelOpen,
    toggleNotificationPanel,
    setIsNotificationPanelOpen,
    activeTab,
    setActiveTab,

    // --- Reference Data ---
    recommendedSubjects,
    ALL_SUBJECTS,
    SUBJECTS_BY_TRACK,
    AVAILABLE_YEARS,
    PRACTICE_MODES,
    TIMER_OPTIONS,
    SCHOOLS,
    TRACKS,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useApp — consume the context. Throws if used outside <AppProvider>.
// ---------------------------------------------------------------------------
export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error('[useApp] must be used inside an <AppProvider> component.');
  }

  return ctx;
}