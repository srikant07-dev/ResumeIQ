import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function getStoredDemoSession() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('resumeiq_demo_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('resumeiq_demo_session');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on initial mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
      } else {
        const demo = getStoredDemoSession();
        if (demo) {
          setSession(demo);
          setUser(demo.user ?? null);
        }
      }
    }).catch(() => {
      const demo = getStoredDemoSession();
      if (demo) {
        setSession(demo);
        setUser(demo.user ?? null);
      }
    }).finally(() => {
      setLoading(false);
    });

    // Listen for auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
        } else {
          const demo = getStoredDemoSession();
          if (demo) {
            setSession(demo);
            setUser(demo.user ?? null);
          } else {
            setSession(null);
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('resumeiq_demo_session');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore signOut errors when session is not in Supabase
    }
    setUser(null);
    setSession(null);
  };

  // Demo user login for presentation and offline local evaluation
  const loginAsDemo = () => {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo.developer@resumeiq.app',
      user_metadata: { full_name: 'Demo Candidate' },
    };
    const mockSession = { access_token: 'demo-token', user: mockUser };
    localStorage.setItem('resumeiq_demo_session', JSON.stringify(mockSession));
    setUser(mockUser);
    setSession(mockSession);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    loginAsDemo,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
