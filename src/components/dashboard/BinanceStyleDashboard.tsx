
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, Eye, EyeOff } from 'lucide-react';
import { aiTradingEngine } from '@/services/ai-trading-engine';

const BinanceStyleDashboard = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalBalance: 15247.82,
    totalPnL: 2341.67,
    todayPnL: 156.23,
    totalPnLPercent: 18.15,
    todayPnLPercent: 1.04,
    estimatedValue: 15403.96
  });
  
  const [marketData, setMarketData] = useState<any[]>([]);
  const [hideBalances, setHideBalances] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    // Load AI signals
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    const newSignals = await Promise.all(
      symbols.map(symbol => aiTradingEngine.analyzeMarket(symbol))
    );
    setSignals(newSignals);

    // Simulate market data
    const market = symbols.map(symbol => {
      const data = aiTradingEngine.getMarketData(symbol);
      return {
        symbol,
        price: data?.price || 1.0000,
        change24h: data?.change24h || 0,
        volume: data?.volume || 0,
        indicators: aiTradingEngine.getTechnicalIndicators(symbol)
      };
    });
    setMarketData(market);

    // Update portfolio with slight variations
    setPortfolioData(prev => ({
      ...prev,
      totalBalance: prev.totalBalance + (Math.random() - 0.5) * 100,
      todayPnL: prev.todayPnL + (Math.random() - 0.5) * 50,
      todayPnLPercent: (Math.random() - 0.5) * 2,
    }));
  };

  const formatCurrency = (amount: number, hide: boolean = false) => {
    if (hide) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number, hide: boolean = false) => {
    if (hide) return '**%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-500" />
              Portfolio Overview
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
              className="text-gray-400 hover:text-white"
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(portfolioData.totalBalance, hideBalances)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={portfolioData.totalPnLPercent >= 0 ? "default" : "destructive"}
                    className={portfolioData.totalPnLPercent >= 0 ? "bg-green-600" : ""}
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
                <p className="text-gray-400 text-sm">Today's P&L</p>
                <p className={`text-2xl font-bold ${portfolioData.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(portfolioData.todayPnL, hideBalances)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={portfolioData.todayPnLPercent >= 0 ? "default" : "destructive"}
                    className={portfolioData.todayPnLPercent >= 0 ? "bg-green-600" : ""}
                  >
                    {portfolioData.todayPnLPercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {formatPercent(portfolioData.todayPnLPercent, hideBalances)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Value</span>
                <span className="text-white font-medium">
                  {formatCurrency(portfolioData.estimatedValue, hideBalances)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Positions</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">78.5%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Confidence</p>
                  <p className="text-2xl font-bold text-purple-400">92%</p>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Market Data & AI Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Overview */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((market, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{market.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{market.symbol}</p>
                      <p className="text-gray-400 text-sm">
                        RSI: {market.indicators?.rsi?.toFixed(1) || 'N/A'}
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
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              Live AI Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.slice(0, 4).map((signal, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{signal.symbol}</span>
                    <Badge 
                      variant={signal.action === 'BUY' ? 'default' : signal.action === 'SELL' ? 'destructive' : 'secondary'}
                      className={signal.action === 'BUY' ? 'bg-green-600' : ''}
                    >
                      {signal.action}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Confidence</span>
                      <span className="text-white">{(signal.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={signal.confidence * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Entry</span>
                      <span className="text-white">{signal.entry_price.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BinanceStyleDashboard;
