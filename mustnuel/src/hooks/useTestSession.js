import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchQuestions } from './useQuestions';
import { useApp } from '../context/AppContext';

export function useTestSession() {
  const { PRACTICE_MODES } = useApp();
  
  const [config,        setConfig]       = useState(null);
  const [questions,     setQuestions]    = useState([]);
  const [currentIndex,  setCurrentIndex] = useState(0);
  const [answers,       setAnswers]      = useState({});
  const [timeLeft,      setTimeLeft]     = useState(0);
  const [isLoading,     setIsLoading]    = useState(false);
  const [isFinished,    setIsFinished]   = useState(false);

  const timerRef = useRef(null);

  const launch = async (sessionConfig) => {
    // FIXED: Synchronously wipe out questions and config instantly to block render leaks
    setIsLoading(true);
    setQuestions([]);
    setConfig(null); 
    setAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);

    const { data, error } = await fetchQuestions({
      school:   sessionConfig.school,
      subjects: sessionConfig.subjects,
      year:     sessionConfig.year,
      freeOnly: sessionConfig.freeOnly,
      limit:    sessionConfig.limit,
    });

    if (error) {
      console.error('[useTestSession] Failed to fetch questions:', error);
    }

    // Assign fresh batch values
    setQuestions(data || []);
    setConfig(sessionConfig);

    if (sessionConfig.mode === PRACTICE_MODES.STUDY) {
      setTimeLeft(0);
    } else {
      setTimeLeft((sessionConfig.timerMinutes || 60) * 60);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!config || config.mode === PRACTICE_MODES.STUDY || isFinished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitSession(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [config, isFinished, questions.length]);

  const registerAnswer = useCallback((questionId, optionLetter) => {
    setAnswers((prev) => {
      if (config?.mode === PRACTICE_MODES.STUDY && prev[questionId]) {
        return prev;
      }
      return { ...prev, [questionId]: optionLetter };
    });
  }, [config]);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length]);

  const submitSession = async () => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let totalScore = 0;
    const subjectScores = {};

    questions.forEach((q) => {
      if (!subjectScores[q.subject]) {
        subjectScores[q.subject] = { total: 0, correct: 0 };
      }
      subjectScores[q.subject].total += 1;

      const userAnswer = answers[q.id];
      if (userAnswer === q.correct_option) {
        totalScore += 1;
        subjectScores[q.subject].correct += 1;
      }
    });

    const timeSpent = config?.mode === PRACTICE_MODES.STUDY 
      ? 0 
      : ((config.timerMinutes * 60) - timeLeft);

    return {
      totalScore,
      totalQuestions: questions.length,
      subjectScores,
      mode: config?.mode,
      timeSpent,
      answers,
      questions,
    };
  };

  return {
    config,
    questions,
    currentIndex,
    answers,
    timeLeft,
    isLoading,
    isFinished,
    launch,
    registerAnswer,
    next,
    prev,
    goTo,
    submitSession,
  };
}