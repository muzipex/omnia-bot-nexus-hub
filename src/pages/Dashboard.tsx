
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-tech-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-tech-blue" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                {user.user_metadata?.full_name && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-tech-blue" />
                    <span className="text-gray-300">{user.user_metadata.full_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-tech-blue" />
                  <span className="text-gray-300">
                    {user.email_confirmed_at ? 'Email Verified' : 'Email Not Verified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white">Account Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Recent account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-400">Member since</span>
                  <p className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Last sign in</span>
                  <p className="text-gray-300">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tech-charcoal border-tech-blue/30 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">OMNIA BOT Features</CardTitle>
                <CardDescription className="text-gray-400">
                  Access your trading tools and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="bg-tech-blue hover:bg-tech-blue/80">
                    Trading Dashboard
                  </Button>
                  <Button variant="outline" className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10">
                    Analytics
                  </Button>
                  <Button variant="outline" className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10">
                    Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
