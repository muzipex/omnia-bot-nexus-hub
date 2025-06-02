
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, {
      full_name: fullName
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account."
      });
    }
    
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-tech-dark border-tech-blue/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 bg-tech-charcoal border-tech-blue/30 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-tech-charcoal border-tech-blue/30 text-white"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-tech-charcoal border-tech-blue/30 text-white"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-tech-charcoal border-tech-blue/30 text-white"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-tech-green hover:bg-tech-green/80 text-tech-dark font-bold"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-tech-blue/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-tech-dark px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
          >
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
          >
            GitHub
          </Button>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-tech-blue hover:text-tech-blue/80"
            >
              Log in
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
