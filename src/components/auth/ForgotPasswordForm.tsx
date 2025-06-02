
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSent(true);
      toast({
        title: "Success",
        description: "Password reset email sent! Check your inbox."
      });
    }
    
    setLoading(false);
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto bg-tech-dark border-tech-blue/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">Check Your Email</CardTitle>
          <CardDescription className="text-center text-gray-400">
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-tech-dark border-tech-blue/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-white">Reset Password</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button 
            type="submit" 
            className="w-full bg-tech-blue hover:bg-tech-blue/80"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
        >
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
};
