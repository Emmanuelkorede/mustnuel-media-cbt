import { useEffect, useRef, useCallback } from 'react';
import { supabase }        from '../lib/supabaseClient';
import { fetchQuestions }  from './useQuestions';
import { useAuth }         from '../context/AuthContext';
import { useApp }          from '../context/AppContext';

export const SESSION_STATUS = {
  IDLE:       'idle',
  LOADING:    'loading',
  ACTIVE:     'active',
  SUBMITTING: 'submitting',
  COMPLETE:   'complete',
  ERROR:      'error',
};

function scoreSession({ questions, answers, config, timeTakenSecs }) {
  const subjectMap = {};

  questions.forEach((q) => {
    if (!subjectMap[q.subject]) {
      subjectMap[q.subject] = { total: 0, correct: 0 };
    }
    subjectMap[q.subject].total += 1;

    const userAnswer = answers[q.id];
    if (
      userAnswer !== undefined &&
      q.options[userAnswer] === q.correct_answer
    ) {
      subjectMap[q.subject].correct += 1;
    }
  });

  const totalQuestions = questions.length;
  const correctCount   = Object.values(subjectMap).reduce((s, v) => s + v.correct, 0);
  const scorePercent   = totalQuestions > 0
    ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
    : 0;

  const reviewItems = questions.map((q) => {
    const userAnswerIndex   = answers[q.id] ?? null;
    const userAnswerText    = userAnswerIndex !== null ? q.options[userAnswerIndex] : null;
    const isCorrect         = userAnswerText === q.correct_answer;
    const isSkipped         = userAnswerIndex === null;
    return {
      questionId:      q.id,
      questionText:    q.question_text,
      options:         q.options,
      correctAnswer:   q.correct_answer,
      userAnswer:      userAnswerText,
      userAnswerIndex,
      isCorrect,
      isSkipped,
      subject:         q.subject,
      explanation:     q.explanation ?? null,
    };
  });

  const subjectBreakdown = Object.entries(subjectMap).reduce((acc, [subject, stats]) => {
    acc[subject] = {
      total:         stats.total,
      correct:       stats.correct,
      scorePercent:  parseFloat(((stats.correct / stats.total) * 100).toFixed(2)),
    };
    return acc;
  }, {});

  return {
    mode:              config.mode,
    school:            config.school,
    year:              config.year ?? null,
    is_mock:           config.isMock ?? false,
    subjects:          Object.keys(subjectMap),
    total_questions:   totalQuestions,
    correct_count:     correctCount,
    score_percent:     scorePercent,
    time_taken_secs:   timeTakenSecs,
    subject_breakdown: subjectBreakdown,
    reviewItems,
  };
}

