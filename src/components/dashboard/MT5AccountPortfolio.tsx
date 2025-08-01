import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectedAccounts } from '@/hooks/use-connected-accounts';
import { 
  Plus, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Smartphone, 
  Globe, 
  Key,
  Eye,
  EyeOff,
  Settings,
  LogIn,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface MT5Credentials {
  login: string;
  password: string;
  server: string;
  account_name?: string;
  broker?: string;
}

const MT5AccountPortfolio: React.FC = () => {
  const { accounts, loading, syncing, addAccount, syncAccount } = useConnectedAccounts();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'device' | 'web'>('device');
  const [formData, setFormData] = useState<MT5Credentials>({
    login: '',
    password: '',
    server: '',
    account_name: '',
    broker: ''
  });

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAccount({
        account_number: parseInt(formData.login),
        server: formData.server,
        account_name: formData.account_name || undefined,
        broker: formData.broker || undefined
      });
      
      setFormData({ login: '', password: '', server: '', account_name: '', broker: '' });
      setShowAddForm(false);
      
      toast({
        title: "Account Added Successfully",
        description: `MT5 account ${formData.login} has been added to your portfolio`,
      });
    } catch (error) {
      console.error('Failed to add account:', error);
      toast({
        title: "Error",
        description: "Failed to add MT5 account. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const handleDeviceLogin = async (account: any) => {
    try {
      // For device login, we'll create a deep link to MT5 app
      const mt5DeepLink = `mt5://login?server=${account.server}&login=${account.account_number}`;
      
      // Try to open MT5 app
      if (navigator.userAgent.includes('Mobile')) {
        window.open(mt5DeepLink, '_self');
      } else {
        // For desktop, show instructions
        toast({
          title: "Open MT5 Application",
          description: `Please open your MT5 app and login with:\nServer: ${account.server}\nLogin: ${account.account_number}`,
        });
      }
    } catch (error) {
      console.error('Failed to initiate device login:', error);
      toast({
        title: "Error",
        description: "Failed to open MT5 application",
        variant: "destructive",
      });
    }
  };

  const handleWebTerminalLogin = async (account: any) => {
    try {
      // Open MT5 Web Terminal in new tab with pre-filled credentials
      const webTerminalUrl = `https://trade.mql5.com/trade?servers=${account.server}&trade_server=${account.server}`;
      window.open(webTerminalUrl, '_blank');
      
      toast({
        title: "Web Terminal Opened",
        description: `MT5 Web Terminal opened for account ${account.account_number}`,
      });
    } catch (error) {
      console.error('Failed to open web terminal:', error);
      toast({
        title: "Error",
        description: "Failed to open MT5 Web Terminal",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatLastSync = (lastSync: string) => {
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const calculateTotalPortfolioValue = () => {
    return accounts.reduce((total, account) => total + (account.equity || 0), 0);
  };

  const brokerList = [
    'FXTM', 'XM Group', 'IC Markets', 'Pepperstone', 'OANDA', 'Admiral Markets',
    'IG Group', 'Plus500', 'eToro', 'Interactive Brokers', 'TD Ameritrade',
    'Forex.com', 'MetaQuotes-Demo', 'Custom'
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">MT5 Account Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-purple-100 text-sm">Total Portfolio Value</p>
              <p className="text-3xl font-bold">{formatCurrency(calculateTotalPortfolioValue())}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Connected Accounts</p>
              <p className="text-3xl font-bold">{accounts.length}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Active Connections</p>
              <p className="text-3xl font-bold">{accounts.filter(acc => acc.is_connected).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Management */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Account Management
            </CardTitle>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add MT5 Account</DialogTitle>
                </DialogHeader>
                
                <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as 'device' | 'web')}>
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="device" className="data-[state=active]:bg-white/20">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Device Login
                    </TabsTrigger>
                    <TabsTrigger value="web" className="data-[state=active]:bg-white/20">
                      <Globe className="w-4 h-4 mr-2" />
                      Web Terminal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="device" className="space-y-4">
                    <Alert className="bg-blue-500/20 border-blue-500/30 text-blue-100">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This will add the account to your portfolio and help you login via MT5 mobile/desktop app.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="web" className="space-y-4">
                    <Alert className="bg-green-500/20 border-green-500/30 text-green-100">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This will add the account and open MT5 Web Terminal for browser-based trading.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                <form onSubmit={handleAddAccount} className="space-y-4">
                  <div>
                    <Label htmlFor="login" className="text-white">Account Login/Number</Label>
                    <Input
                      id="login"
                      value={formData.login}
                      onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your MT5 login number"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                        placeholder="Enter your MT5 password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="server" className="text-white">Server</Label>
                    <Input
                      id="server"
                      value={formData.server}
                      onChange={(e) => setFormData(prev => ({ ...prev, server: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="e.g., MetaQuotes-Demo, FXTM-Server"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="broker" className="text-white">Broker</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, broker: value }))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your broker" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {brokerList.map((broker) => (
                          <SelectItem key={broker} value={broker} className="text-white">
                            {broker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="account_name" className="text-white">Account Name (Optional)</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="My Trading Account"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700">
                    <Key className="w-4 h-4 mr-2" />
                    Add Account to Portfolio
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-gray-300">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">No MT5 accounts in portfolio</p>
              <p className="text-sm text-gray-400">Add your first MT5 account to get started with trading</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white">
                        {account.account_name || `Account ${account.account_number}`}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {account.account_number} • {account.server}
                      </p>
                      {account.broker && (
                        <p className="text-xs text-gray-400">{account.broker}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={account.is_connected ? "default" : "secondary"}
                        className={account.is_connected 
                          ? "bg-green-500/20 text-green-300 border-green-500/30" 
                          : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }
                      >
                        {account.is_connected ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />Connected</>
                        ) : (
                          <><WifiOff className="w-3 h-3 mr-1" />Offline</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-400 mb-1">
                        <DollarSign className="w-4 h-4 mr-1" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-xs text-gray-400">Balance</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-400 mb-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(account.equity, account.currency)}
                      </p>
                      <p className="text-xs text-gray-400">Equity</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-purple-400 mb-1">
                        <span className="text-sm font-bold">1:{account.leverage}</span>
                      </div>
                      <p className="text-xs text-gray-400">Leverage</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Last sync: {formatLastSync(account.last_sync)}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeviceLogin(account)}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <Smartphone className="w-3 h-3 mr-1" />
                        App Login
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWebTerminalLogin(account)}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Web Terminal
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncAccount(account.id)}
                        disabled={syncing}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MT5AccountPortfolio;