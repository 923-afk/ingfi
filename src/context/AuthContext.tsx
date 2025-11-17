'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'professional';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(supabaseUser: User) {
    try {
      // Fetch user profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        // Profile doesn't exist yet - create it with default values
        const defaultRole = (supabaseUser.user_metadata?.role as UserRole) || 'customer';
        const defaultName = supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0];
        
        const { error: insertError } = await supabase.from('user_profiles').insert({
          id: supabaseUser.id,
          name: defaultName,
          role: defaultRole,
          email: supabaseUser.email!,
        });

        if (insertError) {
          console.error('Failed to create profile:', insertError);
          // Fallback to basic user info
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: defaultName,
            role: defaultRole,
          });
          setIsLoading(false);
          return;
        }

        // Retry fetching the profile
        const { data: newData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (newData) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: newData.name || defaultName,
            role: newData.role || defaultRole,
            professionalId: newData.professional_id,
          });
        } else {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: defaultName,
            role: defaultRole,
          });
        }
      } else {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: data.name || supabaseUser.email!.split('@')[0],
          role: data.role || 'customer',
          professionalId: data.professional_id,
        });
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Fallback to basic user info
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.email!.split('@')[0],
        role: 'customer',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return {};
    } catch (err) {
      return { error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string, role: UserRole) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            name,
            role,
            email,
          });

          if (profileError) {
            console.error('Failed to create profile:', profileError);
            // Don't fail signup if profile creation fails - user can still log in
          }
        }

        return {};
      } catch (err) {
        return { error: 'Signup failed. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// For backward compatibility - demo credentials for testing
export const demoCredentials = [
  {
    id: 'demo-customer',
    name: 'Demo Customer',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'customer' as UserRole,
  },
  {
    id: 'demo-professional',
    name: 'Demo Professional',
    email: 'demo-pro@example.com',
    password: 'demo123',
    role: 'professional' as UserRole,
  },
];
