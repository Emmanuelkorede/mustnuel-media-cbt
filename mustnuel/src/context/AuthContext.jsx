// =============================================================================
// src/context/AuthContext.jsx
// =============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session,   setSession]   = useState(null);
  const [user,      setUser]      = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Isolated Database Lookup Action
  // ---------------------------------------------------------------------------
  const fetchProfileById = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[AuthContext] Profile Fetch Error:', error.message);
      setProfile(null);
      return null;
    } else {
      setProfile(data);
      return data;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Deadlock-Free Boot Lifecycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;
    let isBootstrapping = true; 

    const bootstrap = async () => {
      try {
        const { data: { session: existing } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(existing);
        setUser(existing?.user ?? null);

        if (existing?.user) {
          await fetchProfileById(existing.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('[AuthContext] Bootstrap Error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
          isBootstrapping = false; 
        }
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        if (event === 'INITIAL_SESSION') return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setAuthError(null);

        if (!isBootstrapping) {
          if (
            event === 'SIGNED_IN'       ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED'
          ) {
            if (newSession?.user) {
              await fetchProfileById(newSession.user.id);
            }
          }

          if (event === 'SIGNED_OUT') {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileById]);

  // ---------------------------------------------------------------------------
  // Auth Actions
  // ---------------------------------------------------------------------------
  const signUp = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); return { success: false, error: error.message }; }
    return { success: true, data };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return { success: false, error: error.message }; }
    return { success: true, data };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth`, 
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });
    if (error) { setAuthError(error.message); return { success: false, error: error.message }; }
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return { success: false, error: 'No authenticated user.' };
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    setProfile(data);
    return { success: true, data };
  }, [user]);

  // ⚡ DYNAMIC EXPIRATION LOGIC ENGINE 
  // True only if premium tier parameter is active AND (has no cutoff deadline OR expiry timestamp resides in the future)
  const isActivated = Boolean(
    profile?.is_premium && 
    (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date())
  );

  const isAdmin = profile?.role === 'admin';

  const isProfileComplete = Boolean(
    profile?.display_name?.trim() &&
    profile?.target_school
  );

  const value = {
    session,
    user,
    profile,
    authError,
    isLoading,
    isActivated,
    isAdmin,
    isProfileComplete,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile: () => fetchProfileById(user?.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('[useAuth] must be used inside <AuthProvider>.');
  return ctx;
}