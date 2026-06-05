import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Fetches a pool of questions for a specific single subject.
 * Enforces rigid static ordering for free users.
 */
export async function fetchQuestionsForSubject({ school, subject, year, freeOnly, limit }) {
  try {
    let q = supabase
      .from('questions')
      .select('id, school, subject, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, is_free');

    // Filter by school safely
    if (school) q = q.eq('school', school.toUpperCase().trim());
    
    // Filter by specific single subject
    if (subject) q = q.eq('subject', subject);

    // Filter by year if chosen
    if (year) {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        q = q.eq('year', parsedYear);
      }
    }

    // Explicitly lock down query filters if free tier active
    if (freeOnly) {
      q = q.eq('is_free', true);
      // 🔒 CRITICAL: Force a strict deterministic order so free users get the exact same rows every time
      q = q.order('created_at', { ascending: true });
    }

    // Enforce the strict allocation limit passed down from the master builder
    const { data, error } = await q.limit(limit);

    if (error) {
      console.error(`[fetchQuestionsForSubject] Error fetching ${subject}:`, error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error(`[fetchQuestionsForSubject] Unexpected failure for ${subject}:`, err);
    return [];
  }
}

/**
 * Master session setup loader.
 * Iterates through chosen subjects and completely bypasses randomization mechanics for free accounts.
 */
export async function fetchQuestions(filters = {}) {
  const {
    school,
    subjects = [],
    year     = null, 
    freeOnly = false,
    limit    = 40,   
  } = filters;

  if (!subjects || subjects.length === 0) return { data: [], error: null };

  try {
    const totalSubjects = subjects.length;
    
    // Strict Distribution Math
    const basePerSubject = Math.floor(limit / totalSubjects);
    const remainder = limit % totalSubjects;

    const fetchPromises = subjects.map((subj, idx) => {
      const allocatedCount = basePerSubject + (idx < remainder ? 1 : 0);
      if (allocatedCount === 0) return Promise.resolve([]);

      return fetchQuestionsForSubject({
        school,
        subject: subj,
        year,
        freeOnly,
        limit: allocatedCount,
      });
    });

    const resultsArray = await Promise.all(fetchPromises);
    
    // Flatten all subject arrays into a single unified master array
    let masterPool = resultsArray.flat();

    // 🔒 CRITICAL ENGINE BYPASS RULE
    if (!freeOnly) {
      // Premium users get full global client-side random shuffle to mix subjects evenly
      masterPool = masterPool.sort(() => Math.random() - 0.5);
    } else {
      // Free users skip the randomizer completely. 
      // They get the exact same questions in the exact same static database entry order every single session run.
    }

    // Enforce hard boundary cap array length matching configuration selection limits
    if (masterPool.length > limit) {
      masterPool = masterPool.slice(0, limit);
    }

    return { data: masterPool, error: null };
  } catch (err) {
    console.error('[fetchQuestions] Master builder unexpected failure:', err);
    return { data: [], error: 'Failed to balance and load examination questions.' };
  }
}

/**
 * Reactive Hook used for live counting previews on dashboard summary panels
 */
export function useQuestions(filters = {}) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    if (!filters.school || !filters.subjects?.length) { 
      setQuestions([]); 
      return; 
    }

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await fetchQuestions(JSON.parse(filterKey));

    setQuestions(data);
    setError(err);
    setIsLoading(false);
  }, [filterKey]);

  useEffect(() => { load(); }, [load]);

  return { questions, isLoading, error, refetch: load, totalCount: questions.length };
}