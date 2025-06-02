
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Play, Pause, Settings, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const mockBots = [
  {
    id: 1,
    name: 'EUR/USD Scalper',
    status: 'active',
    profit: '+$2,847.32',
    profitPercentage: '+15.2%',
    trades: 147,
    winRate: '82%',
    lastActive: '2 minutes ago'
  },
  {
    id: 2,
    name: 'GBP/JPY Swing',
    status: 'paused',
    profit: '+$1,234.56',
    profitPercentage: '+8.7%',
    trades: 43,
    winRate: '74%',
    lastActive: '1 hour ago'
  },
  {
    id: 3,
    name: 'Gold Trend Follower',
    status: 'learning',
    profit: '-$123.45',
    profitPercentage: '-2.1%',
    trades: 12,
    winRate: '58%',
    lastActive: '5 minutes ago'
  }
];

const BotManagement = () => {
  const [bots, setBots] = useState(mockBots);

  const toggleBot = (id: number) => {
    setBots(bots.map(bot => 
      bot.id === id 
        ? { ...bot, status: bot.status === 'active' ? 'paused' : 'active' }
        : bot
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-tech-green text-tech-dark';
      case 'paused': return 'bg-yellow-500 text-tech-dark';
      case 'learning': return 'bg-tech-blue text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bot Management</h2>
          <p className="text-gray-400">Manage your trading bots and monitor performance</p>
        </div>
        <Button className="bg-tech-blue hover:bg-tech-blue/80">
          <Bot className="w-4 h-4 mr-2" />
          Add New Bot
        </Button>
      </div>

      <div className="grid gap-4">
        {bots.map((bot) => (
          <Card key={bot.id} className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tech-blue/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-tech-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{bot.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                      <span className="text-sm text-gray-400">Last active: {bot.lastActive}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={bot.status === 'active'} 
                    onCheckedChange={() => toggleBot(bot.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Profit</p>
                  <div className="flex items-center gap-1">
                    <p className={`font-semibold ${bot.profit.startsWith('+') ? 'text-tech-green' : 'text-red-400'}`}>
                      {bot.profit}
                    </p>
                    {bot.profit.startsWith('+') ? 
                      <TrendingUp className="w-3 h-3 text-tech-green" /> : 
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    }
                  </div>
                  <p className="text-xs text-gray-500">{bot.profitPercentage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Trades</p>
                  <p className="font-semibold text-white">{bot.trades}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="font-semibold text-white">{bot.winRate}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-tech-blue/30">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BotManagement;
