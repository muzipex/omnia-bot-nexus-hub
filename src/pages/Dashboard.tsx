
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, LogOut, Download, Settings, TrendingUp, Bot, Bell, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDownloadState } from '@/hooks/use-download-state';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import BotManagement from '@/components/dashboard/BotManagement';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import TradingViewChart from '@/components/dashboard/TradingViewChart';
import MT5WebTrader from '@/components/dashboard/MT5WebTrader';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { handleDownload, hasPaid } = useDownloadState();
  const [activeTab, setActiveTab] = useState('overview');

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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.user_metadata?.full_name || user.email}</p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-tech-charcoal">
              <TabsTrigger value="overview" className="data-[state=active]:bg-tech-blue">Overview</TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-tech-blue">Trading</TabsTrigger>
              <TabsTrigger value="chart" className="data-[state=active]:bg-tech-blue">Live Chart</TabsTrigger>
              <TabsTrigger value="mt5" className="data-[state=active]:bg-tech-blue">MT5 Trader</TabsTrigger>
              <TabsTrigger value="bots" className="data-[state=active]:bg-tech-blue">Bot Management</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-tech-blue">Notifications</TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-tech-blue">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Get started with OMNIA BOT
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hasPaid ? (
                      <Button 
                        onClick={handleDownload}
                        className="w-full bg-tech-green hover:bg-tech-green/80"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Bot
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => window.location.href = '/#pricing'}
                        className="w-full bg-tech-blue hover:bg-tech-blue/80"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Purchase License
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
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
              </div>

              {/* Theme Selector */}
              <ThemeSelector />
            </TabsContent>

            <TabsContent value="trading">
              <TradingAnalytics />
            </TabsContent>

            <TabsContent value="chart">
              <TradingViewChart />
            </TabsContent>

            <TabsContent value="mt5">
              <MT5WebTrader />
            </TabsContent>

            <TabsContent value="bots">
              <BotManagement />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationCenter />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
