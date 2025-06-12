
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import { useConnectedAccounts } from '@/hooks/use-connected-accounts';
import { supabase } from '@/integrations/supabase/client';
import { Link, CheckCircle, XCircle, TrendingUp, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AccountMetrics {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  profit: number;
  currency: string;
}

const ConnectedAccountsCard = () => {
  const { isConnected, accountInfo, connect, disconnect, refreshAccount } = useMT5Connection();
  const { connectedAccounts, refreshAccounts } = useConnectedAccounts();
  const [isLoading, setIsLoading] = useState(false);
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (accountInfo) {
      setAccountMetrics({
        balance: accountInfo.balance || 0,
        equity: accountInfo.equity || 0,
        margin: accountInfo.margin || 0,
        freeMargin: accountInfo.free_margin || 0,
        marginLevel: accountInfo.margin_level || 0,
        leverage: accountInfo.leverage || 1,
        profit: (accountInfo.equity || 0) - (accountInfo.balance || 0),
        currency: accountInfo.currency || 'USD'
      });
      setLastUpdate(new Date());
    }
  }, [accountInfo]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshAccount();
      await refreshAccounts();
      toast({
        title: "Accounts Refreshed",
        description: "Account data has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh account data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect({
        server: "MetaQuotes-Demo",
        login: 123456,
        password: "password123"
      });
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-white">Connected Accounts</CardTitle>
          <CardDescription className="text-gray-400">
            Your trading account status and metrics
          </CardDescription>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MT5 Account Status */}
        <div className="flex items-center justify-between p-4 border border-tech-blue/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">MetaTrader 5</p>
              <p className="text-gray-400 text-sm">
                {isConnected ? `Account ${accountInfo?.login || 'N/A'}` : 'Not connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            {!isConnected && (
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                size="sm"
                className="bg-tech-blue hover:bg-tech-blue/80"
              >
                <Link className="w-4 h-4 mr-1" />
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* Account Metrics */}
        {isConnected && accountMetrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-tech-dark rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Balance</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(accountMetrics.balance, accountMetrics.currency)}
                    </p>
                  </div>
                  <DollarSign className="w-4 h-4 text-tech-blue" />
                </div>
              </div>
              
              <div className="p-3 bg-tech-dark rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Equity</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(accountMetrics.equity, accountMetrics.currency)}
                    </p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-tech-blue" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-tech-dark rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Floating P&L</p>
                    <p className={`font-semibold ${accountMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {accountMetrics.profit >= 0 ? '+' : ''}{formatCurrency(accountMetrics.profit, accountMetrics.currency)}
                    </p>
                  </div>
                  {accountMetrics.profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-tech-dark rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Free Margin</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(accountMetrics.freeMargin, accountMetrics.currency)}
                    </p>
                  </div>
                  <Activity className="w-4 h-4 text-tech-blue" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-tech-dark rounded">
                <p className="text-gray-400 text-xs">Margin Level</p>
                <p className="text-white text-sm font-medium">
                  {formatPercentage(accountMetrics.marginLevel)}
                </p>
              </div>
              <div className="p-2 bg-tech-dark rounded">
                <p className="text-gray-400 text-xs">Leverage</p>
                <p className="text-white text-sm font-medium">
                  1:{accountMetrics.leverage}
                </p>
              </div>
              <div className="p-2 bg-tech-dark rounded">
                <p className="text-gray-400 text-xs">Used Margin</p>
                <p className="text-white text-sm font-medium">
                  {formatCurrency(accountMetrics.margin, accountMetrics.currency)}
                </p>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-tech-blue/30">
              <p className="text-gray-500 text-xs">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Other Connected Accounts */}
        {connectedAccounts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Other Accounts</h4>
            {connectedAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-tech-blue/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{account.platform}</p>
                    <p className="text-gray-400 text-xs">Account {account.accountId}</p>
                  </div>
                </div>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        )}

        {!isConnected && connectedAccounts.length === 0 && (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No trading accounts connected</p>
            <p className="text-gray-500 text-sm mt-2">
              Connect your MT5 account to start trading
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccountsCard;
