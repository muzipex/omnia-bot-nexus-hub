
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

export const useMT5Connection = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const callMT5API = async (action: string, payload: any = {}) => {
    if (!user) throw new Error('Not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const response = await fetch('/functions/v1/mt5-api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const connectToMT5 = async (accountData: {
    account_number: number;
    server: string;
    name: string;
    company?: string;
    currency: string;
    balance: number;
    equity: number;
  }) => {
    setIsLoading(true);
    try {
      const result = await callMT5API('connect', accountData);
      setAccount(result.account);
      setIsConnected(true);
      toast({
        title: "Connected to MT5",
        description: `Connected to account ${accountData.account_number}`,
      });
      await loadPositions();
    } catch (error) {
      console.error('MT5 connection error:', error);
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
      toast({
        title: "Order Placed",
        description: `${orderData.trade_type} ${orderData.volume} lots of ${orderData.symbol}`,
      });
      await loadPositions();
      return result.trade;
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
      toast({
        title: "Order Closed",
        description: `Position #${ticket} closed`,
      });
      await loadPositions();
      return result.trade;
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

  return {
    isConnected,
    account,
    positions,
    isLoading,
    connectToMT5,
    placeOrder,
    closeOrder,
    loadAccountInfo,
    loadPositions,
    syncTrades,
  };
};
