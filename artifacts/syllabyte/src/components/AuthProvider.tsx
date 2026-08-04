import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  rollNo: string | null;
  setRollNo: (rollNo: string | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  rollNo: null,
  setRollNo: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rollNo, setRollNoState] = useState<string | null>(
    localStorage.getItem('syllabyte_roll_no')
  );

  const setRollNo = (newRollNo: string | null) => {
    if (newRollNo) {
      localStorage.setItem('syllabyte_roll_no', newRollNo);
    } else {
      localStorage.removeItem('syllabyte_roll_no');
    }
    setRollNoState(newRollNo);
  };

  const signOut = async () => {
    // Global scope invalidates ALL sessions for this user across all devices
    await supabase.auth.signOut({ scope: 'global' });
    // Clear everything from local storage to prevent any session reuse
    setRollNo(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession) {
          // Session gone (signed out) — clear rollNo state
          setRollNoState(null);
        } else {
          // Session arrived — sync rollNo from localStorage in case AuthCallback just set it
          const stored = localStorage.getItem('syllabyte_roll_no');
          if (stored) setRollNoState(stored);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      // If no session, ensure rollNo is also cleared
      if (!currentSession) {
        setRollNoState(null);
        localStorage.removeItem('syllabyte_roll_no');
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, rollNo, setRollNo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
