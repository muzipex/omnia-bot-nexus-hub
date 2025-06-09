
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MT5Account } from '@/hooks/use-mt5-connection';

interface MT5ConnectionCardProps {
  isConnected: boolean;
  account: MT5Account | null;
  isLoading: boolean;
  onConnect: (credentials: { server: string; account_number: number; password: string }) => Promise<void>;
}

const MT5ConnectionCard = ({ isConnected, account, isLoading, onConnect }: MT5ConnectionCardProps) => {
  const [connectionForm, setConnectionForm] = useState({
    server: '',
    account_number: '',
    password: ''
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionForm.account_number || !connectionForm.server || !connectionForm.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in server, account number, and password",
        variant: "destructive"
      });
      return;
    }

    await onConnect({
      server: connectionForm.server,
      account_number: parseInt(connectionForm.account_number),
      password: connectionForm.password
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      {/* Connection Status */}
      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            MT5 Local Connection
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected && account ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-400">Account</Label>
                <p className="text-white font-mono">{account.account_number}</p>
              </div>
              <div>
                <Label className="text-gray-400">Server</Label>
                <p className="text-white">{account.server}</p>
              </div>
              <div>
                <Label className="text-gray-400">Balance</Label>
                <p className="text-white">{formatCurrency(account.balance, account.currency)}</p>
              </div>
              <div>
                <Label className="text-gray-400">Equity</Label>
                <p className="text-white">{formatCurrency(account.equity, account.currency)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Connect to your local MT5 terminal</p>
          )}
        </CardContent>
      </Card>

      {/* Connection Form */}
      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white">Connect to Local MT5</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your MT5 credentials to connect to your local terminal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="server" className="text-gray-300">Server *</Label>
                <Input
                  id="server"
                  value={connectionForm.server}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, server: e.target.value }))}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                  placeholder="e.g., MetaQuotes-Demo, ICMarkets-Live01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_number" className="text-gray-300">Account Number *</Label>
                <Input
                  id="account_number"
                  type="number"
                  value={connectionForm.account_number}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, account_number: e.target.value }))}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-tech-blue hover:bg-tech-blue/80"
            >
              {isLoading ? 'Connecting...' : 'Connect to MT5'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default MT5ConnectionCard;
