import { useState, useEffect } from 'react';

export function useUserAvatar(userId: number) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      try {
        setLoading(true);
        setError(null);
        
        const url = `/api/avatar?userId=${userId}`;
        setAvatarUrl(url);
        
      } catch (err: any) {
        setError(err.message);
        console.error('Failed to load avatar:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadAvatar();
    }
  }, [userId]);

  return { avatarUrl, loading, error };
}