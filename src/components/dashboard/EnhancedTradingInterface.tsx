
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Shield, Activity, Zap, Brain } from 'lucide-react';
import RealTimeMarketData from './RealTimeMarketData';
import AdvancedCharting from './AdvancedCharting';
import PerformanceAnalytics from './PerformanceAnalytics';
import RiskManagementDashboard from './RiskManagementDashboard';
import { useMT5Connection } from '@/hooks/use-mt5-connection';

const EnhancedTradingInterface = () => {
  const [activeStrategy, setActiveStrategy] = useState('neural_scalper');
  const { isConnected, isAutoTrading, startAutoTrading, stopAutoTrading } = useMT5Connection();

  const strategies = [
    { id: 'neural_scalper', name: 'Neural Scalper', status: 'active', winRate: 78.5 },
    { id: 'trend_follower', name: 'Trend Follower', status: 'inactive', winRate: 65.2 },
    { id: 'breakout_hunter', name: 'Breakout Hunter', status: 'inactive', winRate: 71.8 },
    { id: 'mean_reversion', name: 'Mean Reversion', status: 'inactive', winRate: 69.4 }
  ];

  const toggleStrategy = (strategyId: string) => {
    setActiveStrategy(strategyId);
    if (isAutoTrading) {
      stopAutoTrading();
      setTimeout(() => startAutoTrading(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="space-y-6">
        {/* Header with Strategy Selection */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                AI Trading Strategies
              </CardTitle>
              <Badge className={`${isConnected ? 'bg-green-600' : 'bg-red-600'} text-white animate-pulse`}>
                {isConnected ? 'CONNECTED' : 'OFFLINE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {strategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeStrategy === strategy.id
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 border-purple-400'
                      : 'bg-gray-800/50 border-gray-600 hover:border-purple-500'
                  }`}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="text-white font-medium text-sm">{strategy.name}</h3>
                    <p className="text-gray-300 text-xs mt-1">Win Rate: {strategy.winRate}%</p>
                    <Badge 
                      className={`mt-2 ${
                        activeStrategy === strategy.id ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'
                      }`}
                    >
                      {activeStrategy === strategy.id ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button
                onClick={isAutoTrading ? stopAutoTrading : startAutoTrading}
                className={`${
                  isAutoTrading 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700'
                } text-white`}
                disabled={!isConnected}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isAutoTrading ? 'Stop AI Trading' : 'Start AI Trading'}
              </Button>
              
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Activity className="w-4 h-4 mr-2" />
                Strategy Optimizer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Trading Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/30 border border-white/10 backdrop-blur-sm p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300"
            >
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger 
              value="market" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-gray-300"
            >
              Live Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdvancedCharting />
              </div>
              <div>
                <RealTimeMarketData />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <AdvancedCharting />
          </TabsContent>

          <TabsContent value="analytics">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="risk">
            <RiskManagementDashboard />
          </TabsContent>

          <TabsContent value="market">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealTimeMarketData />
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Market News & Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-gray-800/50 to-blue-900/20 rounded-lg">
                    <h4 className="text-white font-medium">USD Strengthens on Fed Minutes</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Federal Reserve meeting minutes show hawkish sentiment...
                    </p>
                    <Badge className="mt-2 bg-green-600 text-white">BULLISH USD</Badge>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-gray-800/50 to-red-900/20 rounded-lg">
                    <h4 className="text-white font-medium">EUR Under Pressure</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      ECB dovish stance weighs on Euro sentiment...
                    </p>
                    <Badge className="mt-2 bg-red-600 text-white">BEARISH EUR</Badge>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-gray-800/50 to-yellow-900/20 rounded-lg">
                    <h4 className="text-white font-medium">Market Sentiment</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Fear & Greed Index</span>
                      <span className="text-yellow-400 font-bold">52 (Neutral)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedTradingInterface;
