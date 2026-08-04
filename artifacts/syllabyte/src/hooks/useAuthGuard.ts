import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useLocation } from 'wouter';

/**
 * Redirects to login if no session, or to onboarding if session exists but no rollNo.
 * Returns true while the guard is still loading/redirecting.
 */
export function useAuthGuard(): { isReady: boolean } {
  const { session, rollNo, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      setLocation('/');
      return;
    }
    if (!rollNo) {
      setLocation('/onboarding');
    }
  }, [session, rollNo, isLoading, setLocation]);

  const isReady = !isLoading && !!session && !!rollNo;
  return { isReady };
}
