
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  // Auto-hide modal when user is authenticated
  React.useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal, setShowAuthModal]);

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  return (
    <Dialog open={showAuthModal && !user} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md bg-tech-dark border-tech-blue/30">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            {mode === 'login' ? 'Welcome Back' :
             mode === 'signup' ? 'Create Account' :
             'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {mode === 'login' ? 'Sign in to access your OMNIA BOT dashboard' :
             mode === 'signup' ? 'Join OMNIA BOT and start automated trading' :
             'Enter your email to reset your password'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' && (
          <LoginForm
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
          />
        )}

        {mode === 'signup' && (
          <SignupForm onToggleMode={handleToggleMode} />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm />
        )}
      </DialogContent>
    </Dialog>
  );
};
