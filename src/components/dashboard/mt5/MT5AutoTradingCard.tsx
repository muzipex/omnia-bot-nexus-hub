
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

const TRADING_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'BTCUSD', 'ETHUSD', 'XAUUSD', 'XAGUSD', 'USOIL', 'UK100', 'US30', 'NAS100'
];

interface MT5AutoTradingCardProps {
  isConnected: boolean;
  isLoading: boolean;
  isAutoTrading: boolean;
  onStartAutoTrading: (settings: any) => Promise<void>;
  onStopAutoTrading: () => Promise<void>;
}

const MT5AutoTradingCard = ({ 
  isConnected, 
  isLoading, 
  isAutoTrading, 
  onStartAutoTrading, 
  onStopAutoTrading 
}: MT5AutoTradingCardProps) => {
  const [autoTradingSettings, setAutoTradingSettings] = useState({
    symbol: 'EURUSD',
    lot_size: 0.01,
    stop_loss_pips: 50,
    take_profit_pips: 100,
    max_trades: 5,
    trading_strategy: 'scalping'
  });

  const handleStartAutoTrading = async () => {
    await onStartAutoTrading(autoTradingSettings);
  };

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Automated Trading Bot
          {isAutoTrading && (
            <Badge variant="secondary" className="bg-green-500 ml-auto">
              <Bot className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure and start automated trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="symbol" className="text-gray-300">Trading Symbol</Label>
            <Select 
              value={autoTradingSettings.symbol} 
              onValueChange={(value) => setAutoTradingSettings(prev => ({ ...prev, symbol: value }))}
            >
              <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADING_SYMBOLS.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lot_size" className="text-gray-300">Lot Size</Label>
            <Input
              id="lot_size"
              type="number"
              step="0.01"
              min="0.01"
              value={autoTradingSettings.lot_size}
              onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, lot_size: parseFloat(e.target.value) || 0.01 }))}
              className="bg-tech-dark border-tech-blue/30 text-white"
            />
          </div>
          <div>
            <Label htmlFor="stop_loss_pips" className="text-gray-300">Stop Loss (Pips)</Label>
            <Input
              id="stop_loss_pips"
              type="number"
              value={autoTradingSettings.stop_loss_pips}
              onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, stop_loss_pips: parseInt(e.target.value) || 50 }))}
              className="bg-tech-dark border-tech-blue/30 text-white"
            />
          </div>
          <div>
            <Label htmlFor="take_profit_pips" className="text-gray-300">Take Profit (Pips)</Label>
            <Input
              id="take_profit_pips"
              type="number"
              value={autoTradingSettings.take_profit_pips}
              onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, take_profit_pips: parseInt(e.target.value) || 100 }))}
              className="bg-tech-dark border-tech-blue/30 text-white"
            />
          </div>
          <div>
            <Label htmlFor="max_trades" className="text-gray-300">Max Concurrent Trades</Label>
            <Input
              id="max_trades"
              type="number"
              min="1"
              max="10"
              value={autoTradingSettings.max_trades}
              onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, max_trades: parseInt(e.target.value) || 5 }))}
              className="bg-tech-dark border-tech-blue/30 text-white"
            />
          </div>
          <div>
            <Label htmlFor="trading_strategy" className="text-gray-300">Trading Strategy</Label>
            <Select 
              value={autoTradingSettings.trading_strategy} 
              onValueChange={(value) => setAutoTradingSettings(prev => ({ ...prev, trading_strategy: value }))}
            >
              <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scalping">Scalping</SelectItem>
                <SelectItem value="trend_following">Trend Following</SelectItem>
                <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                <SelectItem value="breakout">Breakout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-4 pt-4">
          {!isAutoTrading ? (
            <Button 
              onClick={handleStartAutoTrading}
              disabled={!isConnected || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Bot className="w-4 h-4 mr-2" />
              Start Auto Trading
            </Button>
          ) : (
            <Button 
              onClick={onStopAutoTrading}
              disabled={isLoading}
              variant="destructive"
            >
              Stop Auto Trading
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MT5AutoTradingCard;
