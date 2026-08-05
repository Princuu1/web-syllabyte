import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const API_URL =
import.meta.env.VITE_API_URL ||
'https://web-syllabyte-api-server.vercel.app';

export default function AuthCallback() {
const [, setLocation] = useLocation();
const [error, setError] = useState<string | null>(null);
const { setRollNo } = useAuth();

useEffect(() => {
const handle = async () => {
let session = null;


  // Parse tokens returned by Supabase OAuth.
  const hash = window.location.hash;

  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { data, error: sessionError } =
        await supabase.auth.setSession({
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
    // User may have refreshed the callback page.
    const { data } = await supabase.auth.getSession();
    session = data.session;
  }

  if (!session) {
    setError('No session found. Please try logging in again.');
    return;
  }

  // Remove OAuth tokens from the browser URL.
  window.history.replaceState(null, '', '/auth/callback');

  const email = session.user.email;

  if (!email) {
    setError('No email address was returned by Google.');
    return;
  }

  try {
    // Check whether this Google account has already been linked
    // to an existing student.
    const res = await fetch(
      `${API_URL}/api/profile/by-email?email=${encodeURIComponent(email)}`
    );

    if (res.ok) {
      const profile = await res.json();

      if (profile.class_roll_no) {
        setRollNo(String(profile.class_roll_no));
        setLocation('/home');
        return;
      }
    }

    if (res.status !== 404) {
      console.error(
        'Profile lookup failed:',
        res.status,
        await res.text()
      );
    }
  } catch (err) {
    console.error('Profile lookup request failed:', err);
  }

  /*
   * The Google account is authenticated, but no student row
   * currently has this email in linked_email.
   *
   * This DOES NOT mean the student is new.
   *
   * /onboarding should verify the existing student using
   * roll number + DOB and then link this authenticated email.
   */

  setRollNo(null);
  setLocation('/onboarding');
};

handle();


}, [setLocation, setRollNo]);

if (error) {
return ( <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 gap-4"> <p className="text-destructive text-center">
{error} </p>


    <button
      className="underline text-primary text-sm"
      onClick={() => setLocation('/')}
    >
      Back to login
    </button>
  </div>
);


}

return ( <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4"> <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />


  <p className="text-muted-foreground text-sm">
    Signing you in…
  </p>
</div>


);
}
