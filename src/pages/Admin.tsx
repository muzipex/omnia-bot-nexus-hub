
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
import { Check, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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
}

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
  const [activeTab, setActiveTab] = useState('payments');

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

    // Mock visitor data
    const mockVisitors: Visitor[] = Array.from({ length: 10 }, (_, i) => ({
      id: `visitor-${i+1}`,
      timestamp: Date.now() - (i * 900000),
      page: ['/', '/models', '/success'][Math.floor(Math.random() * 3)],
      referrer: Math.random() > 0.5 ? 'google.com' : null
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

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={onLogout} variant="outline" className="border-tech-blue/30">
          Logout
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="payments">Payment Verification</TabsTrigger>
          <TabsTrigger value="visitors">Site Visitors</TabsTrigger>
        </TabsList>
        
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
                  <TableHead>Referrer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>{formatDate(visitor.timestamp)}</TableCell>
                    <TableCell>{visitor.page}</TableCell>
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
    const currentVisits = JSON.parse(localStorage.getItem('site_visits') || '[]');
    const newVisit = {
      id: `visit-${Date.now()}`,
      timestamp: Date.now(),
      page: '/admin',
      referrer: document.referrer || null
    };
    
    localStorage.setItem('site_visits', JSON.stringify([...currentVisits, newVisit]));
  }, []);

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
