
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface ConnectedAccount {
  id: string;
  user_id: string;
  account_number: number;
  server: string;
  account_name?: string;
  broker?: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  leverage: number;
  is_connected: boolean;
  last_sync: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  account_id: string;
  sync_status: 'success' | 'failed' | 'partial';
  sync_data?: any;
  error_message?: string;
  sync_duration_ms?: number;
  created_at: string;
}

export const useConnectedAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadAccounts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mt5_connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load connected accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: {
    account_number: number;
    server: string;
    account_name?: string;
    broker?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mt5_connected_accounts')
        .insert({
          user_id: user.id,
          ...accountData
        })
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => [data, ...prev]);
      toast({
        title: "Account Added",
        description: `Account ${accountData.account_number} added successfully`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const syncAccount = async (accountId: string) => {
    setSyncing(true);
    const startTime = Date.now();
    
    try {
      // Call bridge API to sync account data
      const response = await fetch('http://localhost:8000/sync_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accountId }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.success) {
        // Update account in database
        const { error } = await supabase
          .from('mt5_connected_accounts')
          .update({
            balance: result.account_info.balance,
            equity: result.account_info.equity,
            margin: result.account_info.margin,
            free_margin: result.account_info.free_margin,
            margin_level: result.account_info.margin_level,
            is_connected: true,
            last_sync: new Date().toISOString()
          })
          .eq('id', accountId);

        if (error) throw error;

        // Log successful sync
        await supabase.rpc('update_account_sync_status', {
          account_id: accountId,
          sync_status: 'success',
          sync_data: result.account_info,
          sync_duration_ms: duration
        });

        toast({
          title: "Sync Successful",
          description: "Account data synchronized successfully",
        });
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      const duration = Date.now() - startTime;
      
      // Log failed sync
      await supabase.rpc('update_account_sync_status', {
        account_id: accountId,
        sync_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sync_duration_ms: duration
      });

      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync account",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
      await loadAccounts();
    }
  };

  const syncAllAccounts = async () => {
    for (const account of accounts) {
      if (account.is_connected) {
        await syncAccount(account.id);
      }
    }
  };

  const loadSyncLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('account_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadSyncLogs();
    }
  }, [user]);

  // Auto-sync every 30 seconds for connected accounts
  useEffect(() => {
    const interval = setInterval(() => {
      if (accounts.some(acc => acc.is_connected)) {
        syncAllAccounts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [accounts]);

  return {
    accounts,
    syncLogs,
    loading,
    syncing,
    loadAccounts,
    addAccount,
    syncAccount,
    syncAllAccounts,
    loadSyncLogs
  };
};
