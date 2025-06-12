import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, Globe, ChartBar, Activity, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ThemeSelector } from '@/components/ThemeSelector';

interface PaymentTransaction {
  txId: string;
  planId: string;
  price: number;
  name: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod: string;
}

interface VisitorSession {
  id: string;
  session_id: string;
  page_path: string;
  referrer: string | null;
  user_agent: string;
  country: string;
  city: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface PageView {
  id: string;
  session_id: string;
  page_path: string;
  referrer: string | null;
  duration_seconds: number;
  created_at: string;
}

const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1EAEDB', '#33C3F0', '#D6BCFA'];

const AdminLogin: React.FC<{ onLogin: (username: string, password: string) => Promise<boolean> }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoggingIn(false);
      return;
    }

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="grid place-items-center min-h-[70vh] p-4">
      <div className="tech-card max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-tech-charcoal border-tech-blue/30"
              disabled={isLoggingIn}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-tech-charcoal border-tech-blue/30"
              disabled={isLoggingIn}
            />
          </div>
          
          <Button type="submit" className="w-full bg-tech-blue" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    activeVisitors: 0,
    totalVisitors: 0,
    topPages: [] as { page: string; views: number }[]
  });
  const [telegramStats, setTelegramStats] = useState({
    connected: false,
    messagesSent: 0,
    lastUpdate: null as string | null
  });
  const [syncStatus, setSyncStatus] = useState({
    lastSync: new Date().toISOString(),
    isOnline: true,
    pendingUpdates: 0
  });

  useEffect(() => {
    fetchRealTimeData();
    setupRealTimeSubscriptions();
    checkTelegramStatus();
    
    // Setup sync monitoring
    const syncInterval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        pendingUpdates: Math.floor(Math.random() * 5)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  const checkTelegramStatus = async () => {
    const { telegramBot } = await import('@/services/telegram-bot');
    const config = telegramBot.getConfig();
    const connected = config ? await telegramBot.testConnection() : false;
    
    setTelegramStats({
      connected,
      messagesSent: parseInt(localStorage.getItem('telegram_messages_sent') || '0'),
      lastUpdate: localStorage.getItem('telegram_last_update')
    });
  };

  const fetchRealTimeData = async () => {
    setIsLoading(true);
    try {
      // Fetch visitor sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('visitor_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) {
        console.error('Error fetching visitor sessions:', sessionsError);
      } else {
        setVisitorSessions(sessions || []);
      }

      // Fetch page views
      const { data: views, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (viewsError) {
        console.error('Error fetching page views:', viewsError);
      } else {
        setPageViews(views || []);
      }

      // Calculate real-time stats
      const activeVisitors = sessions?.filter(s => 
        s.is_active && new Date(s.updated_at) > new Date(Date.now() - 5 * 60 * 1000)
      ).length || 0;

      const pageViewCounts = views?.reduce((acc: Record<string, number>, view) => {
        acc[view.page_path] = (acc[view.page_path] || 0) + 1;
        return acc;
      }, {}) || {};

      const topPages = Object.entries(pageViewCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setRealTimeStats({
        activeVisitors,
        totalVisitors: sessions?.length || 0,
        topPages
      });

      // Fetch transactions
      await fetchTransactions();
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to visitor sessions changes
    const sessionsSubscription = supabase
      .channel('visitor-sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'visitor_sessions'
      }, (payload) => {
        console.log('Visitor session change:', payload);
        fetchRealTimeData(); // Refresh data when changes occur
      })
      .subscribe();

    // Subscribe to page views changes
    const viewsSubscription = supabase
      .channel('page-views-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'page_views'
      }, (payload) => {
        console.log('Page view change:', payload);
        fetchRealTimeData(); // Refresh data when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsSubscription);
      supabase.removeChannel(viewsSubscription);
    };
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Fetch transactions from Supabase
      const { data: supabaseTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        // Fallback to localStorage if Supabase query fails
        const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
        const localTransactions: PaymentTransaction[] = pendingTransactions.map((tx: any) => ({
          txId: tx.txId,
          planId: tx.planId,
          price: tx.price,
          name: tx.name,
          timestamp: tx.timestamp,
          status: tx.status === 'completed' ? 'completed' : 
                   tx.status === 'rejected' ? 'rejected' : 'pending',
          paymentMethod: 'USDT'
        }));
        
        // Add some mock data for demonstration
        const mockTransactions: PaymentTransaction[] = [
          {
            txId: 'PAYPAL-1234567',
            planId: 'premium',
            price: 499,
            name: 'Premium',
            timestamp: Date.now() - 3600000,
            status: 'pending',
            paymentMethod: 'PayPal'
          },
          {
            txId: 'PAYPAL-7654321',
            planId: 'standard',
            price: 299,
            name: 'Standard',
            timestamp: Date.now() - 7200000,
            status: 'completed',
            paymentMethod: 'PayPal'
          }
        ];
        
        setTransactions([...localTransactions, ...mockTransactions]);
        setIsLoading(false);
        return;
      }

      // Transform Supabase data to match our component's expected format
      const formattedTransactions: PaymentTransaction[] = supabaseTransactions.map(tx => ({
        txId: tx.tx_id,
        planId: tx.plan_id,
        price: Number(tx.price),
        name: tx.name,
        timestamp: new Date(tx.timestamp).getTime(),
        status: tx.status as 'pending' | 'completed' | 'rejected',
        paymentMethod: tx.payment_method
      }));

      // Also check localStorage for any transactions not yet in Supabase
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const localTransactions: PaymentTransaction[] = pendingTransactions
        .filter((tx: any) => !formattedTransactions.some(ft => ft.txId === tx.txId))
        .map((tx: any) => ({
          txId: tx.txId,
          planId: tx.planId,
          price: tx.price,
          name: tx.name,
          timestamp: tx.timestamp,
          status: tx.status === 'completed' ? 'completed' : 
                   tx.status === 'rejected' ? 'rejected' : 'pending',
          paymentMethod: 'USDT'
        }));
      
      setTransactions([...formattedTransactions, ...localTransactions]);
    } catch (error) {
      console.error("Error loading transactions:", error);
      // Fallback to mock data
      const mockTransactions: PaymentTransaction[] = [
        {
          txId: 'USDT-12345',
          planId: 'premium',
          price: 499,
          name: 'Premium',
          timestamp: Date.now(),
          status: 'pending',
          paymentMethod: 'USDT'
        }
      ];
      
      setTransactions(mockTransactions);
    } finally {
      setIsLoading(false);
    }
  };

  const approvePayment = async (txId: string) => {
    try {
      // Update transaction in Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('tx_id', txId);

      if (error) {
        console.error("Error updating transaction in Supabase:", error);
        toast.error("Error updating transaction in database");
        
        // Still update UI and localStorage as fallback
        setTransactions(transactions.map(tx => 
          tx.txId === txId ? { ...tx, status: 'completed' } : tx
        ));
        
        const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
        const updatedTransactions = pendingTransactions.map((tx: any) => 
          tx.txId === txId ? { ...tx, status: 'completed' } : tx
        );
        localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
        
        // Also store in verified_transactions for cross-device consistency
        const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
        if (!verifiedTransactions.includes(txId)) {
          verifiedTransactions.push(txId);
          localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
        }
        
        return;
      }

      // Update UI state
      setTransactions(transactions.map(tx => 
        tx.txId === txId ? { ...tx, status: 'completed' } : tx
      ));
      
      // Also update localStorage for compatibility
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const updatedTransactions = pendingTransactions.map((tx: any) => 
        tx.txId === txId ? { ...tx, status: 'completed' } : tx
      );
      localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
      
      // Also store in verified_transactions for cross-device consistency
      const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
      if (!verifiedTransactions.includes(txId)) {
        verifiedTransactions.push(txId);
        localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
      }
      
      toast.success("Payment approved");
      
      // Send Telegram notification
      const { telegramBot } = await import('@/services/telegram-bot');
      const transaction = transactions.find(tx => tx.txId === txId);
      if (transaction) {
        await telegramBot.sendUpdate({
          type: 'account_update',
          message: `✅ Payment approved: ${transaction.name} plan ($${transaction.price}) - Transaction ID: ${txId}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Error approving payment");
    }
  };

  const rejectPayment = async (txId: string) => {
    try {
      // Update transaction in Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('tx_id', txId);

      if (error) {
        console.error("Error updating transaction in Supabase:", error);
        toast.error("Error updating transaction in database");
        
        // Still update UI and localStorage as fallback
        setTransactions(transactions.map(tx => 
          tx.txId === txId ? { ...tx, status: 'rejected' } : tx
        ));
        
        const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
        const updatedTransactions = pendingTransactions.map((tx: any) => 
          tx.txId === txId ? { ...tx, status: 'rejected' } : tx
        );
        localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
        
        return;
      }

      // Update UI state
      setTransactions(transactions.map(tx => 
        tx.txId === txId ? { ...tx, status: 'rejected' } : tx
      ));
      
      // Also update localStorage for compatibility
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const updatedTransactions = pendingTransactions.map((tx: any) => 
        tx.txId === txId ? { ...tx, status: 'rejected' } : tx
      );
      localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
      
      toast.success("Payment rejected");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Error rejecting payment");
    }
  };

  const syncToTelegram = async () => {
    const { telegramBot } = await import('@/services/telegram-bot');
    
    const recentTransactions = transactions.filter(tx => 
      Date.now() - tx.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    for (const tx of recentTransactions) {
      await telegramBot.sendUpdate({
        type: 'account_update',
        message: `New ${tx.status} transaction: ${tx.name} plan - $${tx.price} (${tx.paymentMethod})`,
        timestamp: new Date(tx.timestamp).toISOString()
      });
    }

    const messageCount = parseInt(localStorage.getItem('telegram_messages_sent') || '0') + recentTransactions.length;
    localStorage.setItem('telegram_messages_sent', messageCount.toString());
    localStorage.setItem('telegram_last_update', new Date().toISOString());
    
    checkTelegramStatus();
    
    toast.success(`Synced ${recentTransactions.length} updates to Telegram`);
  };

  const formatDate = (timestamp: string | number) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleString();
  };

  // Calculate analytics data from real data
  const visitorsByPage = pageViews.reduce((acc: Record<string, number>, view) => {
    acc[view.page_path] = (acc[view.page_path] || 0) + 1;
    return acc;
  }, {});
  
  const pageVisitsData = Object.keys(visitorsByPage).map(page => ({
    name: page,
    visits: visitorsByPage[page]
  }));

  const visitorsByCountry = visitorSessions.reduce((acc: Record<string, number>, session) => {
    const country = session.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
  
  const countryData = Object.keys(visitorsByCountry).map(country => ({
    name: country,
    value: visitorsByCountry[country]
  }));

  // Group visitors by day for timeline chart
  const today = new Date();
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const visitorsByDay: Record<string, number> = {};
  last7Days.forEach(day => { visitorsByDay[day] = 0 });

  visitorSessions.forEach(session => {
    const visitDate = new Date(session.created_at);
    const dayName = visitDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (last7Days.includes(dayName)) {
      visitorsByDay[dayName] = (visitorsByDay[dayName] || 0) + 1;
    }
  });

  const dailyVisitsData = last7Days.map(day => ({
    name: day,
    visits: visitorsByDay[day]
  }));

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Sync Status Indicator */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-400">
              Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </span>
          </div>
          
          <Button onClick={onLogout} variant="outline" className="border-tech-blue/30">
            Logout
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Themes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Active Visitors</CardTitle>
                <CardDescription>Currently online</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-green">{realTimeStats.activeVisitors}</div>
                  <Activity className="h-8 w-8 text-tech-green/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Total Visitors</CardTitle>
                <CardDescription>All time visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-blue">{realTimeStats.totalVisitors}</div>
                  <Users className="h-8 w-8 text-tech-blue/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Page Views</CardTitle>
                <CardDescription>Total page views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-purple">{pageViews.length}</div>
                  <Globe className="h-8 w-8 text-tech-purple/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Awaiting verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-blue">
                    {transactions.filter(tx => tx.status === 'pending').length}
                  </div>
                  <Check className="h-8 w-8 text-tech-blue/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Telegram Status</CardTitle>
                <CardDescription>Bot integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-blue">
                    {telegramStats.connected ? 'ON' : 'OFF'}
                  </div>
                  <MessageCircle className={`h-8 w-8 ${telegramStats.connected ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {telegramStats.messagesSent} messages sent
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="tech-card">
              <CardHeader>
                <CardTitle>Daily Visits</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{ visits: { theme: { light: '#9b87f5', dark: '#9b87f5' } } }}>
                  <AreaChart data={dailyVisitsData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1F2C" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={(props) => (
                      <div className="bg-tech-dark border border-tech-blue/20 p-2 rounded shadow">
                        {props.payload?.length > 0 && (
                          <div>
                            <p className="text-tech-blue font-medium">{props.label}</p>
                            <p className="text-white">
                              Visits: {props.payload[0].value}
                            </p>
                          </div>
                        )}
                      </div>
                    )} />
                    <Area 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#9b87f5" 
                      fillOpacity={1} 
                      fill="url(#colorVisits)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader>
                <CardTitle>Visitor Countries</CardTitle>
                <CardDescription>Location distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{ visits: { theme: { light: '#9b87f5', dark: '#9b87f5' } } }}>
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={(props) => (
                      <div className="bg-tech-dark border border-tech-blue/20 p-2 rounded shadow">
                        {props.payload?.length > 0 && (
                          <div>
                            <p className="text-tech-blue font-medium">{props.payload[0].name}</p>
                            <p className="text-white">
                              Visitors: {props.payload[0].value}
                            </p>
                          </div>
                        )}
                      </div>
                    )} />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="tech-card">
            <CardHeader>
              <CardTitle>Page Popularity</CardTitle>
              <CardDescription>Visits by page</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer config={{ visits: { theme: { light: '#9b87f5', dark: '#9b87f5' } } }}>
                <BarChart data={pageVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1F2C" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={(props) => (
                    <div className="bg-tech-dark border border-tech-blue/20 p-2 rounded shadow">
                      {props.payload?.length > 0 && (
                        <div>
                          <p className="text-tech-blue font-medium">{props.label}</p>
                          <p className="text-white">
                            Visits: {props.payload[0].value}
                          </p>
                        </div>
                      )}
                    </div>
                  )} />
                  <Bar dataKey="visits" fill="#9b87f5" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="tech-card">
              <CardHeader>
                <CardTitle>Live Visitor Sessions</CardTitle>
                <CardDescription>Real-time visitor activity</CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorSessions.slice(0, 10).map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="text-xs">{formatDate(session.created_at)}</TableCell>
                        <TableCell>{session.page_path}</TableCell>
                        <TableCell>{session.country}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            session.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {session.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card className="tech-card">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages right now</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeStats.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-tech-blue">#{index + 1}</span>
                        <span className="text-sm">{page.page}</span>
                      </div>
                      <span className="text-sm text-tech-green">{page.views} views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <div className="tech-card">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No transactions found</TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.txId}>
                        <TableCell>{formatDate(tx.timestamp)}</TableCell>
                        <TableCell className="font-mono text-xs">{tx.txId}</TableCell>
                        <TableCell>{tx.name}</TableCell>
                        <TableCell>${tx.price}</TableCell>
                        <TableCell>{tx.paymentMethod}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            tx.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tx.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-tech-green text-tech-dark h-8 px-2"
                                onClick={() => approvePayment(tx.txId)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-500/30 text-red-400 h-8 px-2"
                                onClick={() => rejectPayment(tx.txId)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="telegram" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TelegramIntegration />
            </div>
            
            <Card className="tech-card">
              <CardHeader>
                <CardTitle>Sync Dashboard Data</CardTitle>
                <CardDescription>Send recent activity to Telegram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pending Updates:</span>
                    <Badge variant="outline">{syncStatus.pendingUpdates}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Sync:</span>
                    <span className="text-gray-400">
                      {new Date(syncStatus.lastSync).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Messages Sent:</span>
                    <span className="text-tech-green">{telegramStats.messagesSent}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={syncToTelegram}
                  disabled={!telegramStats.connected}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Sync to Telegram
                </Button>
                
                {!telegramStats.connected && (
                  <p className="text-xs text-yellow-500">
                    Configure Telegram integration first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="themes" className="space-y-4">
          <ThemeSelector />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Admin: React.FC = () => {
  const { admin, login, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Record site visit for analytics
    if (admin.isAuthenticated) {
      const currentVisits = JSON.parse(localStorage.getItem('site_visits') || '[]');
      const newVisit = {
        id: `visit-${Date.now()}`,
        timestamp: Date.now(),
        page: '/admin',
        referrer: document.referrer || null,
        country: 'Admin Location' // In a real app, you would use an IP geolocation service
      };
      
      localStorage.setItem('site_visits', JSON.stringify([...currentVisits, newVisit]));
    }
  }, [admin.isAuthenticated]);

  return (
    <>
      <SEO 
        title="Admin Portal | Omnia BOT"
        description="Admin portal for Omnia BOT payment verification"
        type="website"
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-8" />
          
          {admin.isAuthenticated ? (
            <AdminDashboard onLogout={logout} />
          ) : (
            <AdminLogin onLogin={login} />
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
