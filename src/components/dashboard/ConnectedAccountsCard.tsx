import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConnectedAccounts } from '@/hooks/use-connected-accounts';
import { Plus, RefreshCw, Wifi, WifiOff, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const ConnectedAccountsCard: React.FC = () => {
  const { accounts, loading, syncing, addAccount, syncAccount } = useConnectedAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    account_number: '',
    server: '',
    account_name: '',
    broker: ''
  });
  const [localAccounts, setLocalAccounts] = useState([]);

  const fetchAccountsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('mt5_connected_accounts')
        .select('*');

      if (error) {
        console.error('Error fetching accounts from Supabase:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching accounts from Supabase:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = await fetchAccountsFromSupabase();
      setLocalAccounts(accounts);
    };

    loadAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAccount({
        account_number: parseInt(formData.account_number),
        server: formData.server,
        account_name: formData.account_name || undefined,
        broker: formData.broker || undefined
      });
      setFormData({ account_number: '', server: '', account_name: '', broker: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add account:', error);
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

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-black flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Connected Accounts
          </CardTitle>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-black">Add MT5 Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <Label htmlFor="account_number" className="text-black">Account Number</Label>
                  <Input
                    id="account_number"
                    type="number"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    className="border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="server" className="text-black">Server</Label>
                  <Input
                    id="server"
                    value={formData.server}
                    onChange={(e) => setFormData(prev => ({ ...prev, server: e.target.value }))}
                    className="border-gray-300"
                    placeholder="e.g., MetaQuotes-Demo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account_name" className="text-black">Account Name (Optional)</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="broker" className="text-black">Broker (Optional)</Label>
                  <Input
                    id="broker"
                    value={formData.broker}
                    onChange={(e) => setFormData(prev => ({ ...prev, broker: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                  Add Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        ) : localAccounts.length === 0 ? (
          <div className="text-center py-8">
            <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No connected accounts</p>
            <p className="text-sm text-gray-500">Add your first MT5 account to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localAccounts.map((account) => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-black">
                      {account.account_name || `Account ${account.account_number}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {account.account_number} • {account.server}
                    </p>
                    {account.broker && (
                      <p className="text-xs text-gray-500">{account.broker}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={account.is_connected ? "default" : "secondary"}
                      className={account.is_connected 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {account.is_connected ? (
                        <><Wifi className="w-3 h-3 mr-1" />Connected</>
                      ) : (
                        <><WifiOff className="w-3 h-3 mr-1" />Disconnected</>
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncAccount(account.id)}
                      disabled={syncing}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-black">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                    <p className="text-xs text-gray-500">Balance</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-black">
                      {account.equity}
                    </p>
                    <p className="text-xs text-gray-500">Equity</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-black">
                      {formatLastSync(account.last_sync)}
                    </p>
                    <p className="text-xs text-gray-500">Last Sync</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccountsCard;
