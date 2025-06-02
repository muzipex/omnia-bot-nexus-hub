
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Trade Executed Successfully',
    message: 'EUR/USD position closed with +$247.50 profit',
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Low Balance Alert',
    message: 'Account balance is below recommended minimum for Gold Trend Follower bot',
    time: '15 minutes ago',
    read: false
  },
  {
    id: 3,
    type: 'info',
    title: 'Bot Status Update',
    message: 'GBP/JPY Swing bot has been paused due to high volatility',
    time: '1 hour ago',
    read: true
  },
  {
    id: 4,
    type: 'success',
    title: 'Weekly Report Ready',
    message: 'Your weekly trading performance report is now available',
    time: '2 hours ago',
    read: true
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-tech-green" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-tech-blue" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-tech-green text-tech-dark">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-400">Stay updated with your trading activity</p>
        </div>
        <Button 
          variant="outline" 
          className="border-tech-blue/30"
          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
        >
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`bg-tech-charcoal border-tech-blue/30 transition-all hover:border-tech-blue/50 ${
              !notification.read ? 'border-l-4 border-l-tech-blue' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 hover:bg-red-500/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
            <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
