
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  DollarSign, 
  Download, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  Server
} from 'lucide-react';

interface AdminOverviewCardsProps {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    bridgeDownloads: number;
    telegramConnections: number;
    criticalIssues: number;
    monthlyGrowth: number;
    serverUptime: number;
  };
}

const AdminOverviewCards: React.FC<AdminOverviewCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-tech-blue',
      bgColor: 'bg-tech-blue/10'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: Activity,
      color: 'text-tech-green',
      bgColor: 'bg-tech-green/10'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-tech-purple',
      bgColor: 'bg-tech-purple/10'
    },
    {
      title: 'Bridge Downloads',
      value: stats.bridgeDownloads.toLocaleString(),
      icon: Download,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    },
    {
      title: 'Telegram Connections',
      value: stats.telegramConnections.toLocaleString(),
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Critical Issues',
      value: stats.criticalIssues.toString(),
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      title: 'Monthly Growth',
      value: `+${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10'
    },
    {
      title: 'Server Uptime',
      value: `${stats.serverUptime}%`,
      icon: Server,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="bg-tech-charcoal border-tech-blue/30 hover:border-tech-blue/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-white ${card.title === 'Critical Issues' && stats.criticalIssues > 0 ? 'text-red-400' : ''}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminOverviewCards;
