import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const { user, profile, updateProfile, refreshProfile, isActivated, isAdmin } = useAuth();
  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ---------------------------------------------------------------------------
  // AUTO-SYNC HOOK EFFECT
  // Ensures metrics remain current on mount without stale calculations hanging
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [user?.id]); // 👈 Automatically refreshes state totals on component mount

  const save = useCallback(async (updates) => {
    setIsSaving(true);
    setSaveError(null);

    const result = await updateProfile(updates);

    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.error);
    }

    return result;
  }, [updateProfile]);

  const uploadAvatar = useCallback(async (file) => {
    if (!user?.id) return { success: false, error: 'Not authenticated.' };

    setIsSaving(true);
    setSaveError(null);

    const ext      = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setIsSaving(false);
      setSaveError(uploadError.message);
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const result = await updateProfile({ avatar_url: publicUrl });

    setIsSaving(false);
    if (!result.success) setSaveError(result.error);
    return result;
  }, [user?.id, updateProfile]);

  // Derived display helpers
  const displayName   = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Student';
  const initials      = displayName
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const avatarUrl     = profile?.avatar_url ?? null;
  const targetSchool  = profile?.target_school ?? null;
  const track         = profile?.track ?? null;
  const streakCount   = profile?.streak_count ?? 0;
  const cbtCount      = profile?.cbt_count ?? 0;
  const averageScore  = profile?.average_score ?? 0;

  return {
    profile,
    user,
    displayName,
    initials,
    avatarUrl,
    targetSchool,
    track,
    streakCount,
    cbtCount,
    averageScore,
    isActivated,
    isAdmin,
    save,
    uploadAvatar,
    refreshProfile,
    isSaving,
    saveError,
  };
}