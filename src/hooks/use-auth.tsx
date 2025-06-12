import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Hide auth modal on successful login
        if (event === 'SIGNED_IN' && session) {
          setShowAuthModal(false);
          
          // Send notification to Telegram if configured
          setTimeout(async () => {
            const { telegramBot } = await import('@/services/telegram-bot');
            await telegramBot.sendUpdate({
              type: 'account_update',
              message: `User ${session.user.email} successfully logged in to OMNIA BOT Dashboard`,
              timestamp: new Date().toISOString()
            });
          }, 1000);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        // Check if it's a provider not enabled error
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          return { 
            error: {
              ...error,
              message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured yet. Please use email/password login or contact support.`
            } as AuthError
          };
        }
      }
      
      return { error };
    } catch (err: any) {
      return { 
        error: {
          message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is currently unavailable. Please try email/password login.`,
          status: 400
        } as AuthError
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    showAuthModal,
    setShowAuthModal,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
