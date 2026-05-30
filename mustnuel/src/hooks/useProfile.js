

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const { user, profile, updateProfile, refreshProfile, isActivated, isAdmin } = useAuth();
  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ---------------------------------------------------------------------------
  // save — wraps updateProfile with loading/error state for form UIs
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // uploadAvatar — uploads a file to Supabase Storage then saves the public URL
  // Bucket name: 'avatars' — create this in Supabase Storage with public access
  // ---------------------------------------------------------------------------
  const uploadAvatar = useCallback(async (file) => {
    if (!user?.id) return { success: false, error: 'Not authenticated.' };

    setIsSaving(true);
    setSaveError(null);

    const ext      = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    // Upload the file (upsert:true overwrites any existing avatar)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setIsSaving(false);
      setSaveError(uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // Get the public URL and persist it to the profile row
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const result = await updateProfile({ avatar_url: publicUrl });

    setIsSaving(false);
    if (!result.success) setSaveError(result.error);
    return result;
  }, [user?.id, updateProfile]);

  // ---------------------------------------------------------------------------
  // Derived display helpers
  // ---------------------------------------------------------------------------
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
    // Raw data
    profile,
    user,

    // Display helpers
    displayName,
    initials,
    avatarUrl,
    targetSchool,
    track,
    streakCount,
    cbtCount,
    averageScore,

    // Access flags
    isActivated,
    isAdmin,

    // Async actions
    save,
    uploadAvatar,
    refreshProfile,

    // Loading state
    isSaving,
    saveError,
  };
}