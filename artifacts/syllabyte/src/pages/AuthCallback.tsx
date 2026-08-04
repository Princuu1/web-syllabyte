import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { setRollNo } = useAuth();

  useEffect(() => {
    const handle = async () => {
      let session = null;

      // Parse hash tokens from Google OAuth redirect
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            setError(sessionError.message);
            return;
          }
          session = data.session;
        }
      } else {
        // No hash — check for existing session (e.g. user refreshed this page)
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (!session) {
        setError('No session found. Please try logging in again.');
        return;
      }

      // Clean the URL
      window.history.replaceState(null, '', '/auth/callback');

      const email = session.user?.email;

      // Check if this Google account is already linked to a student record
      if (email) {
        try {
          const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
          const res = await fetch(
            `${BASE}/api/profile/by-email?email=${encodeURIComponent(email)}`
          );
          if (res.ok) {
            const profile = await res.json();
            // Email is linked — restore rollNo via context (updates both state + localStorage)
            setRollNo(profile.class_roll_no);
            setLocation('/home');
            return;
          }
        } catch {
          // Network error — fall through to onboarding
        }
      }

      // Not linked yet — check if they previously set a roll number manually
      const savedRollNo = localStorage.getItem('syllabyte_roll_no');
      setLocation(savedRollNo ? '/home' : '/onboarding');
    };

    handle();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-destructive text-center">{error}</p>
        <button
          className="underline text-primary text-sm"
          onClick={() => setLocation('/')}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </div>
  );
}
