import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, TrendingUp, BarChart3, Bot, Briefcase } from 'lucide-react';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import FuturisticDashboard from '@/components/dashboard/FuturisticDashboard';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import AITradingDashboard from '@/components/dashboard/AITradingDashboard';
import MT5AccountPortfolio from '@/components/dashboard/MT5AccountPortfolio';

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
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  OMNIA AI
                </h1>
              </div>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8">
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
                value="portfolio" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Portfolio
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
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <FuturisticDashboard />
                </div>
                <div>
                  <SubscriptionStatusCard />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              <MT5AccountPortfolio />
            </TabsContent>

            <TabsContent value="trading">
              <AITradingDashboard />
            </TabsContent>

            <TabsContent value="analytics">
              <TradingAnalytics />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;
