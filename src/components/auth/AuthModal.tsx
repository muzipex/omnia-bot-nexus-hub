
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthModal: React.FC<AuthModalProps> = ({ 
  open, 
  onOpenChange, 
  defaultMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-transparent border-none p-0">
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
          <ForgotPasswordForm onBack={handleBackToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
};
