
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, DollarSign } from 'lucide-react';

interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

const PerformanceAnalytics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    avgWin: 0,
    avgLoss: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [symbolDistribution, setSymbolDistribution] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock performance data
    setMetrics({
      totalTrades: 127,
      winRate: 68.5,
      profitFactor: 1.85,
      sharpeRatio: 1.42,
      maxDrawdown: 8.3,
      avgWin: 124.50,
      avgLoss: -87.20,
      consecutiveWins: 7,
      consecutiveLosses: 3
    });

    // Generate monthly P&L data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyPnL = months.map(month => ({
      month,
      profit: (Math.random() - 0.3) * 5000,
      trades: Math.floor(Math.random() * 30) + 10
    }));
    setMonthlyData(monthlyPnL);

    // Generate symbol distribution
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    const distribution = symbols.map((symbol, index) => ({
      symbol,
      trades: Math.floor(Math.random() * 30) + 5,
      profit: (Math.random() - 0.4) * 2000,
      color: ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981'][index]
    }));
    setSymbolDistribution(distribution);
  }, []);

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMetricColor = (value: number, threshold: number, reverse: boolean = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-purple-900/20 rounded-lg">
              <p className="text-purple-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-white">{metrics.totalTrades}</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-green-900/20 rounded-lg">
              <p className="text-green-400 text-sm">Win Rate</p>
              <p className={`text-2xl font-bold ${getWinRateColor(metrics.winRate)}`}>
                {metrics.winRate.toFixed(1)}%
              </p>
              <Progress value={metrics.winRate} className="mt-2 h-2" />
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-blue-900/20 rounded-lg">
              <p className="text-blue-400 text-sm">Profit Factor</p>
              <p className={`text-2xl font-bold ${getMetricColor(metrics.profitFactor, 1.5)}`}>
                {metrics.profitFactor.toFixed(2)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-cyan-900/20 rounded-lg">
              <p className="text-cyan-400 text-sm">Sharpe Ratio</p>
              <p className={`text-2xl font-bold ${getMetricColor(metrics.sharpeRatio, 1.0)}`}>
                {metrics.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Max Drawdown</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.maxDrawdown, 10, true)}`}>
                {metrics.maxDrawdown.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">Avg Win</p>
              <p className="text-lg font-bold text-green-400">
                ${metrics.avgWin.toFixed(2)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">Avg Loss</p>
              <p className="text-lg font-bold text-red-400">
                ${metrics.avgLoss.toFixed(2)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">Best Streak</p>
              <p className="text-lg font-bold text-green-400">
                {metrics.consecutiveWins} wins
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly P&L Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #4B5563',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Symbol Distribution */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Trading Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={symbolDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="trades"
                    label={({ symbol, trades }) => `${symbol}: ${trades}`}
                  >
                    {symbolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
