import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface MT5Account {
  id: string;
  account_number: number;
  server: string;
  name: string;
  company?: string;
  currency: string;
  balance: number;
  equity: number;
  margin?: number;
  free_margin?: number;
  margin_level?: number;
  leverage?: number;
  is_active: boolean;
  last_sync: string;
}

export interface MT5Trade {
  id: string;
  ticket: number;
  symbol: string;
  trade_type: string;
  volume: number;
  open_price: number;
  close_price?: number;
  stop_loss?: number;
  take_profit?: number;
  open_time: string;
  close_time?: string;
  profit?: number;
  commission?: number;
  swap?: number;
  comment?: string;
  magic_number?: number;
  status: string;
}

interface BridgeStatus {
  serverRunning: boolean;
  mt5Connected: boolean;
  autoTradingActive: boolean;
}

export const useMT5Connection = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({
    serverRunning: false,
    mt5Connected: false,
    autoTradingActive: false
  });
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [lastCredentials, setLastCredentials] = useState<{
    server: string;
    account_number: number;
    password: string;
  } | null>(null);

  const callMT5API = async (action: string, payload: any = {}) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const response = await fetch(`http://localhost:8000/${action}`, {
        method: action === 'check_connection' || action === 'logs' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'check_connection' || action === 'logs' ? undefined : JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success && action !== 'check_connection') {
        throw new Error(result.error || `${action} failed`);
      }

      return result;
    } catch (error) {
      console.error(`${action} error:`, error);
      throw error;
    }
  };

  const checkBridgeStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/check_connection');
      const result = await response.json();
      
      setBridgeStatus(prev => ({
        ...prev,
        serverRunning: true,
        mt5Connected: result.connected
      }));
      
      if (!result.connected && isConnected) {
        setIsConnected(false);
        toast({
          title: "MT5 Connection Lost",
          description: result.error || "Lost connection to MT5",
          variant: "destructive"
        });
      } else if (result.connected && !isConnected && lastCredentials) {
        // Try to reconnect if we have credentials
        await reconnectToMT5();
      }
    } catch (error) {
      setBridgeStatus(prev => ({
        ...prev,
        serverRunning: false,
        mt5Connected: false
      }));
      setIsConnected(false);
      toast({
        title: "Bridge Server Error",
        description: "Unable to reach MT5 bridge server",
        variant: "destructive"
      });
    }
  };

  const fetchServerLogs = async () => {
    try {
      const result = await callMT5API('logs');
      if (result.success && result.logs) {
        setServerLogs(result.logs);
      }
    } catch (error) {
      console.error('Failed to fetch server logs:', error);
    }
  };

  const connectToMT5 = async (credentials: {
    server: string;
    account_number: number;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      // First verify bridge is running
      await checkBridgeStatus();
      
      if (!bridgeStatus.serverRunning) {
        throw new Error('MT5 bridge server is not running. Please start the bridge application first.');
      }

      const result = await callMT5API('connect', credentials);
      
      if (result.success) {
        setAccount(result.account);
        setIsConnected(true);
        setLastCredentials(credentials);
        setBridgeStatus(prev => ({
          ...prev,
          mt5Connected: true
        }));
        toast({
          title: "Connected to MT5",
          description: `Connected to account ${credentials.account_number}`,
        });
        await loadPositions();
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      setIsConnected(false);
      setAccount(null);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to MT5",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async (orderData: {
    symbol: string;
    trade_type: 'BUY' | 'SELL';
    volume: number;
    price: number;
    stop_loss?: number;
    take_profit?: number;
    comment?: string;
    magic_number?: number;
  }) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('place_order', orderData);
      if (result.success) {
        toast({
          title: "Order Placed",
          description: `${orderData.trade_type} ${orderData.volume} lots of ${orderData.symbol}`,
        });
        await loadPositions();
        return result.trade;
      } else {
        throw new Error(result.error || 'Order failed');
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const closeOrder = async (ticket: number, close_price: number, profit: number) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('close_order', { ticket, close_price, profit });
      if (result.success) {
        toast({
          title: "Order Closed",
          description: `Position #${ticket} closed`,
        });
        await loadPositions();
        return result.trade;
      } else {
        throw new Error(result.error || 'Close failed');
      }
    } catch (error) {
      console.error('Close order error:', error);
      toast({
        title: "Close Failed",
        description: error instanceof Error ? error.message : "Failed to close order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startAutoTrading = async (settings: any) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('start_auto_trading', settings);
      if (result.success) {
        setIsAutoTrading(true);
        toast({
          title: "Auto Trading Started",
          description: `Bot started trading ${settings.symbol} with ${settings.trading_strategy} strategy`,
        });
      } else {
        throw new Error(result.error || 'Failed to start auto trading');
      }
    } catch (error) {
      console.error('Start auto trading error:', error);
      toast({
        title: "Auto Trading Failed",
        description: error instanceof Error ? error.message : "Failed to start auto trading",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopAutoTrading = async () => {
    setIsLoading(true);
    try {
      const result = await callMT5API('stop_auto_trading');
      if (result.success) {
        setIsAutoTrading(false);
        toast({
          title: "Auto Trading Stopped",
          description: "Trading bot has been stopped",
        });
      } else {
        throw new Error(result.error || 'Failed to stop auto trading');
      }
    } catch (error) {
      console.error('Stop auto trading error:', error);
      toast({
        title: "Stop Failed",
        description: error instanceof Error ? error.message : "Failed to stop auto trading",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountInfo = async () => {
    try {
      const result = await callMT5API('get_account_info');
      if (result.account) {
        setAccount(result.account);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Load account error:', error);
      setIsConnected(false);
    }
  };

  const loadPositions = async () => {
    try {
      const result = await callMT5API('get_positions');
      setPositions(result.positions || []);
    } catch (error) {
      console.error('Load positions error:', error);
    }
  };

  const syncTrades = async (trades: Partial<MT5Trade>[]) => {
    try {
      await callMT5API('sync_trades', { trades });
      await loadPositions();
    } catch (error) {
      console.error('Sync trades error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAccountInfo();
    }
  }, [user]);

  // Auto refresh positions and account info when auto trading is active
 useEffect(() => {
    // Check MT5 connection status periodically
    if (isConnected) {
      const connectionCheck = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/check_connection');
          const result = await response.json();
          
          if (!result.connected) {
            setIsConnected(false);
            setAccount(null);
            toast({
              title: "MT5 Connection Lost",
              description: result.error || "Lost connection to MT5",
              variant: "destructive"
            });
          }
        } catch (error) {
          setIsConnected(false);
          setAccount(null);
          toast({
            title: "Connection Error",
            description: "Unable to reach MT5 bridge server",
            variant: "destructive"
          });
        }
      }, 5000); // Check every 5 seconds

      // Refresh account info and positions regularly
      const dataRefresh = setInterval(() => {
        if (isConnected) {
          loadPositions();
          loadAccountInfo();
        }
      }, 3000); // Refresh data every 3 seconds

      // Cleanup intervals on unmount or when disconnected
      return () => {
        clearInterval(connectionCheck);
        clearInterval(dataRefresh);
      };
    }
  }, [isConnected]); // Only depend on isConnected state

  // Keep the user effect separate
  useEffect(() => {
    if (user) {
      loadAccountInfo();
    }
  }, [user]);

  // Handle auto trading updates separately
  useEffect(() => {
    let autoTradingInterval: NodeJS.Timeout | null = null;

    if (isAutoTrading && isConnected) {
      autoTradingInterval = setInterval(() => {
        loadPositions();
        loadAccountInfo();
      }, 1000); // More frequent updates during auto trading
    }

    return () => {
      if (autoTradingInterval) {
        clearInterval(autoTradingInterval);
      }
    };
  }, [isAutoTrading, isConnected]);

  // Update your reconnection mechanism
  const reconnectToMT5 = async () => {
    if (!lastCredentials) return;
    
    try {
      await connectToMT5(lastCredentials);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  };

  // Unified status check effect
  useEffect(() => {
    const statusCheck = setInterval(async () => {
      if (!bridgeStatus.serverRunning) {
        await checkBridgeStatus();
      }
      if (isConnected) {
        await fetchServerLogs();
        await loadPositions();
        await loadAccountInfo();
      }
    }, 3000);

    // Initial check
    checkBridgeStatus();

    return () => clearInterval(statusCheck);
  }, [isConnected, bridgeStatus.serverRunning]);

  return {
    isConnected,
    account,
    positions,
    isLoading,
    isAutoTrading,
    bridgeStatus,
    serverLogs,
    connectToMT5,
    placeOrder,
    closeOrder,
    loadAccountInfo,
    loadPositions,
    syncTrades,
    startAutoTrading,
    stopAutoTrading,
    checkBridgeStatus,
    fetchServerLogs,
  };
};
