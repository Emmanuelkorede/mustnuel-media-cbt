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
// Post-UTME Config: Schools own their specific subjects and structures
// ---------------------------------------------------------------------------
export const SCHOOLS = ['UI', 'UNILAG', 'OAU'];

export const POST_UTME_SUBJECTS_BY_SCHOOL = {
  UI: {
    display_name: "University of Ibadan",
    subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Government', 'Literature in English', 'Economics', 'Accounts'],
    default_selection: ['English Language', 'Mathematics']
  },
  UNILAG: {
    display_name: "University of Lagos",
    subjects: ['English Language', 'Mathematics', 'General Paper'], // UNILAG combines track queries into a General Paper
    default_selection: ['English Language', 'Mathematics', 'General Paper']
  },
  OAU: {
    display_name: "Obafemi Awolowo University",
    subjects: [ 'APTITUDE', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Government', 'Economics' ,'CRS' , 'IRS' , 'Yoruba' , 'Accounting' , 'Literature'],
    default_selection: ['English Language', 'Aptitude Test']
  }
};

export const TRACKS = {
  Science:    'Science',
  Arts:       'Arts',
  Commercial: 'Commercial',
};

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

export const AVAILABLE_YEARS = Array.from(
  { length: 2025 - 2020 + 1 },
  (_, i) => 2025 - i
);

export const PRACTICE_MODES = {
  STUDY:  'study',
  EXAM:   'exam',
};

export const TIMER_OPTIONS = [30, 45, 60, 90, 120];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { profile } = useAuth();

  // =========================================================================
  // 1. THEME STATE
  // =========================================================================
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('cbt_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

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
  const [selectedSchool, setSelectedSchool] = useState(
    profile?.target_school ?? null
  );

  useEffect(() => {
    if (profile?.target_school && !selectedSchool) {
      setSelectedSchool(profile.target_school);
    }
  }, [profile?.target_school, selectedSchool]);

  // =========================================================================
  // 3. PRACTICE HUB CONFIGURATION
  // =========================================================================
  const DEFAULT_PRACTICE_CONFIG = {
    mode:            PRACTICE_MODES.EXAM,
    school:          null,
    year:            null,
    subjects:        [],
    timerMinutes:    60,
    isMock:          false,
  };

  const [practiceConfig, setPracticeConfig] = useState(DEFAULT_PRACTICE_CONFIG);

  const updatePracticeConfig = useCallback((partial) => {
    setPracticeConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetPracticeConfig = useCallback(() => {
    setPracticeConfig(DEFAULT_PRACTICE_CONFIG);
  }, []);

  // =========================================================================
  // 4. ACTIVE CBT SESSION STATE (Elevated globally to preserve data)
  // =========================================================================
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, loading, active, submitting, complete, error
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [userAnswers, setUserAnswers]         = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionError, setSessionError]       = useState(null);
  const [sessionResult, setSessionResult]     = useState(null);
  const [timeLeft, setTimeLeft]               = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // =========================================================================
  // 5. GLOBAL UI STATE
  // =========================================================================
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  // =========================================================================
  // 6. DERIVED VALUES
  // =========================================================================
  const recommendedSubjects = useMemo(() => {
    const track = profile?.track ?? 'Science';
    return SUBJECTS_BY_TRACK[track] ?? SUBJECTS_BY_TRACK.Science;
  }, [profile?.track]);

  const answeredCount = useMemo(
    () => Object.keys(userAnswers).length,
    [userAnswers]
  );

  const unansweredCount = useMemo(
    () => activeQuestions.length - answeredCount,
    [activeQuestions.length, answeredCount]
  );

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',

    selectedSchool,
    setSelectedSchool,

    practiceConfig,
    updatePracticeConfig,
    resetPracticeConfig,

    // Active Engine State
    sessionStatus,
    setSessionStatus,
    activeQuestions,
    setActiveQuestions,
    userAnswers,
    setUserAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    sessionError,
    setSessionError,
    sessionResult,
    setSessionResult,
    timeLeft,
    setTimeLeft,
    answeredCount,
    unansweredCount,

    isNotificationPanelOpen,
    toggleNotificationPanel,
    setIsNotificationPanelOpen,
    activeTab,
    setActiveTab,

    // --- Dynamic Post-UTME Configurations ---
    POST_UTME_SUBJECTS_BY_SCHOOL,
    SCHOOLS,

    recommendedSubjects,
    SUBJECTS_BY_TRACK,
    AVAILABLE_YEARS,
    PRACTICE_MODES,
    TIMER_OPTIONS,
    TRACKS,

    isUpgradeModalOpen,
setIsUpgradeModalOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('[useApp] must be used inside an <AppProvider> component.');
  }
  return ctx;
}