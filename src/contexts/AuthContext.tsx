import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  isAdmin: boolean;
  loading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'dazhu_admin_auth';
const ADMIN_EMAIL = 'admin@dazhu-site.internal';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAdmin(authed);
      if (authed) {
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAdmin(authed);
      if (authed) {
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });

    if (error) {
      // Map common Supabase errors to Chinese
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: '密码错误' };
      }
      return { success: false, error: error.message };
    }

    localStorage.setItem(STORAGE_KEY, '1');
    setIsAdmin(true);
    return { success: true };
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
