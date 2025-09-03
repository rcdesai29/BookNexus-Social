import { useState, useEffect } from 'react';
import { profileService, UserProfile } from '../services/profileService';
import { useAuth } from './useAuth';

export function useCurrentUserProfile() {
  const { isLoggedIn, user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUserProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const profile = await profileService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
        setError(errorMessage);
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, user]);

  return { userProfile, loading, error, refetch: () => {
    if (isLoggedIn && user) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const profile = await profileService.getCurrentUserProfile();
          setUserProfile(profile);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }};
}