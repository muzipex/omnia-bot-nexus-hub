
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
import { Activity, TrendingUp, TrendingDown, DollarSign, Settings, RefreshCw, Bot } from 'lucide-react';
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
    loadAccountInfo,
    startAutoTrading,
    stopAutoTrading,
    isAutoTrading
  } = useMT5Connection();

  const [connectionForm, setConnectionForm] = useState({
    server: '',
    account_number: '',
    password: ''
  });

  const [autoTradingSettings, setAutoTradingSettings] = useState({
    symbol: 'EURUSD',
    lot_size: 0.01,
    stop_loss_pips: 50,
    take_profit_pips: 100,
    max_trades: 5,
    trading_strategy: 'scalping'
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

    await connectToMT5({
      server: connectionForm.server,
      account_number: parseInt(connectionForm.account_number),
      password: connectionForm.password
    });
  };

  const handleStartAutoTrading = async () => {
    await startAutoTrading(autoTradingSettings);
  };

  const handleStopAutoTrading = async () => {
    await stopAutoTrading();
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
      }, 5000); // Refresh every 5 seconds for live trading

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
            MT5 Local Connection
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {isAutoTrading && (
              <Badge variant="secondary" className="bg-green-500">
                <Bot className="w-3 h-3 mr-1" />
                Auto Trading
              </Badge>
            )}
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

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-tech-charcoal">
          <TabsTrigger value="connection" className="data-[state=active]:bg-tech-blue">Connection</TabsTrigger>
          <TabsTrigger value="autobot" className="data-[state=active]:bg-tech-blue">Auto Bot</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-tech-blue">Positions</TabsTrigger>
          <TabsTrigger value="setup" className="data-[state=active]:bg-tech-blue">Setup Guide</TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection">
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
        </TabsContent>

        {/* Auto Trading Bot Tab */}
        <TabsContent value="autobot">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Automated Trading Bot
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure and start automated trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol" className="text-gray-300">Trading Symbol</Label>
                  <Select 
                    value={autoTradingSettings.symbol} 
                    onValueChange={(value) => setAutoTradingSettings(prev => ({ ...prev, symbol: value }))}
                  >
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
                  <Label htmlFor="lot_size" className="text-gray-300">Lot Size</Label>
                  <Input
                    id="lot_size"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={autoTradingSettings.lot_size}
                    onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, lot_size: parseFloat(e.target.value) || 0.01 }))}
                    className="bg-tech-dark border-tech-blue/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stop_loss_pips" className="text-gray-300">Stop Loss (Pips)</Label>
                  <Input
                    id="stop_loss_pips"
                    type="number"
                    value={autoTradingSettings.stop_loss_pips}
                    onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, stop_loss_pips: parseInt(e.target.value) || 50 }))}
                    className="bg-tech-dark border-tech-blue/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="take_profit_pips" className="text-gray-300">Take Profit (Pips)</Label>
                  <Input
                    id="take_profit_pips"
                    type="number"
                    value={autoTradingSettings.take_profit_pips}
                    onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, take_profit_pips: parseInt(e.target.value) || 100 }))}
                    className="bg-tech-dark border-tech-blue/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="max_trades" className="text-gray-300">Max Concurrent Trades</Label>
                  <Input
                    id="max_trades"
                    type="number"
                    min="1"
                    max="10"
                    value={autoTradingSettings.max_trades}
                    onChange={(e) => setAutoTradingSettings(prev => ({ ...prev, max_trades: parseInt(e.target.value) || 5 }))}
                    className="bg-tech-dark border-tech-blue/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="trading_strategy" className="text-gray-300">Trading Strategy</Label>
                  <Select 
                    value={autoTradingSettings.trading_strategy} 
                    onValueChange={(value) => setAutoTradingSettings(prev => ({ ...prev, trading_strategy: value }))}
                  >
                    <SelectTrigger className="bg-tech-dark border-tech-blue/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scalping">Scalping</SelectItem>
                      <SelectItem value="trend_following">Trend Following</SelectItem>
                      <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                      <SelectItem value="breakout">Breakout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                {!isAutoTrading ? (
                  <Button 
                    onClick={handleStartAutoTrading}
                    disabled={!isConnected || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Start Auto Trading
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopAutoTrading}
                    disabled={isLoading}
                    variant="destructive"
                  >
                    Stop Auto Trading
                  </Button>
                )}
              </div>
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
                  Live trading positions from your MT5 account
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
                      <TableHead className="text-gray-300">Current P&L</TableHead>
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
                        <TableCell className={`${position.profit && position.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {position.profit ? formatCurrency(position.profit) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => closeOrder(position.ticket, position.open_price, position.profit || 0)}
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
                    {isConnected ? 'Start auto trading to see positions here' : 'Connect to MT5 to view positions'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Guide Tab */}
        <TabsContent value="setup">
          <Card className="bg-tech-charcoal border-tech-blue/30">
            <CardHeader>
              <CardTitle className="text-white">Setup Guide</CardTitle>
              <CardDescription className="text-gray-400">
                Follow these steps to connect your local MT5 terminal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="border-l-4 border-tech-blue pl-4">
                  <h3 className="text-white font-semibold mb-2">Step 1: Download MT5 Bridge</h3>
                  <p className="text-gray-300 mb-2">Download and run the Python MT5 bridge script on your computer where MT5 is installed.</p>
                  <Button 
                    onClick={() => window.open('/mt5_bridge.py', '_blank')}
                    variant="outline"
                    className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                  >
                    Download MT5 Bridge Script
                  </Button>
                </div>
                
                <div className="border-l-4 border-tech-blue pl-4">
                  <h3 className="text-white font-semibold mb-2">Step 2: Install Requirements</h3>
                  <p className="text-gray-300 mb-2">Install Python packages:</p>
                  <code className="bg-tech-dark p-2 rounded text-green-400 block">
                    pip install MetaTrader5 fastapi uvicorn requests websockets
                  </code>
                </div>
                
                <div className="border-l-4 border-tech-blue pl-4">
                  <h3 className="text-white font-semibold mb-2">Step 3: Run Bridge</h3>
                  <p className="text-gray-300 mb-2">Run the bridge script:</p>
                  <code className="bg-tech-dark p-2 rounded text-green-400 block">
                    python mt5_bridge.py
                  </code>
                </div>
                
                <div className="border-l-4 border-tech-blue pl-4">
                  <h3 className="text-white font-semibold mb-2">Step 4: Enable Auto Trading</h3>
                  <p className="text-gray-300">Make sure "AutoTrading" is enabled in your MT5 terminal (Tools → Options → Expert Advisors → Allow automated trading)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT5TradingInterface;
