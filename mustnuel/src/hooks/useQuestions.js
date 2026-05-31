// =============================================================================
// src/hooks/useQuestions.js
// -----------------------------------------------------------------------------
// All question bank queries against public.questions.
//
// Exports:
//   fetchQuestions(filters) — plain async fn, used by useTestSession
//   useQuestions(filters)   — reactive hook, used by PracticeHubPage
//
// Filter shape:
// {
//   school:   string          'UI' | 'UNILAG' | 'OAU'
//   subjects: string[]        e.g. ['Mathematics', 'Physics']
//   year:     number | null   null = pull from mock pool
//   isMock:   boolean         true = is_mock_pool rows, ignore year
//   freeOnly: boolean         true = is_free rows only (free-tier users)
//   limit:    number          max rows (default 60)
// }
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ---------------------------------------------------------------------------
// buildQuery — pure function, builds the Supabase query from filters.
// Shared by both the hook and the standalone fetch function.
// ---------------------------------------------------------------------------
function buildQuery(filters = {}) {
  const {
    school,
    subjects = [],
    year     = null,
    isMock   = false,
    freeOnly = false,
    limit    = 60,
  } = filters;

  let q = supabase
    .from('questions')
    .select(
      'id, school, subject, year, question_text, options, correct_answer, explanation, is_free, is_mock_pool'
    );

  if (school)            q = q.eq('school', school);
  if (subjects.length === 1) q = q.eq('subject', subjects[0]);
  if (subjects.length > 1)   q = q.in('subject', subjects);

  if (isMock || !year) {
    q = q.eq('is_mock_pool', true);
  } else {
    q = q.eq('year', year);
  }

  if (freeOnly) q = q.eq('is_free', true);

  return q.limit(limit);
}

// ---------------------------------------------------------------------------
// fetchQuestions — plain async function, no React state.
// Returns { data: Question[], error: string | null }
// Call this from useTestSession to load the active exam question set.
// ---------------------------------------------------------------------------
export async function fetchQuestions(filters = {}) {
  try {
    const { data, error } = await buildQuery(filters);

    if (error) {
      console.error('[fetchQuestions]', error.message);
      return { data: [], error: error.message };
    }

    // Shuffle client-side so order varies each session
    const shuffled = (data ?? []).sort(() => Math.random() - 0.5);
    return { data: shuffled, error: null };
  } catch (err) {
    console.error('[fetchQuestions] unexpected:', err);
    return { data: [], error: 'Failed to load questions.' };
  }
}

// ---------------------------------------------------------------------------
// useQuestions — reactive hook, re-fetches whenever filters change.
// Used in PracticeHubPage to show a live question count preview.
//
// Returns:
//   questions   Question[]
//   isLoading   boolean
//   error       string | null
//   refetch     () => void
//   totalCount  number
// ---------------------------------------------------------------------------
export function useQuestions(filters = {}) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  // JSON string makes the dependency stable across renders
  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    if (!filters.school) { setQuestions([]); return; }

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await fetchQuestions(
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.parse(filterKey)
    );

    setQuestions(data);
    setError(err);
    setIsLoading(false);
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { questions, isLoading, error, refetch: load, totalCount: questions.length };
}