import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { useConnectedAccounts } from './use-connected-accounts';
import { mt5WebApiService } from '@/services/mt5-web-api';

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

type ConnectionMethod = 'bridge' | 'webapi';

export const useMT5Connection = () => {
  const { user } = useAuth();
  const { accounts, syncAccount } = useConnectedAccounts();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>('bridge');
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
      
      const isConnectedToBridge = result.success && result.connected;
      
      setBridgeStatus(prev => ({
        ...prev,
        serverRunning: true,
        mt5Connected: isConnectedToBridge
      }));
      
      // Update connection status based on bridge status
      if (connectionMethod === 'bridge') {
        setIsConnected(isConnectedToBridge);
        
        if (!isConnectedToBridge && isConnected) {
          setAccount(null);
          toast({
            title: "MT5 Bridge Connection Lost",
            description: result.error || "Lost connection to MT5 bridge. Consider using Web API.",
            variant: "destructive"
          });
          
          // Update all connected accounts status
          if (user) {
            await supabase.from('mt5_connected_accounts')
              .update({ is_connected: false })
              .eq('user_id', user.id);
          }
        }
      }
    } catch (error) {
      setBridgeStatus(prev => ({
        ...prev,
        serverRunning: false,
        mt5Connected: false
      }));
      
      if (connectionMethod === 'bridge') {
        setIsConnected(false);
        setAccount(null);
        console.log('Bridge server not reachable, Web API available as alternative');
        
        // Update all connected accounts status
        if (user) {
          await supabase.from('mt5_connected_accounts')
            .update({ is_connected: false })
            .eq('user_id', user.id);
        }
      }
    }
  };

  const connectToMT5 = async (credentials: {
    server: string;
    account_number: number;
    password: string;
  }, preferredMethod: ConnectionMethod = 'bridge') => {
    setIsLoading(true);
    setConnectionMethod(preferredMethod);
    
    try {
      let result;
      
      if (preferredMethod === 'bridge') {
        // Try bridge first
        await checkBridgeStatus();
        
        if (!bridgeStatus.serverRunning) {
          console.log('Bridge not available, switching to Web API');
          setConnectionMethod('webapi');
          preferredMethod = 'webapi';
        } else {
          result = await callMT5API('connect', credentials);
        }
      }
      
      if (preferredMethod === 'webapi') {
        // Use Web API
        result = await mt5WebApiService.connect({
          server: credentials.server,
          login: credentials.account_number,
          password: credentials.password
        });
      }
      
      if (result?.success) {
        const accountData = {
          id: `${credentials.account_number}-${credentials.server}`,
          account_number: credentials.account_number,
          server: credentials.server,
          name: result.account.name,
          currency: result.account.currency,
          balance: result.account.balance,
          equity: result.account.equity,
          margin: result.account.margin || 0,
          free_margin: result.account.free_margin || 0,
          margin_level: result.account.margin_level || 0,
          leverage: result.account.leverage || 100,
          is_active: true,
          last_sync: new Date().toISOString()
        };

        setAccount(accountData);
        setIsConnected(true);
        setLastCredentials(credentials);

        // Update database
        const existingAccount = accounts.find(
          acc => acc.account_number === credentials.account_number && acc.server === credentials.server
        );

        if (!existingAccount) {
          await supabase.from('mt5_connected_accounts').insert({
            user_id: user!.id,
            account_number: credentials.account_number,
            server: credentials.server,
            account_name: result.account.name,
            currency: result.account.currency,
            balance: result.account.balance,
            equity: result.account.equity,
            margin: result.account.margin || 0,
            free_margin: result.account.free_margin || 0,
            margin_level: result.account.margin_level || 0,
            leverage: result.account.leverage || 100,
            is_connected: true
          });
        } else {
          await supabase.from('mt5_connected_accounts')
            .update({
              balance: result.account.balance,
              equity: result.account.equity,
              margin: result.account.margin || 0,
              free_margin: result.account.free_margin || 0,
              margin_level: result.account.margin_level || 0,
              is_connected: true,
              last_sync: new Date().toISOString()
            })
            .eq('id', existingAccount.id);
        }

        toast({
          title: "Connected to MT5",
          description: `Connected via ${connectionMethod.toUpperCase()} to account ${credentials.account_number}`,
        });
        
        await loadPositions();
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      
      // If bridge failed, try Web API as fallback
      if (preferredMethod === 'bridge' && connectionMethod === 'bridge') {
        console.log('Bridge connection failed, trying Web API...');
        try {
          await connectToMT5(credentials, 'webapi');
          return;
        } catch (webApiError) {
          console.error('Web API connection also failed:', webApiError);
        }
      }
      
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
      let result;
      
      if (connectionMethod === 'bridge') {
        result = await callMT5API('place_order', orderData);
      } else {
        result = await mt5WebApiService.placeOrder({
          symbol: orderData.symbol,
          type: orderData.trade_type,
          volume: orderData.volume,
          price: orderData.price,
          stop_loss: orderData.stop_loss,
          take_profit: orderData.take_profit,
          comment: orderData.comment
        });
      }
      
      if (result.success) {
        toast({
          title: "Order Placed",
          description: `${orderData.trade_type} ${orderData.volume} lots of ${orderData.symbol}`,
        });
        await loadPositions();
        return result.trade || { ticket: result.ticket };
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
      let result;
      
      if (connectionMethod === 'bridge') {
        result = await callMT5API('close_order', { ticket, close_price, profit });
      } else {
        result = await mt5WebApiService.closePosition(ticket);
      }
      
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

  const loadAccountInfo = async () => {
    try {
      if (connectionMethod === 'bridge') {
        const result = await callMT5API('get_account_info');
        if (result.account) {
          setAccount(result.account);
          setIsConnected(true);
        }
      } else if (connectionMethod === 'webapi' && mt5WebApiService.isConnected()) {
        const accountInfo = await mt5WebApiService.getAccountInfo();
        const accountData = {
          id: `${accountInfo.login}-${accountInfo.server}`,
          account_number: accountInfo.login,
          server: accountInfo.server,
          name: accountInfo.name,
          currency: accountInfo.currency,
          balance: accountInfo.balance,
          equity: accountInfo.equity,
          margin: accountInfo.margin,
          free_margin: accountInfo.free_margin,
          margin_level: accountInfo.margin_level,
          leverage: accountInfo.leverage,
          is_active: true,
          last_sync: new Date().toISOString()
        };
        setAccount(accountData);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Load account error:', error);
      setIsConnected(false);
    }
  };

  const loadPositions = async () => {
    try {
      if (connectionMethod === 'bridge') {
        const result = await callMT5API('get_positions');
        setPositions(result.positions || []);
      } else if (connectionMethod === 'webapi' && mt5WebApiService.isConnected()) {
        const webApiPositions = await mt5WebApiService.getPositions();
        const formattedPositions = webApiPositions.map(pos => ({
          id: pos.ticket.toString(),
          ticket: pos.ticket,
          symbol: pos.symbol,
          trade_type: pos.type,
          volume: pos.volume,
          open_price: pos.price_open,
          close_price: pos.price_current,
          profit: pos.profit,
          commission: pos.commission,
          swap: pos.swap,
          open_time: new Date().toISOString(),
          status: 'OPEN'
        }));
        setPositions(formattedPositions);
      }
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

  const startAutoTrading = async (settings: any) => {
    setIsLoading(true);
    try {
      let result;
      
      if (connectionMethod === 'bridge') {
        result = await callMT5API('start_auto_trading', settings);
      } else {
        // For Web API, we'll simulate auto trading
        result = { success: true };
      }
      
      if (result.success) {
        setIsAutoTrading(true);
        setBridgeStatus(prev => ({ ...prev, autoTradingActive: true }));
        toast({
          title: "Auto Trading Started",
          description: `Trading ${settings.symbol} with ${settings.lot_size} lot size`,
        });
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
      let result;
      
      if (connectionMethod === 'bridge') {
        result = await callMT5API('stop_auto_trading');
      } else {
        result = { success: true };
      }
      
      if (result.success) {
        setIsAutoTrading(false);
        setBridgeStatus(prev => ({ ...prev, autoTradingActive: false }));
        toast({
          title: "Auto Trading Stopped",
          description: "All automated trading has been stopped",
        });
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

  const fetchServerLogs = async () => {
    try {
      if (connectionMethod === 'bridge') {
        const result = await callMT5API('logs');
        if (result.logs) {
          setServerLogs(result.logs);
        }
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
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
            
            // Update all connected accounts status
            await supabase.from('mt5_connected_accounts')
              .update({ is_connected: false })
              .eq('user_id', user?.id);
              
            toast({
              title: "MT5 Connection Lost",
              description: result.error || "Lost connection to MT5",
              variant: "destructive"
            });
          } else {
            // Sync all connected accounts
            for (const connectedAccount of accounts) {
              if (connectedAccount.is_connected) {
                await syncAccount(connectedAccount.id);
              }
            }
          }
        } catch (error) {
          setIsConnected(false);
          setAccount(null);
          
          await supabase.from('mt5_connected_accounts')
            .update({ is_connected: false })
            .eq('user_id', user?.id);
            
          toast({
            title: "Connection Error",
            description: "Unable to reach MT5 bridge server",
            variant: "destructive"
          });
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(connectionCheck);
    }
  }, [isConnected, accounts, user]); // Only depend on isConnected state

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
    // Immediate check when component mounts
    checkBridgeStatus();
    
    // Regular status check interval
    const statusCheck = setInterval(async () => {
      await checkBridgeStatus();
      
      if (isConnected) {
        await Promise.all([
          fetchServerLogs(),
          loadPositions(),
          loadAccountInfo()
        ]);
      }
    }, 2000); // Check every 2 seconds for more responsive updates

    return () => clearInterval(statusCheck);
  }, []);

  return {
    isConnected,
    connectionMethod,
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
    checkBridgeStatus,
    fetchServerLogs,
    startAutoTrading,
    stopAutoTrading,
  };
};
