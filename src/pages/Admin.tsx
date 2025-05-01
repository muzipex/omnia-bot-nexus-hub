import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from '@/components/ui/sonner';
import Breadcrumbs from '@/components/Breadcrumbs';

const Admin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin authentication - in a real app, this would be an API call
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      toast.success('Login successful');
      navigate(from);
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <>
      <SEO 
        title="Admin Login"
        description="Secure admin portal login"
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-8" />
          
          <div className="flex flex-col items-center justify-center mt-12">
            <Card className="w-full max-w-md p-6 bg-tech-dark border-tech-blue/20">
              <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-tech-blue/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-tech-blue" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                <p className="text-gray-400">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-tech-charcoal border-tech-blue/20"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-tech-charcoal border-tech-blue/20"
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-tech-blue hover:bg-tech-blue/90 text-white"
                >
                  Login
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
