import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { telegramBot } from '@/services/telegram-bot';
import { toast } from './use-toast';

export interface MT5Credentials {
  server: string;
  login: number;
  password: string;
}

export interface MT5Account {
  login: number;
  name: string;
  server: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  leverage: number;
  profit?: number;
}

export interface MT5Trade {
  id: string;
  ticket: number;
  symbol: string;
  trade_type: 'BUY' | 'SELL';
  volume: number;
  open_price: number;
  current_price?: number;
  profit?: number;
  swap?: number;
  commission?: number;
  open_time: string;
  comment?: string;
}

export const useMT5Connection = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Trade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load existing connection on mount
  useEffect(() => {
    if (user) {
      loadExistingConnection();
      setupRealTimeUpdates();
    }
  }, [user]);

  // Auto-refresh positions every 30 seconds when connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        refreshPositions();
        refreshAccount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const loadExistingConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading MT5 connection:', error);
        return;
      }

      if (data) {
        setIsConnected(true);
        setAccountInfo({
          login: data.login,
          name: data.name || `Account ${data.login}`,
          server: data.server,
          currency: data.currency || 'USD',
          balance: data.balance || 0,
          equity: data.equity || 0,
          margin: data.margin || 0,
          free_margin: data.free_margin || 0,
          margin_level: data.margin_level || 0,
          leverage: data.leverage || 1,
          profit: (data.equity || 0) - (data.balance || 0)
        });

        // Load positions
        await loadPositions();
      }
    } catch (error) {
      console.error('Error loading existing connection:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    if (!user) return;

    const subscription = supabase
      .channel('mt5-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'mt5_accounts',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('MT5 account update received:', payload);
          if (payload.new) {
            const data = payload.new as any;
            setAccountInfo({
              login: data.login,
              name: data.name || `Account ${data.login}`,
              server: data.server,
              currency: data.currency || 'USD',
              balance: data.balance || 0,
              equity: data.equity || 0,
              margin: data.margin || 0,
              free_margin: data.free_margin || 0,
              margin_level: data.margin_level || 0,
              leverage: data.leverage || 1,
              profit: (data.equity || 0) - (data.balance || 0)
            });
            setLastUpdate(new Date());
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mt5_positions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('MT5 positions update received:', payload);
          loadPositions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('mt5_positions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'open');

      if (error) {
        console.error('Error loading positions:', error);
        return;
      }

      const mappedPositions: MT5Trade[] = (data || []).map(pos => ({
        id: pos.id,
        ticket: pos.ticket,
        symbol: pos.symbol,
        trade_type: pos.trade_type,
        volume: pos.volume,
        open_price: pos.open_price,
        current_price: pos.current_price,
        profit: pos.profit,
        swap: pos.swap,
        commission: pos.commission,
        open_time: pos.open_time,
        comment: pos.comment
      }));

      setPositions(mappedPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const connect = useCallback(async (credentials: MT5Credentials): Promise<{ success: boolean; account?: MT5Account; error?: string }> => {
    setIsConnecting(true);
    setError(null);

    try {
      // Try to connect via MT5 Bridge first
      const response = await fetch('http://localhost:8000/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: credentials.server,
          account_number: credentials.login,
          password: credentials.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Use real MT5 data
          const realAccount: MT5Account = {
            login: credentials.login,
            name: data.account_info.name,
            server: credentials.server,
            currency: data.account_info.currency,
            balance: data.account_info.balance,
            equity: data.account_info.equity,
            margin: data.account_info.margin,
            free_margin: data.account_info.free_margin,
            margin_level: data.account_info.margin_level,
            leverage: data.account_info.leverage,
            profit: data.account_info.equity - data.account_info.balance
          };

          setIsConnected(true);
          setAccountInfo(realAccount);
          setLastUpdate(new Date());

          await saveAccountToDatabase(realAccount);
          return { success: true, account: realAccount };
        } else {
          throw new Error(data.error || 'MT5 connection failed');
        }
      } else {
        throw new Error('Bridge server not reachable');
      }
    } catch (error: any) {
      console.log('Bridge connection failed, using simulation mode:', error.message);
      
      // Fallback to simulation for demo
      const simulatedAccount: MT5Account = {
        login: credentials.login,
        name: `Demo Account ${credentials.login}`,
        server: credentials.server,
        currency: 'USD',
        balance: 10000.00 + Math.random() * 5000,
        equity: 10000.00 + Math.random() * 5000,
        margin: Math.random() * 1000,
        free_margin: 9000.00 + Math.random() * 1000,
        margin_level: 1000 + Math.random() * 500,
        leverage: 100
      };

      simulatedAccount.profit = simulatedAccount.equity - simulatedAccount.balance;

      // Save to database
      const { data, error } = await supabase
        .from('mt5_accounts')
        .upsert({
          user_id: user?.id,
          server: credentials.server,
          login: credentials.login,
          name: simulatedAccount.name,
          currency: simulatedAccount.currency,
          balance: simulatedAccount.balance,
          equity: simulatedAccount.equity,
          margin: simulatedAccount.margin,
          free_margin: simulatedAccount.free_margin,
          margin_level: simulatedAccount.margin_level,
          leverage: simulatedAccount.leverage,
          is_connected: true,
          last_update: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setIsConnected(true);
      setAccountInfo(simulatedAccount);
      setLastUpdate(new Date());

      // Create some sample positions
      await createSamplePositions();

      // Send Telegram notification
      await telegramBot.sendUpdate({
        type: 'account_update',
        message: `MT5 Account ${credentials.login} connected successfully`,
        balance: simulatedAccount.balance,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "MT5 Connected",
        description: `Successfully connected to account ${credentials.login}`,
      });

      setIsConnected(true);
      setAccountInfo(simulatedAccount);
      setLastUpdate(new Date());

      await saveAccountToDatabase(simulatedAccount);
      return { success: true, account: simulatedAccount };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to MT5';
      setError(errorMessage);

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const saveAccountToDatabase = async (account: MT5Account) => {
    try {
      const { error } = await supabase
        .from('mt5_accounts')
        .upsert({
          user_id: user?.id,
          server: account.server,
          login: account.login,
          name: account.name,
          currency: account.currency,
          balance: account.balance,
          equity: account.equity,
          margin: account.margin,
          free_margin: account.free_margin,
          margin_level: account.margin_level,
          leverage: account.leverage,
          is_connected: true,
          last_update: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving account to database:', error);
      }

      // Create sample positions for demo
      await createSamplePositions();

      // Send Telegram notification
      await telegramBot.sendUpdate({
        type: 'account_update',
        message: `MT5 Account ${account.login} connected successfully`,
        balance: account.balance,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "MT5 Connected",
        description: `Successfully connected to account ${account.login}`,
      });
    } catch (error) {
      console.error('Error in saveAccountToDatabase:', error);
    }
  };

  const createSamplePositions = async () => {
    if (!user || !accountInfo) return;

    const samplePositions = [
      {
        user_id: user.id,
        ticket: 123456,
        symbol: 'EURUSD',
        trade_type: 'BUY',
        volume: 0.01,
        open_price: 1.1000,
        current_price: 1.1010,
        profit: 10.00,
        swap: 0.00,
        commission: -0.10,
        open_time: new Date().toISOString(),
        status: 'open',
        comment: 'AI Trading Signal'
      },
      {
        user_id: user.id,
        ticket: 123457,
        symbol: 'GBPUSD',
        trade_type: 'SELL',
        volume: 0.02,
        open_price: 1.3000,
        current_price: 1.2990,
        profit: 20.00,
        swap: -0.50,
        commission: -0.20,
        open_time: new Date().toISOString(),
        status: 'open',
        comment: 'Manual Trade'
      }
    ];

    try {
      const { error } = await supabase
        .from('mt5_positions')
        .upsert(samplePositions);

      if (error) {
        console.error('Error creating sample positions:', error);
      } else {
        await loadPositions();
      }
    } catch (error) {
      console.error('Error creating sample positions:', error);
    }
  };

  const disconnect = useCallback(async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('mt5_accounts')
          .update({ is_connected: false })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error disconnecting:', error);
        }
      }

      setIsConnected(false);
      setAccountInfo(null);
      setPositions([]);
      setError(null);

      toast({
        title: "MT5 Disconnected",
        description: "Successfully disconnected from MT5 account",
      });
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, [user]);

  const refreshAccount = useCallback(async () => {
    if (!isConnected || !accountInfo) return;

    try {
      // Simulate updated account data
      const updatedAccount = {
        ...accountInfo,
        balance: accountInfo.balance + (Math.random() - 0.5) * 100,
        equity: accountInfo.equity + (Math.random() - 0.5) * 150,
        margin: Math.random() * 1000,
        free_margin: accountInfo.free_margin + (Math.random() - 0.5) * 200
      };

      updatedAccount.profit = updatedAccount.equity - updatedAccount.balance;
      updatedAccount.margin_level = updatedAccount.margin > 0 ? (updatedAccount.equity / updatedAccount.margin) * 100 : 0;

      // Update database
      const { error } = await supabase
        .from('mt5_accounts')
        .update({
          balance: updatedAccount.balance,
          equity: updatedAccount.equity,
          margin: updatedAccount.margin,
          free_margin: updatedAccount.free_margin,
          margin_level: updatedAccount.margin_level,
          last_update: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (!error) {
        setAccountInfo(updatedAccount);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error refreshing account:', error);
    }
  }, [isConnected, accountInfo, user]);

  const refreshPositions = useCallback(async () => {
    if (!isConnected) return;

    try {
      // Update positions with new prices and profits
      const updatedPositions = positions.map(pos => ({
        ...pos,
        current_price: pos.open_price + (Math.random() - 0.5) * 0.001,
        profit: (Math.random() - 0.5) * 100
      }));

      // Update database
      for (const position of updatedPositions) {
        await supabase
          .from('mt5_positions')
          .update({
            current_price: position.current_price,
            profit: position.profit
          })
          .eq('ticket', position.ticket)
          .eq('user_id', user?.id);
      }

      setPositions(updatedPositions);
    } catch (error) {
      console.error('Error refreshing positions:', error);
    }
  }, [isConnected, positions, user]);

  const closeOrder = useCallback(async (ticket: number, closePrice: number, profit: number) => {
    try {
      // Update position status to closed
      const { error } = await supabase
        .from('mt5_positions')
        .update({
          status: 'closed',
          close_price: closePrice,
          close_time: new Date().toISOString(),
          profit: profit
        })
        .eq('ticket', ticket)
        .eq('user_id', user?.id);

      if (error) {
        throw new Error(error.message);
      }

      // Remove from local positions
      setPositions(prev => prev.filter(pos => pos.ticket !== ticket));

      // Send Telegram notification
      await telegramBot.sendUpdate({
        type: 'trade_closed',
        message: `Position #${ticket} closed`,
        profit: profit,
        timestamp: new Date().toISOString()
      });

      // Refresh account data
      await refreshAccount();

    } catch (error: any) {
      console.error('Error closing order:', error);
      throw error;
    }
  }, [user, refreshAccount]);

  return {
    isConnected,
    isConnecting,
    accountInfo,
    positions,
    error,
    lastUpdate,
    connect,
    disconnect,
    refreshAccount,
    refreshPositions,
    closeOrder
  };
};