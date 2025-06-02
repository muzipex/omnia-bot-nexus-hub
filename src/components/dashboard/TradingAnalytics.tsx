
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Jan', profit: 2400, trades: 24 },
  { name: 'Feb', profit: 1398, trades: 18 },
  { name: 'Mar', profit: 9800, trades: 32 },
  { name: 'Apr', profit: 3908, trades: 28 },
  { name: 'May', profit: 4800, trades: 35 },
  { name: 'Jun', profit: 3800, trades: 30 },
];

const TradingAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-tech-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$45,231.89</div>
            <p className="text-xs text-gray-400">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-tech-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">78.5%</div>
            <p className="text-xs text-gray-400">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-tech-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,847</div>
            <p className="text-xs text-gray-400">+180 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Bots</CardTitle>
            <TrendingUp className="h-4 w-4 text-tech-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-gray-400">2 profitable, 1 learning</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white">Profit Trend</CardTitle>
          <CardDescription className="text-gray-400">
            Your trading performance over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingAnalytics;
