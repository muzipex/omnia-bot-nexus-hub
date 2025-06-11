
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Play, 
  Square, 
  Plus, 
  ExternalLink,
  TrendingUp,
  Activity,
  Settings,
  Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mobileMT5Service, MobileTradingBot } from '@/services/mobile-mt5-automation';

const MobileTradingDashboard = () => {
  const [bots, setBots] = useState<MobileTradingBot[]>([]);

  useEffect(() => {
    initializeMobileService();
  }, []);

  const initializeMobileService = async () => {
    await mobileMT5Service.initializeService();
    const loadedBots = await mobileMT5Service.loadBots();
    setBots(loadedBots);
  };

  const handleToggleBot = async (botId: string) => {
    await mobileMT5Service.toggleBot(botId);
    const updatedBots = mobileMT5Service.getBots();
    setBots([...updatedBots]);
    
    const bot = updatedBots.find(b => b.id === botId);
    toast({
      title: `Bot ${bot?.isActive ? 'Started' : 'Stopped'}`,
      description: `${bot?.name} is now ${bot?.isActive ? 'active' : 'inactive'}`,
    });
  };

  const handleAddBot = async () => {
    const newBot: MobileTradingBot = {
      id: Date.now().toString(),
      name: `Bot ${bots.length + 1}`,
      symbol: 'EURUSD',
      strategy: 'scalping',
      isActive: false,
      settings: {
        lotSize: 0.01,
        stopLoss: 50,
        takeProfit: 100,
        maxTrades: 5
      }
    };

    await mobileMT5Service.addBot(newBot);
    setBots(mobileMT5Service.getBots());
    
    toast({
      title: "Bot Added",
      description: `${newBot.name} has been added to your trading bots`,
    });
  };

  const handleOpenMT5 = async () => {
    await mobileMT5Service.openMT5App();
  };

  return (
    <div className="space-y-4">
      {/* Web Trading Status Card */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Web Trading Dashboard
            <Badge variant="default" className="ml-auto bg-green-500">
              ACTIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Active Bots</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {bots.filter(bot => bot.isActive).length}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Total Bots</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{bots.length}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleOpenMT5}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open MT5 WebTrader
            </Button>
            
            <Button
              onClick={handleAddBot}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trading Bots List */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Trading Bots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bots.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No trading bots configured</p>
              <Button
                onClick={handleAddBot}
                className="mt-4 bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bot
              </Button>
            </div>
          ) : (
            bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{bot.name}</h3>
                    <p className="text-gray-400 text-sm">{bot.symbol} • {bot.strategy}</p>
                  </div>
                  <Switch
                    checked={bot.isActive}
                    onCheckedChange={() => handleToggleBot(bot.id)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Lot Size:</span>
                    <span className="text-white ml-2">{bot.settings.lotSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Trades:</span>
                    <span className="text-white ml-2">{bot.settings.maxTrades}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <Badge variant={bot.isActive ? "default" : "secondary"}>
                    {bot.isActive ? 'RUNNING' : 'STOPPED'}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                    >
                      <Bell className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileTradingDashboard;
