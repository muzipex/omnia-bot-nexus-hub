
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, TrendingUp, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'trade' | 'alert' | 'system' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Generate some mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'trade',
        title: 'Trade Executed',
        message: 'BUY EURUSD position opened at 1.0532',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        type: 'alert',
        title: 'Risk Alert',
        message: 'Portfolio exposure reached 75% of maximum limit',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Profit Target Hit',
        message: 'GBPUSD trade closed with +$234.50 profit',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        type: 'system',
        title: 'System Update',
        message: 'Trading algorithms updated to v2.1.3',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('OMNIA AI Trading', {
            body: 'Welcome to your trading dashboard',
            icon: '/favicon.ico'
          });
        }
      });
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'system':
        return <Settings className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white text-lg">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                notification.read
                  ? 'bg-gray-800/50 border-gray-700/50'
                  : 'bg-purple-900/20 border-purple-500/30 shadow-lg shadow-purple-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${
                        notification.read ? 'text-gray-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      notification.read ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
