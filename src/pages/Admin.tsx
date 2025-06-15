import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, MessageSquare, Shield, AlertTriangle } from 'lucide-react';
import TelegramIntegration from '@/components/dashboard/TelegramIntegration';
import AdminOverviewCards from '@/components/admin/AdminOverviewCards';
import AdminLoginForm from '@/components/auth/AdminLoginForm';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { admin, logout, loading } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    bridgeDownloads: 0,
    telegramConnections: 0,
    criticalIssues: 0,
    monthlyGrowth: 0,
    serverUptime: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin.isAuthenticated) {
      loadAdminData();
    }
  // eslint-disable-next-line
  }, [admin.isAuthenticated]);

  const loadAdminData = async () => {
    setLoading(true);
    setStats({
      totalUsers: 2547,
      activeSubscriptions: 1823,
      totalRevenue: 45670,
      bridgeDownloads: 892,
      telegramConnections: 456,
      criticalIssues: 3,
      monthlyGrowth: 12.5,
      serverUptime: 99.8,
    });

    setUsers([
      { id: 1, email: 'user1@example.com', subscription: 'Premium', status: 'Active', downloads: 3, lastLogin: '2024-01-15' },
      { id: 2, email: 'user2@example.com', subscription: 'Basic', status: 'Active', downloads: 1, lastLogin: '2024-01-14' },
      { id: 3, email: 'user3@example.com', subscription: 'Trial', status: 'Expired', downloads: 0, lastLogin: '2024-01-10' },
    ]);

    setDownloads([
      { id: 1, user: 'user1@example.com', subscription: 'Premium', timestamp: '2024-01-15 10:30', file: 'mt5_bridge_gui.py', ipAddress: '192.168.1.1' },
      { id: 2, user: 'user2@example.com', subscription: 'Basic', timestamp: '2024-01-14 15:22', file: 'mt5_bridge.py', ipAddress: '192.168.1.2' },
    ]);

    setCriticalAlerts([
      { id: 1, type: 'Server', message: 'High CPU usage on Bridge Server #2', severity: 'critical', timestamp: '2024-01-15 11:30' },
      { id: 2, type: 'Security', message: 'Multiple failed login attempts from IP 45.33.22.11', severity: 'warning', timestamp: '2024-01-15 10:45' },
      { id: 3, type: 'Payment', message: 'Payment processing error for user user3@example.com', severity: 'critical', timestamp: '2024-01-15 09:15' },
    ]);

    setLoading(false);
  };

  const handleSyncTelegram = () => {
    toast({
      title: "Telegram Sync Initiated",
      description: "Synchronizing Telegram bot connections across all users",
    });
  };

  const handleResolveAlert = (alertId: number) => {
    setCriticalAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Resolved",
      description: "Critical alert has been marked as resolved",
    });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!admin.isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-tech-dark p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
            <Badge className="bg-tech-blue">
              <Shield className="w-3 h-3 mr-1" />
              Admin Panel
            </Badge>
          </div>
          <Button 
            onClick={logout}
            variant="outline" 
            className="border-tech-blue/30 text-gray-300 hover:bg-tech-charcoal/50"
          >
            Logout
          </Button>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Critical Alerts ({criticalAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-tech-charcoal/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                        <span className="text-white text-sm">{alert.message}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleResolveAlert(alert.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <AdminOverviewCards stats={stats} />

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600">Users</TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-cyan-600">Downloads</TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-cyan-600">Telegram</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">Analytics</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-cyan-600">System</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage user subscriptions and access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Subscription</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Downloads</TableHead>
                      <TableHead className="text-gray-400">Last Login</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.subscription === 'Premium' ? 'default' : 'secondary'}>
                            {user.subscription}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{user.downloads}</TableCell>
                        <TableCell className="text-white">{user.lastLogin}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="border-tech-blue/30">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads">
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white">Bridge Downloads</CardTitle>
                <CardDescription className="text-gray-400">
                  Track bridge downloads by subscription level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Subscription</TableHead>
                      <TableHead className="text-gray-400">File</TableHead>
                      <TableHead className="text-gray-400">IP Address</TableHead>
                      <TableHead className="text-gray-400">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloads.map((download) => (
                      <TableRow key={download.id}>
                        <TableCell className="text-white">{download.user}</TableCell>
                        <TableCell>
                          <Badge variant={download.subscription === 'Premium' ? 'default' : 'secondary'}>
                            {download.subscription}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{download.file}</TableCell>
                        <TableCell className="text-white">{download.ipAddress}</TableCell>
                        <TableCell className="text-white">{download.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telegram">
            <div className="space-y-4">
              <Card className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Telegram Integration</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage global Telegram bot settings
                    </CardDescription>
                  </div>
                  <Button onClick={handleSyncTelegram} className="bg-tech-blue hover:bg-tech-blue/80">
                    <Send className="w-4 h-4 mr-2" />
                    Sync All
                  </Button>
                </CardHeader>
                <CardContent>
                  <TelegramIntegration />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                <CardDescription className="text-gray-400">
                  Platform usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">Subscription Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Premium</span>
                        <span className="text-white">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Basic</span>
                        <span className="text-white">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trial</span>
                        <span className="text-white">20%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold">Feature Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">AI Trading</span>
                        <span className="text-white">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bridge Connection</span>
                        <span className="text-white">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Telegram Bot</span>
                        <span className="text-white">34%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader>
                  <CardTitle className="text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Server Uptime</span>
                    <span className="text-green-400">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Connections</span>
                    <span className="text-white">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-yellow-400">72%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CPU Usage</span>
                    <span className="text-green-400">45%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full bg-tech-blue hover:bg-tech-blue/80">
                    Restart Bridge Service
                  </Button>
                  <Button className="w-full bg-tech-purple hover:bg-tech-purple/80">
                    Clear Cache
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Backup Database
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Emergency Stop
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
