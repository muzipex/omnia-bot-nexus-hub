import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { useConnectedAccounts } from './use-connected-accounts';

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

export const useMT5Connection = () => {
  const { user } = useAuth();
  const { accounts, syncAccount } = useConnectedAccounts();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState({
    serverRunning: false,
    mt5Connected: false,
    autoTradingActive: false
  });

  // Fixed bridge URL with proper error handling
  const BRIDGE_URL = 'http://127.0.0.1:8000';

  const callMT5API = async (action: string, payload: any = {}) => {
    if (!user) throw new Error('Not authenticated');

    try {
      console.log(`Calling MT5 API: ${action}`, payload);
      
      const url = action === 'check_connection' ? 
        `${BRIDGE_URL}/status` : 
        `${BRIDGE_URL}/${action.replace('_', '/')}`;
      
      const response = await fetch(url, {
        method: action === 'check_connection' || action === 'get_account_info' || action === 'get_positions' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: (action === 'check_connection' || action === 'get_account_info' || action === 'get_positions') ? 
          undefined : JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`MT5 API ${action} response:`, result);
      return result;
    } catch (error) {
      console.error(`${action} error:`, error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to MT5 Bridge. Please ensure the bridge is running on http://127.0.0.1:8000');
      }
      
      throw error;
    }
  };

  const syncToSupabase = async (accountData: MT5Account, trades: MT5Trade[] = []) => {
    if (!user) return;

    try {
      console.log('Syncing to Supabase:', { accountData, tradesCount: trades.length });
      
      // Sync account data
      const { error: accountError } = await supabase
        .from('mt5_connected_accounts')
        .upsert({
          user_id: user.id,
          account_number: accountData.account_number,
          server: accountData.server,
          account_name: accountData.name,
          currency: accountData.currency,
          balance: accountData.balance,
          equity: accountData.equity,
          margin: accountData.margin || 0,
          free_margin: accountData.free_margin || 0,
          margin_level: accountData.margin_level || 0,
          leverage: accountData.leverage || 100,
          is_connected: true,
          last_sync: new Date().toISOString()
        }, {
          onConflict: 'user_id,account_number,server'
        });

      if (accountError) {
        console.error('Account sync error:', accountError);
        throw accountError;
      }

      // Sync trades if provided
      if (trades.length > 0) {
        const tradesData = trades.map(trade => ({
          user_id: user.id,
          ticket: trade.ticket,
          symbol: trade.symbol,
          trade_type: trade.trade_type,
          volume: trade.volume,
          open_price: trade.open_price,
          close_price: trade.close_price,
          stop_loss: trade.stop_loss,
          take_profit: trade.take_profit,
          open_time: trade.open_time,
          close_time: trade.close_time,
          profit: trade.profit,
          commission: trade.commission,
          swap: trade.swap,
          comment: trade.comment,
          magic_number: trade.magic_number,
          status: trade.status
        }));

        const { error: tradesError } = await supabase
          .from('mt5_trades')
          .upsert(tradesData, {
            onConflict: 'user_id,ticket'
          });

        if (tradesError) {
          console.error('Trades sync error:', tradesError);
          throw tradesError;
        }
      }

      console.log('Successfully synced to Supabase');
    } catch (error) {
      console.error('Supabase sync error:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync data to database",
        variant: "destructive"
      });
    }
  };

  const checkBridgeStatus = async () => {
    try {
      console.log('Checking bridge status...');
      const result = await callMT5API('check_connection');
      
      const newStatus = {
        serverRunning: true,
        mt5Connected: result.mt5_connected || false,
        autoTradingActive: result.auto_trading_active || false
      };
      
      setBridgeStatus(newStatus);
      setIsConnected(result.mt5_connected || false);
      setIsAutoTrading(result.auto_trading_active || false);
      
      console.log('Bridge status updated:', newStatus);
      
      // If MT5 is connected, load account info
      if (result.mt5_connected) {
        await loadAccountInfo();
      }
    } catch (error) {
      console.error('Bridge status check failed:', error);
      setBridgeStatus({
        serverRunning: false,
        mt5Connected: false,
        autoTradingActive: false
      });
      setIsConnected(false);
      setIsAutoTrading(false);
    }
  };

  const connectToMT5 = async (credentials: {
    server: string;
    account_number: number;
    password: string;
  }) => {
    setIsLoading(true);
    
    try {
      console.log('Connecting to MT5 with credentials:', { 
        server: credentials.server, 
        account_number: credentials.account_number 
      });
      
      const result = await callMT5API('connect', credentials);
      
      if (result?.success && result.account_info) {
        const accountData: MT5Account = {
          id: `${credentials.account_number}-${credentials.server}`,
          account_number: credentials.account_number,
          server: credentials.server,
          name: result.account_info.name || `Account ${credentials.account_number}`,
          currency: result.account_info.currency || 'USD',
          balance: result.account_info.balance || 0,
          equity: result.account_info.equity || 0,
          margin: result.account_info.margin || 0,
          free_margin: result.account_info.free_margin || 0,
          margin_level: result.account_info.margin_level || 0,
          leverage: result.account_info.leverage || 100,
          is_active: true,
          last_sync: new Date().toISOString()
        };

        setAccount(accountData);
        setIsConnected(true);
        setBridgeStatus(prev => ({ ...prev, mt5Connected: true }));

        // Sync to Supabase
        await syncToSupabase(accountData);

        toast({
          title: "Connected to MT5",
          description: `Successfully connected to account ${credentials.account_number}`,
        });
        
        // Load initial positions
        await loadPositions();
      } else {
        throw new Error(result?.error || 'Connection failed - no account info received');
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      setIsConnected(false);
      setAccount(null);
      setBridgeStatus(prev => ({ ...prev, mt5Connected: false }));
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to MT5",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountInfo = async () => {
    try {
      console.log('Loading account info...');
      const result = await callMT5API('account_info');
      
      if (result.success && result.account_info) {
        const accountData: MT5Account = {
          id: `${result.account_info.login || result.account_info.account_number}-${result.account_info.server || 'unknown'}`,
          account_number: result.account_info.login || result.account_info.account_number,
          server: result.account_info.server || 'unknown',
          name: result.account_info.name || `Account ${result.account_info.login || result.account_info.account_number}`,
          currency: result.account_info.currency || 'USD',
          balance: result.account_info.balance || 0,
          equity: result.account_info.equity || 0,
          margin: result.account_info.margin || 0,
          free_margin: result.account_info.free_margin || 0,
          margin_level: result.account_info.margin_level || 0,
          leverage: result.account_info.leverage || 100,
          is_active: true,
          last_sync: new Date().toISOString()
        };
        
        setAccount(accountData);
        setIsConnected(true);
        
        // Sync to Supabase
        await syncToSupabase(accountData);
      }
    } catch (error) {
      console.error('Load account error:', error);
      // Don't set disconnected on account info failure - might be temporary
    }
  };

  const loadPositions = async () => {
    try {
      console.log('Loading positions...');
      const result = await callMT5API('positions');
      
      if (result.success && Array.isArray(result.positions)) {
        const formattedPositions: MT5Trade[] = result.positions.map((pos: any) => ({
          id: pos.ticket.toString(),
          ticket: pos.ticket,
          symbol: pos.symbol,
          trade_type: pos.type,
          volume: pos.volume,
          open_price: pos.price_open,
          close_price: pos.price_current,
          stop_loss: pos.sl,
          take_profit: pos.tp,
          profit: pos.profit,
          commission: pos.commission,
          swap: pos.swap,
          open_time: pos.time_setup || new Date().toISOString(),
          status: 'OPEN',
          comment: pos.comment
        }));
        
        setPositions(formattedPositions);
        
        // Sync trades to Supabase
        if (account) {
          await syncToSupabase(account, formattedPositions);
        }
        
        console.log(`Loaded ${formattedPositions.length} positions`);
      } else {
        console.log('No positions found or invalid response');
        setPositions([]);
      }
    } catch (error) {
      console.error('Load positions error:', error);
      // Don't clear positions on error - might be temporary network issue
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
        return result.trade_info || { ticket: result.ticket };
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

  const closeOrder = async (ticket: number) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('close_order', { ticket });
      
      if (result.success) {
        toast({
          title: "Order Closed",
          description: `Position #${ticket} closed`,
        });
        await loadPositions();
        return result;
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

  const startAutoTrading = async (settings: {
    symbol: string;
    lot_size: number;
    stop_loss_pips: number;
    take_profit_pips: number;
    max_trades: number;
    trading_strategy: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('start_auto_trading', settings);
      
      if (result.success) {
        setIsAutoTrading(true);
        setBridgeStatus(prev => ({ ...prev, autoTradingActive: true }));
        toast({
          title: "Auto Trading Started",
          description: `Trading ${settings.symbol} with ${settings.lot_size} lot size`,
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
        setBridgeStatus(prev => ({ ...prev, autoTradingActive: false }));
        toast({
          title: "Auto Trading Stopped",
          description: "All automated trading has been stopped",
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

  // Enhanced real-time sync with better error handling
  useEffect(() => {
    if (!isConnected || !user) return;

    console.log('Starting real-time sync interval');
    const syncInterval = setInterval(async () => {
      try {
        await Promise.all([
          loadAccountInfo(),
          loadPositions()
        ]);
      } catch (error) {
        console.error('Real-time sync error:', error);
        // Don't spam errors, just log them
      }
    }, 3000); // Sync every 3 seconds for real-time updates

    return () => {
      console.log('Stopping real-time sync interval');
      clearInterval(syncInterval);
    };
  }, [isConnected, user]);

  // Enhanced bridge status check with better timing
  useEffect(() => {
    console.log('Setting up bridge status monitoring');
    
    // Initial check
    checkBridgeStatus();
    
    // Periodic checks
    const statusInterval = setInterval(checkBridgeStatus, 10000); // Check every 10 seconds
    
    return () => {
      console.log('Stopping bridge status monitoring');
      clearInterval(statusInterval);
    };
  }, []);

  return {
    isConnected,
    account,
    positions,
    isLoading,
    isAutoTrading,
    bridgeStatus,
    connectToMT5,
    placeOrder,
    closeOrder,
    loadAccountInfo,
    loadPositions,
    checkBridgeStatus,
    startAutoTrading,
    stopAutoTrading,
  };
};
