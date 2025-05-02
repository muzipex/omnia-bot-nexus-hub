
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, Globe, ChartBar } from "lucide-react";
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

interface PaymentTransaction {
  txId: string;
  planId: string;
  price: number;
  name: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod: string;
}

interface Visitor {
  id: string;
  timestamp: number;
  page: string;
  referrer: string | null;
  country: string;
}

const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1EAEDB', '#33C3F0', '#D6BCFA'];

const AdminLogin: React.FC<{ onLogin: (username: string, password: string) => boolean }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid credentials');
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
            />
          </div>
          
          <Button type="submit" className="w-full bg-tech-blue">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load pending transactions from localStorage
    const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
    
    // In a real app, you would fetch these from a backend
    // For demo purposes, we'll create some mock data
    const mockTransactions: PaymentTransaction[] = [
      ...pendingTransactions.map((tx: any) => ({
        ...tx,
        paymentMethod: 'USDT'
      })),
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

    setTransactions(mockTransactions);

    // Mock visitor data with country information
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Japan', 'Australia', 'Brazil', 'India'];
    const pages = ['/', '/models', '/success', '/admin'];
    
    const mockVisitors: Visitor[] = Array.from({ length: 20 }, (_, i) => ({
      id: `visitor-${i+1}`,
      timestamp: Date.now() - (i * 900000),
      page: pages[Math.floor(Math.random() * pages.length)],
      referrer: Math.random() > 0.5 ? ['google.com', 'facebook.com', 'twitter.com'][Math.floor(Math.random() * 3)] : null,
      country: countries[Math.floor(Math.random() * countries.length)]
    }));

    setVisitors(mockVisitors);
  }, []);

  const approvePayment = (txId: string) => {
    // Update transaction status
    setTransactions(transactions.map(tx => 
      tx.txId === txId ? { ...tx, status: 'completed' } : tx
    ));

    // In a real app, this would update a database
    // For demo, we'll update localStorage
    const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
    const updatedTransactions = pendingTransactions.map((tx: any) => 
      tx.txId === txId ? { ...tx, status: 'completed' } : tx
    );
    localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
    
    toast.success("Payment approved");
  };

  const rejectPayment = (txId: string) => {
    // Update transaction status
    setTransactions(transactions.map(tx => 
      tx.txId === txId ? { ...tx, status: 'rejected' } : tx
    ));

    // In a real app, this would update a database
    const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
    const updatedTransactions = pendingTransactions.map((tx: any) => 
      tx.txId === txId ? { ...tx, status: 'rejected' } : tx
    );
    localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
    
    toast.success("Payment rejected");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate analytics data
  const totalVisits = visitors.length;
  
  const visitorsByPage = visitors.reduce((acc: Record<string, number>, visitor) => {
    acc[visitor.page] = (acc[visitor.page] || 0) + 1;
    return acc;
  }, {});
  
  const pageVisitsData = Object.keys(visitorsByPage).map(page => ({
    name: page,
    visits: visitorsByPage[page]
  }));

  const visitorsByCountry = visitors.reduce((acc: Record<string, number>, visitor) => {
    acc[visitor.country] = (acc[visitor.country] || 0) + 1;
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

  visitors.forEach(visitor => {
    const visitDate = new Date(visitor.timestamp);
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
        <Button onClick={onLogout} variant="outline" className="border-tech-blue/30">
          Logout
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Payment Verification
          </TabsTrigger>
          <TabsTrigger value="visitors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Site Visitors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="tech-card">
              <CardHeader className="pb-2">
                <CardTitle>Total Visitors</CardTitle>
                <CardDescription>All time site visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-tech-blue">{totalVisits}</div>
                  <Users className="h-8 w-8 text-tech-blue/60" />
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
                <CardTitle>Top Country</CardTitle>
                <CardDescription>Most visitors from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-tech-blue">
                    {countryData.length > 0 ? 
                      countryData.sort((a, b) => b.value - a.value)[0].name : 
                      'No data'}
                  </div>
                  <Globe className="h-8 w-8 text-tech-blue/60" />
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
        
        <TabsContent value="payments" className="space-y-4">
          <div className="tech-card">
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
          </div>
        </TabsContent>
        
        <TabsContent value="visitors" className="space-y-4">
          <div className="tech-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Referrer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>{formatDate(visitor.timestamp)}</TableCell>
                    <TableCell>{visitor.page}</TableCell>
                    <TableCell>{visitor.country}</TableCell>
                    <TableCell>{visitor.referrer || 'Direct'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
