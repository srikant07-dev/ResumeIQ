import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

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
        setLoading(false);
      } else {
        const demoSession = localStorage.getItem('resumeiq_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setSession(parsed);
            setUser(parsed.user ?? null);
          } catch (e) {
            localStorage.removeItem('resumeiq_demo_session');
          }
        }
        setLoading(false);
      }
    }).catch(() => {
      const demoSession = localStorage.getItem('resumeiq_demo_session');
      if (demoSession) {
        try {
          const parsed = JSON.parse(demoSession);
          setSession(parsed);
          setUser(parsed.user ?? null);
        } catch (e) {
          localStorage.removeItem('resumeiq_demo_session');
        }
      }
      setLoading(false);
    });

    // Listen for auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.removeItem('resumeiq_demo_session');
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT' || !localStorage.getItem('resumeiq_demo_session')) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
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
      id: 'demo-user-0000-0000-0000-000000000000',
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
