
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, RefreshCw, Shield } from 'lucide-react';
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
    server: 'MetaQuotes-Demo',
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

    try {
      await onConnect({
        server: connectionForm.server,
        account_number: parseInt(connectionForm.account_number),
        password: connectionForm.password
      });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    toast({
      title: "Disconnected",
      description: "Disconnected from MT5 bridge",
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
      <Card className="bg-gradient-to-br from-gray-800/50 to-cyan-900/30 border border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            MT5 Neural Bridge Connection
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className={`ml-auto ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'} border-0`}
            >
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected && account ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-3 rounded-lg border border-cyan-500/20">
                  <Label className="text-cyan-400 text-xs">ACCOUNT</Label>
                  <p className="text-white font-mono text-lg">{account.account_number}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-3 rounded-lg border border-purple-500/20">
                  <Label className="text-purple-400 text-xs">SERVER</Label>
                  <p className="text-white font-medium">{account.server}</p>
                </div>
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-3 rounded-lg border border-green-500/20">
                  <Label className="text-green-400 text-xs">BALANCE</Label>
                  <p className="text-white font-bold">{formatCurrency(account.balance, account.currency)}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-3 rounded-lg border border-yellow-500/20">
                  <Label className="text-yellow-400 text-xs">EQUITY</Label>
                  <p className="text-white font-bold">{formatCurrency(account.equity, account.currency)}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Neural bridge offline - Connect to your MT5 terminal</p>
          )}
        </CardContent>
      </Card>

      {/* Connection Form */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Establish Neural Link
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connect to your local MT5 terminal for real-time trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="server" className="text-purple-300 font-medium">Trading Server *</Label>
                <Input
                  id="server"
                  value={connectionForm.server}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, server: e.target.value }))}
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
                  placeholder="e.g., MetaQuotes-Demo, ICMarkets-Live01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_number" className="text-cyan-300 font-medium">Account Number *</Label>
                <Input
                  id="account_number"
                  type="number"
                  value={connectionForm.account_number}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, account_number: e.target.value }))}
                  className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                  placeholder="Your MT5 account number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-green-300 font-medium">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-800/50 border-green-500/30 text-white placeholder-gray-500 focus:border-green-400 focus:ring-green-400/20"
                  placeholder="Your MT5 password"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || isConnected}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 font-bold py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Establishing Neural Link...
                </>
              ) : isConnected ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Neural Link Active
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Neural Bridge
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default MT5ConnectionCard;