export function useTestSession() {
  const { user } = useAuth();
  const {
    sessionStatus: status,
    setSessionStatus: setStatus,
    activeQuestions: questions,
    setActiveQuestions: setQuestions,
    userAnswers: answers,
    setUserAnswers: setAnswers,
    currentQuestionIndex: currentIndex,
    setCurrentQuestionIndex: setCurrentIndex,
    practiceConfig: config,
    updatePracticeConfig: setConfig,
    sessionResult: result,
    setSessionResult: setResult,
    sessionError: error,
    setSessionError: setError,
    timeLeft,
    setTimeLeft,
    answeredCount,
    unansweredCount
  } = useApp();

  const timerRef = useRef(null);
  const startedAt = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((durationSeconds) => {
    stopTimer();
    setTimeLeft(durationSeconds);
    startedAt.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, setTimeLeft]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // Access submit directly via hook references below
  const submitSession = useCallback(async () => {
    if (status !== SESSION_STATUS.ACTIVE) return;

    stopTimer();
    setStatus(SESSION_STATUS.SUBMITTING);

    const timeTakenSecs = startedAt.current
      ? Math.floor((Date.now() - startedAt.current) / 1000)
      : (config?.timerMinutes ?? 0) * 60;

    const resultPayload = scoreSession({
      questions,
      answers,
      config,
      timeTakenSecs,
    });

    if (user?.id) {
      try {
        const { error: dbError } = await supabase
          .from('test_results')
          .insert({
            user_id:           user.id,
            mode:              resultPayload.mode,
            school:            resultPayload.school,
            year:              resultPayload.year,
            is_mock:           resultPayload.is_mock,
            subjects:          resultPayload.subjects,
            total_questions:   resultPayload.total_questions,
            correct_count:     resultPayload.correct_count,
            score_percent:     resultPayload.score_percent,
            time_taken_secs:   resultPayload.time_taken_secs,
            subject_breakdown: resultPayload.subject_breakdown,
          });

        if (dbError) console.error('[useTestSession] save error:', dbError.message);
      } catch (err) {
        console.error('[useTestSession] unexpected save error:', err);
      }
    }

    setResult(resultPayload);
    setStatus(SESSION_STATUS.COMPLETE);
    return resultPayload;
  }, [status, stopTimer, questions, answers, config, user?.id, setStatus, setResult]);

  // Automated timer countdown action
  useEffect(() => {
    if (status === SESSION_STATUS.ACTIVE && timeLeft === 0 && questions.length > 0) {
      submitSession();
    }
  }, [timeLeft, status, questions.length, submitSession]);

  const launch = useCallback(async (sessionConfig) => {
  setStatus(SESSION_STATUS.LOADING);
  setError(null);
  setResult(null);
  setAnswers({});
  setCurrentIndex(0);
  setConfig(sessionConfig);

  const { data, error: fetchError } = await fetchQuestions({
    school:   sessionConfig.school,
    subjects: sessionConfig.subjects,
    year:     sessionConfig.year,
    isMock:   sessionConfig.isMock,
    freeOnly: sessionConfig.freeOnly ?? false,
  });

  // CHANGED: Even if there's an error or 0 questions, set status to ACTIVE 
  // and let the user navigate to the next page where the error is displayed.
  if (fetchError) {
    setQuestions([]);
    setError(fetchError);
    setStatus(SESSION_STATUS.ACTIVE); 
    return { success: true, count: 0 };
  }

  setQuestions(data || []);
  setStatus(SESSION_STATUS.ACTIVE);
  startTimer(sessionConfig.timerMinutes * 60);

  return { success: true, count: data ? data.length : 0 };
}, [startTimer, setStatus, setError, setResult, setAnswers, setCurrentIndex, setConfig, setQuestions]);

  const answer = useCallback((questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, [setAnswers]);

  const clearAnswer = useCallback((questionId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, [setAnswers]);

  const goTo = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length, setCurrentIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length, setCurrentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, [setCurrentIndex]);

  const reset = useCallback(() => {
    stopTimer();
    setStatus(SESSION_STATUS.IDLE);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setError(null);
    setTimeLeft(0);
    startedAt.current = null;
  }, [stopTimer, setStatus, setQuestions, setAnswers, setCurrentIndex, setResult, setError, setTimeLeft]);

  const currentQuestion  = questions[currentIndex] ?? null;
  const totalQuestions   = questions.length;
  const isLastQuestion   = currentIndex === totalQuestions - 1;
  const isFirstQuestion  = currentIndex === 0;
  const currentAnswer    = currentQuestion ? (answers[currentQuestion.id] ?? null) : null;

  const isCurrentCorrect = currentAnswer !== null && currentQuestion
    ? currentQuestion.options[currentAnswer] === currentQuestion.correct_answer
    : null;

  const questionStatusMap = questions.reduce((acc, q, idx) => {
    if (answers[q.id] !== undefined) {
      acc[q.id] = 'answered';
    } else if (idx < currentIndex) {
      acc[q.id] = 'skipped';
    } else {
      acc[q.id] = 'unanswered';
    }
    return acc;
  }, {});

  return {
    status,
    isLoading:    status === SESSION_STATUS.LOADING,
    isActive:     status === SESSION_STATUS.ACTIVE,
    isSubmitting: status === SESSION_STATUS.SUBMITTING,
    isComplete:   status === SESSION_STATUS.COMPLETE,
    error,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isFirstQuestion,
    isLastQuestion,
    questionStatusMap,
    answers,
    currentAnswer,
    isCurrentCorrect,
    answeredCount,
    unansweredCount,
    timeLeft,
    timerMinutes: config?.timerMinutes ?? 0,
    config,
    mode: config?.mode ?? null,
    result,
    launch,
    answer,
    clearAnswer,
    goTo,
    next,
    prev,
    submitSession,
    reset,
  };
}