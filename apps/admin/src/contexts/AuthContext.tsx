import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: 'user' | 'admin' | string | null;
  created_at?: string;
  updated_at?: string;
};

type AuthContextValue = {
  user: any | null;
  profile: Profile | null | undefined; // undefined = not fetched yet; null = fetched but missing/error
  loading: boolean;
  lastError: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastError, setLastError] = useState<string | null>(null);

  // fetch profile helper
  const fetchProfile = async (uid?: string) => {
    setLastError(null);
    if (!uid) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('[AuthContext] profile fetch error:', error);
        setProfile(null);
        setLastError(error.message ?? String(error));
      } else {
        setProfile(data ?? null);
        setLastError(null);
      }
    } catch (err: any) {
      console.error('[AuthContext] unexpected profile fetch error:', err);
      setProfile(null);
      setLastError(err?.message ?? String(err));
    }
  };

  // init using getSession (more reliable immediately after signIn)
  const initFromSession = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err: any) {
      console.error('[AuthContext] initFromSession error', err);
      setUser(null);
      setProfile(null);
      setLastError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // initial attempt to load session+profile
    initFromSession();

    // subscribe to auth state changes and use the session payload provided
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Debug log to diagnose flow
      console.debug('[AuthContext] onAuthStateChange event=', event, 'session=', session, 'user=', session?.user);
      if (!mounted) return;

      // If session is present, set user immediately and fetch profile
      if (session?.user) {
        console.log('[AuthContext] Setting user from onAuthStateChange:', session.user.id);
        setUser(session.user);
        // fetch profile for this user
        fetchProfile(session.user.id).catch((e) => {
          console.error('[AuthContext] fetchProfile error after auth state change', e);
        });
      } else {
        console.log('[AuthContext] No session/user, clearing state');
        // signed out
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      try {
        // Unsubscribe robustly for both response shapes
        if (sub && (sub as any).subscription) {
          (sub as any).subscription.unsubscribe();
        } else if (sub && (sub as any).unsubscribe) {
          (sub as any).unsubscribe();
        }
      } catch (err) {
        console.warn('[AuthContext] error unsubscribing', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err: any) {
      console.error('[AuthContext] refreshProfile error', err);
      setLastError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] signOut error', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    lastError,
    refreshProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;