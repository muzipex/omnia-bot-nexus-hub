
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import { Activity, TrendingUp, TrendingDown, DollarSign, Settings, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TRADING_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'BTCUSD', 'ETHUSD', 'XAUUSD', 'XAGUSD', 'USOIL', 'UK100', 'US30', 'NAS100'
];

const MT5TradingInterface = () => {
  const {
    isConnected,
    account,
    positions,
    isLoading,
    connectToMT5,
    placeOrder,
    closeOrder,
    loadPositions,
    loadAccountInfo
  } = useMT5Connection();

  const [orderForm, setOrderForm] = useState({
    symbol: 'EURUSD',
    trade_type: 'BUY' as 'BUY' | 'SELL',
    volume: 0.01,
    price: 0,
    stop_loss: 0,
    take_profit: 0,
    comment: '',
    magic_number: 12345
  });

  const [connectionForm, setConnectionForm] = useState({
    account_number: '',
    server: '',
    name: '',
    company: '',
    currency: 'USD',
    balance: 0,
    equity: 0
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionForm.account_number || !connectionForm.server || !connectionForm.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    await connectToMT5({
      account_number: parseInt(connectionForm.account_number),
      server: connectionForm.server,
      name: connectionForm.name,
      company: connectionForm.company,
      currency: connectionForm.currency,
      balance: connectionForm.balance,
      equity: connectionForm.equity
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.symbol || !orderForm.volume || !orderForm.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required order fields",
        variant: "destructive"
      });
      return;
    }

    await placeOrder({
      symbol: orderForm.symbol,
      trade_type: orderForm.trade_type,
      volume: orderForm.volume,
      price: orderForm.price,
      stop_loss: orderForm.stop_loss || undefined,
      take_profit: orderForm.take_profit || undefined,
      comment: orderForm.comment,
      magic_number: orderForm.magic_number
    });
  };

  const handleClosePosition = async (position: any) => {
    const currentPrice = position.trade_type === 'BUY' ? position.open_price * 0.999 : position.open_price * 1.001;
    const profit = position.trade_type === 'BUY' 
      ? (currentPrice - position.open_price) * position.volume * 100000
      : (position.open_price - currentPrice) * position.volume * 100000;
    
    await closeOrder(position.ticket, currentPrice, profit);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        loadPositions();
        loadAccountInfo();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            MT5 Connection Status
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
            <p className="text-gray-400">Not connected to MT5</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-tech-charcoal">
          <TabsTrigger value="connection" className="data-[state=active]:bg-tech-blue">Connection</TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-tech-blue">Trading</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-tech-blue">Positions</TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <CardTitle className="text-white">Connect to MT5</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your MT5 account details to connect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="server" className="text-gray-300">Server *</Label>
                    <Input
                      id="server"
                      value={connectionForm.server}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, server: e.target.value }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                      placeholder="e.g., MetaQuotes-Demo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Account Name *</Label>
                    <Input
                      id="name"
                      value={connectionForm.name}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-300">Company</Label>
                    <Input
                      id="company"
                      value={connectionForm.company}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                    <Select value={connectionForm.currency} onValueChange={(value) => setConnectionForm(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="balance" className="text-gray-300">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={connectionForm.balance}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-tech-blue hover:bg-tech-blue/80"
                >
                  {isLoading ? 'Connecting...' : 'Connect to MT5'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <CardTitle className="text-white">Place Order</CardTitle>
              <CardDescription className="text-gray-400">
                Create a new trading position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol" className="text-gray-300">Symbol</Label>
                    <Select value={orderForm.symbol} onValueChange={(value) => setOrderForm(prev => ({ ...prev, symbol: value }))}>
                      <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADING_SYMBOLS.map(symbol => (
                          <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trade_type" className="text-gray-300">Order Type</Label>
                    <Select value={orderForm.trade_type} onValueChange={(value: 'BUY' | 'SELL') => setOrderForm(prev => ({ ...prev, trade_type: value }))}>
                      <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="volume" className="text-gray-300">Volume (Lots)</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={orderForm.volume}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0.01 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-gray-300">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.00001"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stop_loss" className="text-gray-300">Stop Loss (Optional)</Label>
                    <Input
                      id="stop_loss"
                      type="number"
                      step="0.00001"
                      value={orderForm.stop_loss}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, stop_loss: parseFloat(e.target.value) || 0 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="take_profit" className="text-gray-300">Take Profit (Optional)</Label>
                    <Input
                      id="take_profit"
                      type="number"
                      step="0.00001"
                      value={orderForm.take_profit}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, take_profit: parseFloat(e.target.value) || 0 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment" className="text-gray-300">Comment</Label>
                    <Input
                      id="comment"
                      value={orderForm.comment}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="magic_number" className="text-gray-300">Magic Number</Label>
                    <Input
                      id="magic_number"
                      type="number"
                      value={orderForm.magic_number}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, magic_number: parseInt(e.target.value) || 0 }))}
                      className="bg-tech-dark border-tech-blue/30 text-white"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !isConnected}
                  className="bg-tech-green hover:bg-tech-green/80"
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Open Positions</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your active trading positions
                </CardDescription>
              </div>
              <Button
                onClick={loadPositions}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {positions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-tech-blue/30">
                      <TableHead className="text-gray-300">Ticket</TableHead>
                      <TableHead className="text-gray-300">Symbol</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Volume</TableHead>
                      <TableHead className="text-gray-300">Open Price</TableHead>
                      <TableHead className="text-gray-300">Open Time</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => (
                      <TableRow key={position.id} className="border-tech-blue/30">
                        <TableCell className="text-white font-mono">{position.ticket}</TableCell>
                        <TableCell className="text-white">{position.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={position.trade_type === 'BUY' ? "default" : "destructive"}>
                            {position.trade_type === 'BUY' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {position.trade_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{position.volume}</TableCell>
                        <TableCell className="text-white">{position.open_price.toFixed(5)}</TableCell>
                        <TableCell className="text-white">{formatDateTime(position.open_time)}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleClosePosition(position)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            Close
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No open positions</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {isConnected ? 'Place your first order to see positions here' : 'Connect to MT5 to view positions'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT5TradingInterface;
