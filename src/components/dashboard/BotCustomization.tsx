
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, TrendingUp, Shield, Zap, Brain, Save, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BotConfig {
  name: string;
  strategy: string;
  riskLevel: number;
  maxLotSize: number;
  stopLoss: number;
  takeProfit: number;
  maxTrades: number;
  tradingHours: {
    start: string;
    end: string;
  };
  symbols: string[];
  isActive: boolean;
  aiMode: boolean;
  aggressiveness: number;
}

const BotCustomization = () => {
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: 'AI Scalper Pro',
    strategy: 'neural_scalping',
    riskLevel: 3,
    maxLotSize: 0.1,
    stopLoss: 20,
    takeProfit: 40,
    maxTrades: 5,
    tradingHours: {
      start: '08:00',
      end: '18:00'
    },
    symbols: ['EURUSD', 'GBPUSD'],
    isActive: true,
    aiMode: true,
    aggressiveness: 5
  });

  const [savedConfigs, setSavedConfigs] = useState([
    { id: 1, name: 'Conservative Trader', strategy: 'trend_following' },
    { id: 2, name: 'Aggressive Scalper', strategy: 'neural_scalping' },
    { id: 3, name: 'Night Trader', strategy: 'breakout_hunter' }
  ]);

  const strategies = [
    { value: 'neural_scalping', label: 'Neural Scalping', description: 'AI-powered micro trades' },
    { value: 'trend_following', label: 'Trend Following', description: 'Follow market trends' },
    { value: 'breakout_hunter', label: 'Breakout Hunter', description: 'Capture price breakouts' },
    { value: 'mean_reversion', label: 'Mean Reversion', description: 'Counter-trend strategy' },
    { value: 'grid_trading', label: 'Grid Trading', description: 'Multiple order levels' }
  ];

  const availableSymbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'XAUUSD', 'XAGUSD', 'US30', 'NAS100'
  ];

  const updateConfig = (key: keyof BotConfig, value: any) => {
    setBotConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateTradingHours = (type: 'start' | 'end', value: string) => {
    setBotConfig(prev => ({
      ...prev,
      tradingHours: { ...prev.tradingHours, [type]: value }
    }));
  };

  const toggleSymbol = (symbol: string) => {
    setBotConfig(prev => ({
      ...prev,
      symbols: prev.symbols.includes(symbol)
        ? prev.symbols.filter(s => s !== symbol)
        : [...prev.symbols, symbol]
    }));
  };

  const saveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: `Bot "${botConfig.name}" settings have been saved successfully.`
    });
  };

  const resetToDefaults = () => {
    setBotConfig({
      name: 'AI Scalper Pro',
      strategy: 'neural_scalping',
      riskLevel: 3,
      maxLotSize: 0.1,
      stopLoss: 20,
      takeProfit: 40,
      maxTrades: 5,
      tradingHours: { start: '08:00', end: '18:00' },
      symbols: ['EURUSD', 'GBPUSD'],
      isActive: true,
      aiMode: true,
      aggressiveness: 5
    });
    toast({
      title: "Reset Complete",
      description: "Bot configuration has been reset to default values."
    });
  };

  const getRiskLevelColor = (level: number) => {
    if (level <= 2) return 'text-green-400';
    if (level <= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevelText = (level: number) => {
    if (level <= 2) return 'Conservative';
    if (level <= 4) return 'Moderate';
    return 'Aggressive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bot Customization</h2>
            <p className="text-gray-400">Configure your AI trading bot settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline" className="border-gray-600 text-gray-300">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfiguration} className="bg-gradient-to-r from-purple-600 to-cyan-600">
            <Save className="w-4 h-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-purple-500/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-purple-600">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-purple-600">
            <Shield className="w-4 h-4 mr-2" />
            Risk
          </TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Basic bot configuration and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Bot Name</Label>
                  <Input
                    value={botConfig.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Trading Strategy</Label>
                  <Select value={botConfig.strategy} onValueChange={(value) => updateConfig('strategy', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.value} value={strategy.value} className="text-white">
                          <div>
                            <div className="font-medium">{strategy.label}</div>
                            <div className="text-xs text-gray-400">{strategy.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <Label className="text-white">Bot Active</Label>
                  <p className="text-sm text-gray-400">Enable/disable bot trading</p>
                </div>
                <Switch
                  checked={botConfig.isActive}
                  onCheckedChange={(checked) => updateConfig('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Risk Management</CardTitle>
              <CardDescription className="text-gray-400">
                Configure risk parameters and position sizing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">Risk Level</Label>
                    <Badge className={getRiskLevelColor(botConfig.riskLevel)}>
                      {getRiskLevelText(botConfig.riskLevel)}
                    </Badge>
                  </div>
                  <Slider
                    value={[botConfig.riskLevel]}
                    onValueChange={(value) => updateConfig('riskLevel', value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Lot Size</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={botConfig.maxLotSize}
                      onChange={(e) => updateConfig('maxLotSize', parseFloat(e.target.value))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Stop Loss (pips)</Label>
                    <Input
                      type="number"
                      value={botConfig.stopLoss}
                      onChange={(e) => updateConfig('stopLoss', parseInt(e.target.value))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Take Profit (pips)</Label>
                    <Input
                      type="number"
                      value={botConfig.takeProfit}
                      onChange={(e) => updateConfig('takeProfit', parseInt(e.target.value))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Trading Parameters</CardTitle>
              <CardDescription className="text-gray-400">
                Configure trading hours, symbols, and execution settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Max Concurrent Trades</Label>
                  <Input
                    type="number"
                    value={botConfig.maxTrades}
                    onChange={(e) => updateConfig('maxTrades', parseInt(e.target.value))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Trading Start</Label>
                  <Input
                    type="time"
                    value={botConfig.tradingHours.start}
                    onChange={(e) => updateTradingHours('start', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Trading End</Label>
                  <Input
                    type="time"
                    value={botConfig.tradingHours.end}
                    onChange={(e) => updateTradingHours('end', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Trading Symbols</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableSymbols.map((symbol) => (
                    <Button
                      key={symbol}
                      variant={botConfig.symbols.includes(symbol) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSymbol(symbol)}
                      className={`${
                        botConfig.symbols.includes(symbol)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Advanced AI and machine learning settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <Label className="text-white">AI Mode</Label>
                  <p className="text-sm text-gray-400">Enable advanced AI decision making</p>
                </div>
                <Switch
                  checked={botConfig.aiMode}
                  onCheckedChange={(checked) => updateConfig('aiMode', checked)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">AI Aggressiveness</Label>
                    <Badge variant="outline" className="border-purple-500 text-purple-300">
                      Level {botConfig.aggressiveness}
                    </Badge>
                  </div>
                  <Slider
                    value={[botConfig.aggressiveness]}
                    onValueChange={(value) => updateConfig('aggressiveness', value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                    disabled={!botConfig.aiMode}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-medium mb-2">Neural Network</h4>
                    <p className="text-sm text-gray-400">Advanced pattern recognition for market analysis</p>
                    <Badge className="mt-2 bg-green-600">Active</Badge>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="text-white font-medium mb-2">Sentiment Analysis</h4>
                    <p className="text-sm text-gray-400">Real-time market sentiment processing</p>
                    <Badge className="mt-2 bg-blue-600">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BotCustomization;
