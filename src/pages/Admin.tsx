import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, MessageSquare, Shield, AlertTriangle, Check, X, Clock, DollarSign } from 'lucide-react';
import TelegramIntegration from '@/components/dashboard/TelegramIntegration';
import AdminOverviewCards from '@/components/admin/AdminOverviewCards';
import AdminLoginForm from '@/components/auth/AdminLoginForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { admin, logout, loading: authLoading } = useAdminAuth();
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (admin.isAuthenticated) {
      loadAdminData();
    }
  }, [admin.isAuthenticated]);

  const loadAdminData = async () => {
    setDataLoading(true);
    
    // Load transactions from Supabase
    try {
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && transactionData) {
        setTransactions(transactionData);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }

    // Mock data for other sections
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

    setDataLoading(false);
  };

  const handleApprovePayment = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (!error) {
        toast({
          title: "Payment Approved",
          description: "Transaction has been marked as completed",
        });
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', transactionId);

      if (!error) {
        toast({
          title: "Payment Rejected",
          description: "Transaction has been marked as rejected",
        });
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
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
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 border border-gray-700">
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-600">Payments</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600">Users</TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-cyan-600">Downloads</TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-cyan-600">Telegram</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">Analytics</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-cyan-600">System</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Verification
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review and verify pending payments and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-400">Transaction ID</TableHead>
                        <TableHead className="text-gray-400">Plan</TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Method</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-white font-mono text-xs">
                            {transaction.tx_id?.substring(0, 12)}...
                          </TableCell>
                          <TableCell className="text-white">{transaction.plan_id}</TableCell>
                          <TableCell className="text-white">${(transaction.price / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-white">{transaction.payment_method}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {transaction.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayment(transaction.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectPayment(transaction.id)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {transaction.status !== 'pending' && (
                              <span className="text-gray-400 text-sm">No actions</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
