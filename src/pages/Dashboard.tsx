
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import { useConnectedAccounts } from '@/hooks/use-connected-accounts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  RefreshCw,
  Bot,
  MessageCircle,
  BarChart3,
  Wallet
} from 'lucide-react';

// Component imports
import ConnectedAccountsCard from '@/components/dashboard/ConnectedAccountsCard';
import TradingViewChart from '@/components/dashboard/TradingViewChart';
import MT5PositionsCard from '@/components/dashboard/mt5/MT5PositionsCard';
import TelegramIntegration from '@/components/dashboard/TelegramIntegration';
import BinanceStyleDashboard from '@/components/dashboard/BinanceStyleDashboard';
import AITradingDashboard from '@/components/dashboard/AITradingDashboard';
import { telegramBot } from '@/services/telegram-bot';
import { aiTradingEngine } from '@/services/ai-trading-engine';

interface DashboardMetrics {
  totalBalance: number;
  totalEquity: number;
  totalProfit: number;
  totalMargin: number;
  profitPercentage: number;
  activePositions: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
}

interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { connectedAccounts, refreshAccounts } = useConnectedAccounts();
  const { 
    isConnected: mt5Connected, 
    accountInfo: mt5Account, 
    positions: mt5Positions, 
    connect: connectMT5,
    disconnect: disconnectMT5,
    refreshPositions,
    closeOrder 
  } = useMT5Connection();

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalBalance: 0,
    totalEquity: 0,
    totalProfit: 0,
    totalMargin: 0,
    profitPercentage: 0,
    activePositions: 0,
    dailyPnL: 0,
    weeklyPnL: 0,
    monthlyPnL: 0
  });

  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isAutoTradingActive, setIsAutoTradingActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load dashboard data on mount and set up real-time updates
  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [mt5Connected, connectedAccounts]);

  // Monitor MT5 positions for changes and send notifications
  useEffect(() => {
    if (mt5Positions.length > 0 && mt5Connected) {
      sendTelegramUpdate({
        type: 'account_update',
        message: `You have ${mt5Positions.length} active positions`,
        balance: mt5Account?.balance,
        timestamp: new Date().toISOString()
      });
    }
  }, [mt5Positions.length]);

  const loadDashboardData = async () => {
    setIsLoadingMetrics(true);
    try {
      // Calculate metrics from MT5 data
      const metrics = calculateMetrics();
      setDashboardMetrics(metrics);

      // Load AI trading signals
      await loadTradingSignals();
      
      // Refresh connected accounts
      await refreshAccounts();
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const calculateMetrics = (): DashboardMetrics => {
    if (!mt5Account) {
      return {
        totalBalance: 0,
        totalEquity: 0,
        totalProfit: 0,
        totalMargin: 0,
        profitPercentage: 0,
        activePositions: 0,
        dailyPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0
      };
    }

    const totalProfit = mt5Positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
    const profitPercentage = mt5Account.balance > 0 ? (totalProfit / mt5Account.balance) * 100 : 0;

    return {
      totalBalance: mt5Account.balance || 0,
      totalEquity: mt5Account.equity || 0,
      totalProfit,
      totalMargin: mt5Account.margin || 0,
      profitPercentage,
      activePositions: mt5Positions.length,
      dailyPnL: totalProfit, // Simplified for demo
      weeklyPnL: totalProfit * 1.2, // Simulated
      monthlyPnL: totalProfit * 4.5 // Simulated
    };
  };

  const loadTradingSignals = async () => {
    try {
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];
      const signals = await Promise.all(
        symbols.map(async (symbol) => {
          const analysis = await aiTradingEngine.analyzeMarket(symbol);
          return {
            symbol,
            action: analysis.signal === 'bullish' ? 'BUY' : 'SELL',
            confidence: analysis.confidence || 0.75,
            entry_price: analysis.price || 1.0000,
            stop_loss: analysis.stopLoss || analysis.price * 0.99,
            take_profit: analysis.takeProfit || analysis.price * 1.01,
            risk_level: analysis.confidence > 0.8 ? 'LOW' : analysis.confidence > 0.6 ? 'MEDIUM' : 'HIGH',
            timestamp: new Date().toISOString()
          } as TradingSignal;
        })
      );
      setTradingSignals(signals);
    } catch (error) {
      console.error('Error loading trading signals:', error);
    }
  };

  const setupRealTimeUpdates = async () => {
    try {
      // Subscribe to real-time MT5 data updates
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error setting up real-time updates:', error);
        return;
      }

      // Set up Supabase real-time subscription
      const subscription = supabase
        .channel('dashboard-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'mt5_accounts',
            filter: `user_id=eq.${user?.id}`
          }, 
          (payload) => {
            console.log('Real-time update received:', payload);
            loadDashboardData();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
    }
  };

  const sendTelegramUpdate = async (update: any) => {
    try {
      await telegramBot.sendUpdate(update);
    } catch (error) {
      console.error('Error sending Telegram update:', error);
    }
  };

  const handleAutoTradingToggle = async () => {
    const newState = !isAutoTradingActive;
    setIsAutoTradingActive(newState);
    
    await sendTelegramUpdate({
      type: 'alert',
      message: `Auto trading ${newState ? 'activated' : 'deactivated'}`,
      timestamp: new Date().toISOString()
    });

    toast({
      title: newState ? "Auto Trading Activated" : "Auto Trading Deactivated",
      description: `AI trading bot is now ${newState ? 'running' : 'stopped'}`,
    });
  };

  const handlePositionClose = async (ticket: number, closePrice: number, profit: number) => {
    try {
      await closeOrder(ticket, closePrice, profit);
      
      await sendTelegramUpdate({
        type: 'trade_closed',
        message: `Position #${ticket} closed`,
        profit,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Position Closed",
        description: `Position #${ticket} closed successfully`,
      });
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-tech-dark p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={isLoadingMetrics}
            variant="outline"
            className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleAutoTradingToggle}
            variant={isAutoTradingActive ? "destructive" : "default"}
            className={isAutoTradingActive ? "" : "bg-tech-blue hover:bg-tech-blue/80"}
          >
            <Bot className="w-4 h-4 mr-2" />
            {isAutoTradingActive ? 'Stop' : 'Start'} AI Trading
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(dashboardMetrics.totalBalance)}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-tech-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total P&L</p>
                <p className={`text-2xl font-bold ${dashboardMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(dashboardMetrics.totalProfit)}
                </p>
                <p className={`text-sm ${dashboardMetrics.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dashboardMetrics.profitPercentage >= 0 ? '+' : ''}{dashboardMetrics.profitPercentage.toFixed(2)}%
                </p>
              </div>
              {dashboardMetrics.totalProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Positions</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardMetrics.activePositions}
                </p>
              </div>
              <Activity className="w-8 h-8 text-tech-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Equity</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(dashboardMetrics.totalEquity)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-tech-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-tech-charcoal border-tech-blue/30">
          <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="positions" className="text-gray-300">Positions</TabsTrigger>
          <TabsTrigger value="charts" className="text-gray-300">Charts</TabsTrigger>
          <TabsTrigger value="ai-trading" className="text-gray-300">AI Trading</TabsTrigger>
          <TabsTrigger value="integrations" className="text-gray-300">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConnectedAccountsCard />
            <BinanceStyleDashboard />
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <MT5PositionsCard
            positions={mt5Positions}
            isLoading={isLoadingMetrics}
            isConnected={mt5Connected}
            onRefresh={refreshPositions}
            onCloseOrder={handlePositionClose}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <TradingViewChart height={600} />
        </TabsContent>

        <TabsContent value="ai-trading" className="space-y-4">
          <AITradingDashboard />
          
          {/* Trading Signals */}
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <CardTitle className="text-white">AI Trading Signals</CardTitle>
              <CardDescription className="text-gray-400">
                Latest signals from our AI trading engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingSignals.map((signal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-tech-blue/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={signal.action === 'BUY' ? "default" : "destructive"}>
                        {signal.action}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{signal.symbol}</p>
                        <p className="text-gray-400 text-sm">
                          Confidence: {(signal.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{signal.entry_price.toFixed(5)}</p>
                      <p className="text-gray-400 text-sm">
                        Risk: {signal.risk_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <TelegramIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
