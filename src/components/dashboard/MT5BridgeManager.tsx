
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Server, 
  Zap, 
  Settings, 
  Play, 
  Square, 
  RefreshCw,
  Terminal,
  Cpu,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BridgeStatus {
  running: boolean;
  mt5_connected: boolean;
  auto_trading: boolean;
  port: number;
  uptime?: number;
  version?: string;
  last_check?: string;
}

const MT5BridgeManager = () => {
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({
    running: false,
    mt5_connected: false,
    auto_trading: false,
    port: 8000
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionSettings, setConnectionSettings] = useState({
    server: '',
    account: '',
    password: ''
  });

  // Fixed bridge URL
  const BRIDGE_URL = 'http://127.0.0.1:8000';

  const checkBridgeStatus = async () => {
    try {
      addLog('🔄 Checking bridge status...');
      
      const response = await fetch(`${BRIDGE_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBridgeStatus({
          running: true,
          mt5_connected: data.mt5_connected || false,
          auto_trading: data.auto_trading_active || false,
          port: 8000,
          uptime: data.uptime,
          version: data.version,
          last_check: new Date().toLocaleTimeString()
        });
        addLog('✅ Bridge connection successful');
        
        if (data.mt5_connected) {
          addLog('✅ MT5 terminal connected');
        } else {
          addLog('⚠️ MT5 terminal not connected');
        }
        
        if (data.auto_trading_active) {
          addLog('🤖 Auto trading is active');
        }
      } else {
        throw new Error(`Bridge responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Bridge status check failed:', error);
      setBridgeStatus(prev => ({ 
        ...prev, 
        running: false, 
        mt5_connected: false,
        last_check: new Date().toLocaleTimeString()
      }));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addLog('❌ Cannot connect to bridge - Make sure MT5 Bridge is running on http://127.0.0.1:8000');
      } else {
        addLog(`❌ Bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const connectToMT5 = async () => {
    if (!connectionSettings.server || !connectionSettings.account || !connectionSettings.password) {
      toast({
        title: "Missing Credentials",
        description: "Please fill in all MT5 connection details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    addLog(`🔄 Connecting to MT5 server: ${connectionSettings.server}, Account: ${connectionSettings.account}`);

    try {
      const response = await fetch(`${BRIDGE_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: connectionSettings.server,
          account_number: parseInt(connectionSettings.account),
          password: connectionSettings.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.account_info) {
        setBridgeStatus(prev => ({ ...prev, mt5_connected: true }));
        addLog('✅ MT5 connection successful');
        addLog(`📊 Account: ${data.account_info.name} | Balance: ${data.account_info.currency} ${data.account_info.balance}`);
        addLog(`🏢 Company: ${data.account_info.company} | Leverage: 1:${data.account_info.leverage}`);
        
        toast({
          title: "Connected to MT5",
          description: `Successfully connected to ${data.account_info.name}`,
          className: "bg-green-500 text-white"
        });
        
        // Clear the form for security
        setConnectionSettings({ server: '', account: '', password: '' });
      } else {
        throw new Error(data.error || 'Connection failed - no account info received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ MT5 connection failed: ${errorMessage}`);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoTrading = async () => {
    setLoading(true);
    const action = bridgeStatus.auto_trading ? 'stop' : 'start';
    addLog(`🤖 ${action === 'start' ? 'Starting' : 'Stopping'} auto trading...`);

    try {
      const endpoint = action === 'start' ? '/start_auto_trading' : '/stop_auto_trading';
      const body = action === 'start' ? {
        symbol: 'EURUSD',
        lot_size: 0.01,
        stop_loss_pips: 50,
        take_profit_pips: 100,
        max_trades: 5,
        trading_strategy: 'scalping'
      } : {};

      const response = await fetch(`${BRIDGE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBridgeStatus(prev => ({ ...prev, auto_trading: !prev.auto_trading }));
        addLog(`✅ Auto trading ${action === 'start' ? 'started' : 'stopped'}`);
        
        if (action === 'start') {
          addLog(`📊 Trading EURUSD with 0.01 lot size, SL: 50 pips, TP: 100 pips`);
        }
        
        toast({
          title: `Auto Trading ${action === 'start' ? 'Started' : 'Stopped'}`,
          description: data.message,
          className: action === 'start' ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
        });
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Auto trading ${action} failed: ${errorMessage}`);
      toast({
        title: "Operation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const clearLogs = () => setLogs([]);

  // Enhanced status checking with better error handling
  useEffect(() => {
    // Initial check
    checkBridgeStatus();
    
    // Set up interval for regular checks
    const interval = setInterval(checkBridgeStatus, 5000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Bridge Status Card */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-cyan-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="relative">
              <Server className="w-6 h-6 text-cyan-400" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${bridgeStatus.running ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            </div>
            MT5 Bridge Control Center
            <Badge variant={bridgeStatus.running ? "default" : "destructive"} className="ml-auto">
              {bridgeStatus.running ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </CardTitle>
          {bridgeStatus.last_check && (
            <p className="text-sm text-gray-400">Last checked: {bridgeStatus.last_check}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                {bridgeStatus.running ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <span className="text-gray-300 text-sm">Bridge Status</span>
              </div>
              <p className={`font-bold ${bridgeStatus.running ? 'text-green-400' : 'text-red-400'}`}>
                {bridgeStatus.running ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-gray-500">Port: {bridgeStatus.port}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm">MT5 Status</span>
              </div>
              <p className={`font-bold ${bridgeStatus.mt5_connected ? 'text-green-400' : 'text-yellow-400'}`}>
                {bridgeStatus.mt5_connected ? 'Connected' : 'Disconnected'}
              </p>
              {!bridgeStatus.mt5_connected && (
                <p className="text-xs text-gray-500">Connect below</p>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">Auto Trading</span>
              </div>
              <p className={`font-bold ${bridgeStatus.auto_trading ? 'text-green-400' : 'text-gray-400'}`}>
                {bridgeStatus.auto_trading ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Connection Instructions */}
          {!bridgeStatus.running && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Bridge Not Running</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                To connect, please start the MT5 Bridge:
              </p>
              <ol className="text-gray-400 text-sm space-y-1 ml-4">
                <li>1. Open terminal/command prompt</li>
                <li>2. Navigate to your project folder</li>
                <li>3. Run: <code className="bg-gray-800 px-2 py-1 rounded">python public/mt5_bridge.py</code></li>
                <li>4. Ensure MT5 terminal is open with "Allow automated trading" enabled</li>
              </ol>
            </div>
          )}

          {/* Connection Form */}
          {bridgeStatus.running && !bridgeStatus.mt5_connected && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                MT5 Connection Settings
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="server" className="text-gray-300">Server</Label>
                  <Input
                    id="server"
                    value={connectionSettings.server}
                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, server: e.target.value }))}
                    placeholder="e.g., MetaQuotes-Demo"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="account" className="text-gray-300">Account</Label>
                  <Input
                    id="account"
                    value={connectionSettings.account}
                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, account: e.target.value }))}
                    placeholder="Account number"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={connectionSettings.password}
                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={connectToMT5}
                disabled={loading}
                className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Connect to MT5
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Trading Controls */}
          {bridgeStatus.mt5_connected && (
            <div className="flex gap-4">
              <Button
                onClick={toggleAutoTrading}
                disabled={loading}
                className={`${
                  bridgeStatus.auto_trading
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-green-600 hover:bg-green-500'
                } text-white`}
              >
                {bridgeStatus.auto_trading ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Auto Trading
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Auto Trading
                  </>
                )}
              </Button>
              
              <Button
                onClick={checkBridgeStatus}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Card */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              System Logs
            </div>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
            >
              Clear Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MT5BridgeManager;
