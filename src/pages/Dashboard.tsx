
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';
import ConnectedAccountsCard from '@/components/dashboard/ConnectedAccountsCard';
import MT5TradingInterface from '@/components/dashboard/MT5TradingInterface';
import TradingAnalytics from '@/components/dashboard/TradingAnalytics';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User } from 'lucide-react';
import HealthSummaryCard from '@/components/dashboard/HealthSummaryCard';
import TradeJournalCard from '@/components/dashboard/TradeJournalCard';
import RiskControlCard from '@/components/dashboard/RiskControlCard';
import MultiAccountCard from '@/components/dashboard/MultiAccountCard';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Risk control demo state -- ideally persisted in Supabase for real
  const [maxDailyLoss, setMaxDailyLoss] = React.useState(1000);
  const [todayPnL, setTodayPnL] = React.useState(0); // Would normally be calculated by summing trades for today.
  const [tradingLocked, setTradingLocked] = React.useState(false);

  // For multiple connected accounts and positions, assume context/hook provides it (show mock/demo for now)
  const accounts = [
    { account_number: 123456, server: "DemoServer", currency: "USD", balance: 15230.35 },
    { account_number: 654321, server: "LiveServer", currency: "USD", balance: 9734.10 }
  ];
  const positions = [
    { ticket: 101, symbol: "EURUSD", trade_type: "BUY", volume: 1 },
    { ticket: 102, symbol: "GBPUSD", trade_type: "SELL", volume: 2 }
  ];
  const bridgeStatus = { serverRunning: true, mt5Connected: true, autoTradingActive: false };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen grid-bg noise-effect relative">
        
        {/* Header */}
        <header className="relative z-10 border-b border-tech-blue/20 bg-tech-dark/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-black text-white">OMNIA BOT</h1>
                <Badge variant="outline" className="border-tech-blue/30 text-gray-300">
                  Dashboard
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-tech-blue/30 text-gray-300 hover:bg-tech-charcoal/50 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-tech-blue/30 text-gray-300 hover:bg-tech-charcoal/50 hover:text-white"
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
              <HealthSummaryCard status={bridgeStatus} />
              <MultiAccountCard accounts={accounts} />
              <RiskControlCard
                maxDailyLoss={maxDailyLoss}
                setMaxDailyLoss={setMaxDailyLoss}
                todayPnL={todayPnL}
                tradingLocked={tradingLocked}
                setTradingLocked={setTradingLocked}
              />
              <TradeJournalCard positions={positions} />
              <ConnectedAccountsCard />
              <MT5TradingInterface />
              <TradingAnalytics />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <SubscriptionStatusCard />
              <NotificationCenter />
            </div>
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
};

export default Dashboard;
