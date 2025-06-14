
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Activity, TrendingUp, DollarSign, Download, Send, MessageSquare } from 'lucide-react';
import TelegramIntegration from '@/components/dashboard/TelegramIntegration';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    bridgeDownloads: 0,
    telegramConnections: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
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
    });

    setUsers([
      { id: 1, email: 'user1@example.com', subscription: 'Premium', status: 'Active', downloads: 3 },
      { id: 2, email: 'user2@example.com', subscription: 'Basic', status: 'Active', downloads: 1 },
      { id: 3, email: 'user3@example.com', subscription: 'Trial', status: 'Expired', downloads: 0 },
    ]);

    setDownloads([
      { id: 1, user: 'user1@example.com', subscription: 'Premium', timestamp: '2024-01-15 10:30', file: 'mt5_bridge_gui.py' },
      { id: 2, user: 'user2@example.com', subscription: 'Basic', timestamp: '2024-01-14 15:22', file: 'mt5_bridge.py' },
    ]);
    setLoading(false);
  };

  const handleSyncTelegram = () => {
    toast({
      title: "Telegram Sync Initiated",
      description: "Synchronizing Telegram bot connections across all users",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tech-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin.isAuthenticated) {
    return (
      <div className="min-h-screen bg-tech-dark flex items-center justify-center">
        <Card className="bg-tech-charcoal border-tech-blue/30">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech-dark p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Badge className="bg-tech-blue">Admin Panel</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-tech-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-tech-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSubscriptions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-tech-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Bridge Downloads</CardTitle>
              <Download className="h-4 w-4 text-tech-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.bridgeDownloads.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Telegram Connections</CardTitle>
              <MessageSquare className="h-4 w-4 text-tech-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.telegramConnections.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600">Users</TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-cyan-600">Downloads</TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-cyan-600">Telegram</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">Analytics</TabsTrigger>
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
                <CardTitle className="text-white">Analytics</CardTitle>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
