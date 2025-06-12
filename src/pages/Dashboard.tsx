
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useConnectedAccounts } from '@/hooks/use-connected-accounts';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';
import OmniaBackground from '@/components/ui/omnia-background';
import ConnectedAccountsCard from '@/components/dashboard/ConnectedAccountsCard';
import MT5TradingInterface from '@/components/dashboard/MT5TradingInterface';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Settings, User, TrendingUp, DollarSign, Activity, PieChart, BarChart3, Zap } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { accounts, loading } = useConnectedAccounts();
  const [dashboardStats, setDashboardStats] = useState({
    totalBalance: 0,
    totalEquity: 0,
    totalPnL: 0,
    totalMarginUsed: 0,
    connectedAccounts: 0,
    activePositions: 0
  });

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const stats = accounts.reduce((acc, account) => {
        return {
          totalBalance: acc.totalBalance + (account.balance || 0),
          totalEquity: acc.totalEquity + (account.equity || 0),
          totalPnL: acc.totalPnL + ((account.equity || 0) - (account.balance || 0)),
          totalMarginUsed: acc.totalMarginUsed + (account.margin || 0),
          connectedAccounts: acc.connectedAccounts + (account.is_connected ? 1 : 0),
          activePositions: acc.activePositions + 1 // This would need to come from positions data
        };
      }, {
        totalBalance: 0,
        totalEquity: 0,
        totalPnL: 0,
        totalMarginUsed: 0,
        connectedAccounts: 0,
        activePositions: 0
      });

      setDashboardStats(stats);
    }
  }, [accounts]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
        <OmniaBackground />
        
        {/* Enhanced Header */}
        <header className="relative z-10 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      OMNIA BOT
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Trading Dashboard</p>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center space-x-2">
                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                    <Activity className="w-3 h-3 mr-1" />
                    {dashboardStats.connectedAccounts} Connected
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    Live Data
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Stats Overview */}
        <div className="relative z-10 container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Balance</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {loading ? (
                    <div className="animate-pulse bg-blue-200 h-8 w-24 rounded"></div>
                  ) : (
                    formatCurrency(dashboardStats.totalBalance)
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Across {accounts.length} accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Equity</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {loading ? (
                    <div className="animate-pulse bg-green-200 h-8 w-24 rounded"></div>
                  ) : (
                    formatCurrency(dashboardStats.totalEquity)
                  )}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Current market value
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Unrealized P&L</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${dashboardStats.totalPnL >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {loading ? (
                    <div className="animate-pulse bg-purple-200 h-8 w-24 rounded"></div>
                  ) : (
                    `${dashboardStats.totalPnL >= 0 ? '+' : ''}${formatCurrency(dashboardStats.totalPnL)}`
                  )}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {dashboardStats.totalPnL >= 0 ? 'Profit' : 'Loss'} today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Margin Used</CardTitle>
                <PieChart className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {loading ? (
                    <div className="animate-pulse bg-orange-200 h-8 w-24 rounded"></div>
                  ) : (
                    formatCurrency(dashboardStats.totalMarginUsed)
                  )}
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Risk exposure
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Trading Components */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <ConnectedAccountsCard />
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <MT5TradingInterface />
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <TradingAnalytics />
              </div>
            </div>
            
            {/* Right Column - Notifications and Quick Stats */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <NotificationCenter />
              </div>
              
              {/* Quick Account Status */}
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                          <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : accounts.length > 0 ? (
                    accounts.slice(0, 3).map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {account.account_name || `Account ${account.account_number}`}
                          </p>
                          <p className="text-xs text-gray-500">{account.server}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-gray-900">
                            {formatCurrency(account.balance, account.currency)}
                          </p>
                          <Badge 
                            variant={account.is_connected ? "default" : "secondary"}
                            className={`text-xs ${account.is_connected 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {account.is_connected ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No accounts connected</p>
                      <p className="text-sm">Add your first MT5 account to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;
