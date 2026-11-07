import { AppState, type AppStateStatus } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { isSupabaseConfigured, supabase, supabaseSetupMessage } from '@/services/supabase';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) setSession(data.session);
      })
      .catch((error: unknown) => {
        console.error('Unable to restore the saved Supabase session:', error);
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    if (AppState.currentState === 'active') client.auth.startAutoRefresh();

    return () => {
      active = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const requireClient = useCallback(() => {
    if (!supabase) throw new Error(supabaseSetupMessage);
    return supabase;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await requireClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [requireClient],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await requireClient().auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      return Boolean(data.session);
    },
    [requireClient],
  );

  const signOut = useCallback(async () => {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  }, [requireClient]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
