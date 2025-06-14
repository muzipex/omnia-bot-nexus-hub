
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, User, TrendingUp, BarChart3, Bot, Activity } from 'lucide-react';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import FuturisticDashboard from '@/components/dashboard/FuturisticDashboard';
import MT5TradingInterface from '@/components/dashboard/MT5TradingInterface';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import AITradingDashboard from '@/components/dashboard/AITradingDashboard';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background grid */}
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="fixed inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
        
        {/* Header */}
        <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    OMNIA AI
                  </h1>
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Trading
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-6 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-black/30 border border-white/10 backdrop-blur-sm p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="trading" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Trading
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <Activity className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Dashboard */}
                <div className="lg:col-span-3">
                  <FuturisticDashboard />
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                  <SubscriptionStatusCard />
                  <NotificationCenter />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trading">
              <AITradingDashboard />
            </TabsContent>

            <TabsContent value="analytics">
              <TradingAnalytics />
            </TabsContent>

            <TabsContent value="advanced">
              <MT5TradingInterface />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;
