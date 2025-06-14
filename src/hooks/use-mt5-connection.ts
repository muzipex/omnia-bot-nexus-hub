
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

  const callMT5API = async (action: string, payload: any = {}) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const response = await fetch(`http://localhost:8000/${action}`, {
        method: action === 'check_connection' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'check_connection' ? undefined : JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${action} error:`, error);
      throw error;
    }
  };

  const syncToSupabase = async (accountData: MT5Account, trades: MT5Trade[] = []) => {
    if (!user) return;

    try {
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

      if (accountError) throw accountError;

      // Sync trades
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

        if (tradesError) throw tradesError;
      }

      console.log('Data synced to Supabase successfully');
    } catch (error) {
      console.error('Supabase sync error:', error);
    }
  };

  const checkBridgeStatus = async () => {
    try {
      const result = await callMT5API('check_connection');
      setBridgeStatus({
        serverRunning: true,
        mt5Connected: result.connected || false,
        autoTradingActive: result.auto_trading_active || false
      });
      setIsConnected(result.connected);
    } catch (error) {
      setBridgeStatus({
        serverRunning: false,
        mt5Connected: false,
        autoTradingActive: false
      });
      setIsConnected(false);
    }
  };

  const connectToMT5 = async (credentials: {
    server: string;
    account_number: number;
    password: string;
  }) => {
    setIsLoading(true);
    
    try {
      const result = await callMT5API('connect', credentials);
      
      if (result?.success) {
        const accountData: MT5Account = {
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

        // Sync to Supabase
        await syncToSupabase(accountData);

        toast({
          title: "Connected to MT5",
          description: `Successfully connected to account ${credentials.account_number}`,
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

  const loadAccountInfo = async () => {
    try {
      const result = await callMT5API('get_account_info');
      if (result.success && result.account) {
        const accountData: MT5Account = {
          id: `${result.account.account_number}-${result.account.server}`,
          account_number: result.account.account_number,
          server: result.account.server,
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
        
        // Sync to Supabase
        await syncToSupabase(accountData);
      }
    } catch (error) {
      console.error('Load account error:', error);
      setIsConnected(false);
    }
  };

  const loadPositions = async () => {
    try {
      const result = await callMT5API('get_positions');
      if (result.success && result.positions) {
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
          open_time: pos.time_setup,
          status: 'OPEN'
        }));
        
        setPositions(formattedPositions);
        
        // Sync trades to Supabase
        if (account) {
          await syncToSupabase(account, formattedPositions);
        }
      }
    } catch (error) {
      console.error('Load positions error:', error);
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

  const closeOrder = async (ticket: number, close_price?: number, profit?: number) => {
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

  // Real-time sync effect
  useEffect(() => {
    if (!isConnected || !user) return;

    const syncInterval = setInterval(async () => {
      await loadAccountInfo();
      await loadPositions();
    }, 2000); // Sync every 2 seconds for real-time updates

    return () => clearInterval(syncInterval);
  }, [isConnected, user]);

  // Bridge status check
  useEffect(() => {
    checkBridgeStatus();
    const statusInterval = setInterval(checkBridgeStatus, 5000);
    return () => clearInterval(statusInterval);
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
