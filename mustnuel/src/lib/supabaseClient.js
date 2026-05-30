


import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[supabaseClient] Missing environment variables.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Persist session in localStorage so the user stays logged in
    // across page refreshes and browser restarts.
    persistSession: true,

    // Automatically refresh the JWT token before it expires.
    autoRefreshToken: true,

    // Detect session from URL on OAuth redirects (e.g. Google sign-in).
    detectSessionInUrl: true,
  },
});