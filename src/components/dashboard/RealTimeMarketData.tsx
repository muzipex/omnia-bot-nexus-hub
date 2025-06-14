
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketTick {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

const RealTimeMarketData = () => {
  const [marketData, setMarketData] = useState<MarketTick[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time market data
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'];
    
    const generateTick = (symbol: string): MarketTick => {
      const basePrice = 1.0000 + Math.random() * 0.5;
      const spread = 0.0001 + Math.random() * 0.0003;
      const change = (Math.random() - 0.5) * 0.01;
      
      return {
        symbol,
        bid: basePrice,
        ask: basePrice + spread,
        spread: spread * 10000, // in pips
        change,
        changePercent: (change / basePrice) * 100,
        volume: Math.floor(Math.random() * 10000),
        timestamp: new Date()
      };
    };

    const updateMarketData = () => {
      const newData = symbols.map(generateTick);
      setMarketData(newData);
    };

    setIsConnected(true);
    updateMarketData();
    
    const interval = setInterval(updateMarketData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price.toFixed(5);
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(5)}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Live Market Feed
        </CardTitle>
        <Badge className={`${isConnected ? 'bg-green-600' : 'bg-red-600'} text-white animate-pulse`}>
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {marketData.map((tick) => (
            <div
              key={tick.symbol}
              className="p-3 bg-gradient-to-r from-gray-800/50 to-purple-900/20 rounded-lg border border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{tick.symbol.slice(0, 3)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{tick.symbol}</h4>
                    <p className="text-xs text-gray-400">Spread: {tick.spread.toFixed(1)} pips</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-2 text-sm">
                    <span className="text-blue-400">BID: {formatPrice(tick.bid)}</span>
                    <span className="text-orange-400">ASK: {formatPrice(tick.ask)}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    {tick.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs ${tick.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatChange(tick.change)} ({formatPercent(tick.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMarketData;
