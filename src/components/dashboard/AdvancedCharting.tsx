
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Maximize2, Settings } from 'lucide-react';

interface ChartData {
  time: string;
  price: number;
  ma20: number;
  ma50: number;
  rsi: number;
  volume: number;
}

const AdvancedCharting = () => {
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('H1');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [indicators, setIndicators] = useState({
    ma20: true,
    ma50: true,
    rsi: false,
    bollinger: false
  });

  useEffect(() => {
    // Generate mock chart data
    const generateChartData = () => {
      const data: ChartData[] = [];
      let basePrice = 1.0850;
      
      for (let i = 0; i < 100; i++) {
        const time = new Date(Date.now() - (100 - i) * 3600000).toLocaleTimeString();
        const priceChange = (Math.random() - 0.5) * 0.002;
        basePrice += priceChange;
        
        data.push({
          time,
          price: basePrice,
          ma20: basePrice + (Math.random() - 0.5) * 0.001,
          ma50: basePrice + (Math.random() - 0.5) * 0.0015,
          rsi: 30 + Math.random() * 40,
          volume: Math.floor(Math.random() * 1000)
        });
      }
      
      return data;
    };

    setChartData(generateChartData());
  }, [symbol, timeframe]);

  const toggleIndicator = (indicator: string) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Advanced Charts
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="EURUSD">EUR/USD</SelectItem>
              <SelectItem value="GBPUSD">GBP/USD</SelectItem>
              <SelectItem value="USDJPY">USD/JPY</SelectItem>
              <SelectItem value="AUDUSD">AUD/USD</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="M1">1M</SelectItem>
              <SelectItem value="M5">5M</SelectItem>
              <SelectItem value="M15">15M</SelectItem>
              <SelectItem value="H1">1H</SelectItem>
              <SelectItem value="H4">4H</SelectItem>
              <SelectItem value="D1">1D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(indicators).map(([key, enabled]) => (
            <Button
              key={key}
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={() => toggleIndicator(key)}
              className={`text-xs ${enabled ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-300'}`}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                domain={['dataMin - 0.001', 'dataMax + 0.001']}
                tickFormatter={(value) => value.toFixed(4)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #4B5563',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#06B6D4" 
                strokeWidth={2}
                dot={false}
                name="Price"
              />
              
              {indicators.ma20 && (
                <Line 
                  type="monotone" 
                  dataKey="ma20" 
                  stroke="#F59E0B" 
                  strokeWidth={1}
                  dot={false}
                  name="MA 20"
                />
              )}
              
              {indicators.ma50 && (
                <Line 
                  type="monotone" 
                  dataKey="ma50" 
                  stroke="#EF4444" 
                  strokeWidth={1}
                  dot={false}
                  name="MA 50"
                />
              )}
              
              <ReferenceLine y={1.0850} stroke="#8B5CF6" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCharting;
