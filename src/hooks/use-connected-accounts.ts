
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadAccounts = async () => {
    if (!user) return;

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
    if (!user) return false;

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
        title: "Success",
        description: "Account added successfully"
      });
      return true;
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('mt5_connected_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast({
        title: "Success",
        description: "Account removed successfully"
      });
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive"
      });
    }
  };

  const syncAccount = async (accountId: string) => {
    setSyncing(true);
    const startTime = Date.now();

    try {
      // Find the account
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      // Try to connect to local MT5 bridge
      const bridgeUrl = 'http://localhost:8000';
      
      // Test bridge connection
      const statusResponse = await fetch(`${bridgeUrl}/status`);
      if (!statusResponse.ok) {
        throw new Error('MT5 Bridge not running on localhost:8000');
      }

      // Get account info from bridge
      const accountResponse = await fetch(`${bridgeUrl}/account_info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!accountResponse.ok) {
        throw new Error('Failed to get account info from bridge');
      }

      const accountData = await accountResponse.json();
      
      if (!accountData.success) {
        throw new Error(accountData.error || 'Unknown error from bridge');
      }

      // Update account with fresh data
      const { error: updateError } = await supabase
        .from('mt5_connected_accounts')
        .update({
          balance: accountData.account_info.balance,
          equity: accountData.account_info.equity,
          margin: accountData.account_info.margin,
          free_margin: accountData.account_info.free_margin,
          margin_level: accountData.account_info.margin_level,
          is_connected: true,
          last_sync: new Date().toISOString()
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Log successful sync
      const syncDuration = Date.now() - startTime;
      await supabase.rpc('update_account_sync_status', {
        account_id: accountId,
        sync_status: 'success',
        sync_data: accountData.account_info,
        sync_duration_ms: syncDuration
      });

      // Reload accounts to reflect changes
      await loadAccounts();

      toast({
        title: "Sync Complete",
        description: `Account synchronized successfully in ${syncDuration}ms`
      });

    } catch (error) {
      console.error('Sync error:', error);
      
      // Log failed sync
      const syncDuration = Date.now() - startTime;
      await supabase.rpc('update_account_sync_status', {
        account_id: accountId,
        sync_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sync_duration_ms: syncDuration
      });

      // Update account as disconnected
      await supabase
        .from('mt5_connected_accounts')
        .update({
          is_connected: false,
          last_sync: new Date().toISOString()
        })
        .eq('id', accountId);

      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const loadSyncLogs = async (accountId?: string) => {
    try {
      let query = supabase
        .from('account_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type assertion to fix the sync_status type issue
      const typedLogs = (data || []).map(log => ({
        ...log,
        sync_status: log.sync_status as 'success' | 'failed' | 'partial'
      }));

      setSyncLogs(typedLogs);
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

  return {
    accounts,
    syncLogs,
    loading,
    syncing,
    addAccount,
    removeAccount,
    syncAccount,
    loadAccounts,
    loadSyncLogs
  };
};
