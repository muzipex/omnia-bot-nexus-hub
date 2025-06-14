
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, Eye, EyeOff, Zap, Shield, Brain, Cpu } from 'lucide-react';
import { useMT5Connection } from '@/hooks/use-mt5-connection';

const FuturisticDashboard = () => {
  const {
    isConnected,
    account,
    positions,
    isLoading,
    isAutoTrading,
    bridgeStatus
  } = useMT5Connection();

  const [portfolioData, setPortfolioData] = useState({
    totalBalance: account?.balance || 0,
    totalPnL: 0,
    todayPnL: 0,
    totalPnLPercent: 0,
    todayPnLPercent: 0,
    estimatedValue: account?.equity || 0
  });
  
  const [marketData, setMarketData] = useState<any[]>([]);
  const [hideBalances, setHideBalances] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    if (account) {
      const totalProfit = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
      setPortfolioData(prev => ({
        ...prev,
        totalBalance: account.balance,
        estimatedValue: account.equity,
        totalPnL: totalProfit,
        totalPnLPercent: account.balance > 0 ? (totalProfit / account.balance) * 100 : 0
      }));
    }

    // Generate mock market data for major pairs
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    const mockMarket = symbols.map(symbol => ({
      symbol,
      price: 1.0000 + Math.random() * 0.5,
      change24h: (Math.random() - 0.5) * 0.02,
      volume: Math.floor(Math.random() * 1000000),
      rsi: 30 + Math.random() * 40
    }));
    setMarketData(mockMarket);

    // Generate mock signals
    const mockSignals = symbols.slice(0, 3).map(symbol => ({
      symbol,
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: 0.7 + Math.random() * 0.3,
      entry_price: 1.0000 + Math.random() * 0.5,
      stop_loss: 1.0000 + Math.random() * 0.5 - 0.01,
      take_profit: 1.0000 + Math.random() * 0.5 + 0.01
    }));
    setSignals(mockSignals);
  }, [account, positions]);

  const formatCurrency = (amount: number, hide: boolean = false) => {
    if (hide) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account?.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number, hide: boolean = false) => {
    if (hide) return '**%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                OMNIA AI TRADING
              </h1>
              <p className="text-gray-400">Next-Generation Trading Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className={`${isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'} text-white border-0`}
            >
              {isConnected ? 'CONNECTED' : 'OFFLINE'}
            </Badge>
            {isAutoTrading && (
              <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-0 animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                AI ACTIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-purple-900/30 border border-cyan-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                Portfolio Command Center
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideBalances(!hideBalances)}
                className="text-gray-400 hover:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10"
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-cyan-400 text-sm font-medium">Total Balance</p>
                  <p className="text-4xl font-black text-white">
                    {formatCurrency(portfolioData.totalBalance, hideBalances)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={portfolioData.totalPnLPercent >= 0 ? "default" : "destructive"}
                      className={`${portfolioData.totalPnLPercent >= 0 ? "bg-green-600" : "bg-red-600"} border-0`}
                    >
                      {portfolioData.totalPnLPercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercent(portfolioData.totalPnLPercent, hideBalances)}
                    </Badge>
                    <span className={`text-sm ${portfolioData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(portfolioData.totalPnL, hideBalances)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-purple-400 text-sm font-medium">Equity</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(portfolioData.estimatedValue, hideBalances)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white border-0">
                      <Activity className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-cyan-500/20">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-cyan-400 text-xs">FREE MARGIN</p>
                    <p className="text-white font-bold">{formatCurrency(account?.free_margin || 0, hideBalances)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 text-xs">MARGIN LEVEL</p>
                    <p className="text-white font-bold">{account?.margin_level?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 text-xs">LEVERAGE</p>
                    <p className="text-white font-bold">1:{account?.leverage || 100}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-gray-800/50 to-cyan-900/30 border border-cyan-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 text-sm">Active Positions</p>
                    <p className="text-2xl font-bold text-white">{positions.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-800/50 to-green-900/30 border border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm">Bridge Status</p>
                    <p className="text-2xl font-bold text-white">
                      {bridgeStatus.serverRunning ? 'ONLINE' : 'OFFLINE'}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bridgeStatus.serverRunning ? 'bg-green-500' : 'bg-red-500'}`}>
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm">AI Confidence</p>
                    <p className="text-2xl font-bold text-white">
                      {signals.length > 0 ? `${(signals[0].confidence * 100).toFixed(0)}%` : '0%'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Data & AI Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Overview */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-blue-900/30 border border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                Live Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.map((market, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/30 to-blue-900/20 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{market.symbol.slice(0, 3)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{market.symbol}</p>
                        <p className="text-blue-400 text-sm">
                          RSI: {market.rsi?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{market.price.toFixed(5)}</p>
                      <div className="flex items-center gap-1">
                        {market.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-sm ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(market.change24h * 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Signals */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Neural Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signals.map((signal, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-gray-800/30 to-purple-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">{signal.symbol}</span>
                      <Badge 
                        variant={signal.action === 'BUY' ? 'default' : 'destructive'}
                        className={`${signal.action === 'BUY' ? 'bg-green-600' : 'bg-red-600'} border-0`}
                      >
                        {signal.action}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-400">Neural Confidence</span>
                        <span className="text-white">{(signal.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={signal.confidence * 100} 
                        className="h-2 bg-gray-700"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry</span>
                          <span className="text-cyan-400">{signal.entry_price.toFixed(5)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Target</span>
                          <span className="text-green-400">{signal.take_profit.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="bg-gradient-to-br from-red-900/50 to-orange-900/30 border border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connection Required</h3>
              <p className="text-gray-400 mb-4">
                Connect to your MT5 bridge to access real-time trading data
              </p>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 hover:from-red-600 hover:to-orange-600">
                Connect Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FuturisticDashboard;
