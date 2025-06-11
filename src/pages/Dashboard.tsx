
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';
import OmniaBackground from '@/components/ui/omnia-background';
import ConnectedAccountsCard from '@/components/dashboard/ConnectedAccountsCard';
import MT5TradingInterface from '@/components/dashboard/MT5TradingInterface';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-white relative">
        <OmniaBackground />
        
        {/* Header */}
        <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-black text-black">OMNIA BOT</h1>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  Dashboard
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ConnectedAccountsCard />
              <MT5TradingInterface />
              <TradingAnalytics />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <NotificationCenter />
            </div>
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;
