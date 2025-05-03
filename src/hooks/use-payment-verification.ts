
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentVerification = (transactionId?: string) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'offline' | 'checking'>('checking');

  // Function to check database connection
  const checkDbConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('transactions').select('count').limit(1);
      const isConnected = !error;
      setDbConnectionStatus(isConnected ? 'connected' : 'offline');
      return isConnected;
    } catch (error) {
      console.error("Database connection error:", error);
      setDbConnectionStatus('offline');
      return false;
    }
  }, []);

  // Function to attempt to sync local transactions to database
  const syncLocalTransactions = useCallback(async () => {
    if (dbConnectionStatus !== 'connected') return;
    
    try {
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      
      // Only sync transactions that haven't been sent to the database yet
      const needsSync = pendingTransactions.filter((tx: any) => tx.synced !== true);
      
      if (needsSync.length === 0) return;
      
      for (const tx of needsSync) {
        const { error } = await supabase
          .from('transactions')
          .insert([{
            tx_id: tx.txId,
            plan_id: tx.planId,
            price: tx.price,
            name: tx.name,
            timestamp: new Date(tx.timestamp).toISOString(),
            status: tx.status,
            payment_method: 'USDT'
          }]);
          
        if (!error) {
          // Mark as synced in localStorage
          const updatedTx = { ...tx, synced: true };
          const updatedTransactions = pendingTransactions.map((t: any) => 
            t.txId === tx.txId ? updatedTx : t
          );
          localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
          
          if (tx.txId === transactionId) {
            toast.success("Your transaction has been synced with the server");
          }
        }
      }
    } catch (error) {
      console.error("Error syncing transactions:", error);
    }
  }, [dbConnectionStatus, transactionId]);

  useEffect(() => {
    if (!transactionId) {
      setIsLoading(false);
      return;
    }

    const checkVerificationStatus = async () => {
      try {
        // First check database connection
        const isConnected = await checkDbConnection();
        
        if (isConnected) {
          // Try to sync any pending local transactions first
          await syncLocalTransactions();
          
          // Check Supabase for transaction status
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('tx_id', transactionId)
            .maybeSingle();

          if (error) {
            console.error("Error fetching transaction from Supabase:", error);
            // Fallback to localStorage if Supabase query fails
            return checkLocalStorage();
          }

          if (data) {
            if (data.status === 'completed') {
              setIsVerified(true);
              setIsLoading(false);
              
              // Save the verified transaction ID in localStorage for offline access
              const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
              if (!verifiedTransactions.includes(transactionId)) {
                verifiedTransactions.push(transactionId);
                localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
              }
              
              localStorage.setItem('omniabot_payment_verified', 'true');
              toast.success("Your payment has been verified!");
              return true;
            } else if (data.status === 'rejected') {
              setIsVerified(false);
              setIsLoading(false);
              toast.error("Your payment was rejected. Please try again or contact support.");
              return true;
            }
          }
        }

        // If transaction not found in Supabase or status is still pending, check localStorage
        return checkLocalStorage();
      } catch (error) {
        console.error("Error in verification:", error);
        return checkLocalStorage();
      }
    };

    const checkLocalStorage = () => {
      // Fallback to localStorage check
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const transaction = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (transaction?.status === 'completed') {
        setIsVerified(true);
        setIsLoading(false);
        
        // Save the verified transaction ID in localStorage for offline access
        const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
        if (!verifiedTransactions.includes(transactionId)) {
          verifiedTransactions.push(transactionId);
          localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
          toast.success("Your payment has been verified!");
        }
        
        return true;
      } else if (transaction?.status === 'rejected') {
        setIsVerified(false);
        setIsLoading(false);
        toast.error("Your payment was rejected. Please try again or contact support.");
        return true;
      }

      // Also check verified_transactions for previously verified transactions
      const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
      if (verifiedTransactions.includes(transactionId)) {
        setIsVerified(true);
        setIsLoading(false);
        return true;
      }
      
      return false;
    };

    // Set up real-time subscription if connected to database
    let channel: any;
    if (dbConnectionStatus === 'connected') {
      channel = supabase
        .channel('transaction-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `tx_id=eq.${transactionId}`
        }, (payload) => {
          if (payload.new && payload.new.status === 'completed') {
            setIsVerified(true);
            setIsLoading(false);
            toast.success("Your payment has been verified!");
            
            // Save to localStorage as well for offline access
            const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
            if (!verifiedTransactions.includes(transactionId)) {
              verifiedTransactions.push(transactionId);
              localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
            }
            localStorage.setItem('omniabot_payment_verified', 'true');
          } else if (payload.new && payload.new.status === 'rejected') {
            setIsVerified(false);
            setIsLoading(false);
            toast.error("Your payment was rejected. Please try again or contact support.");
          }
        })
        .subscribe();
    }

    // Check immediately
    checkVerificationStatus();

    // Then set up polling as fallback
    const interval = setInterval(() => {
      if (checkCount > 60) { // Stop after ~5 minutes (60 * 5s)
        clearInterval(interval);
        setIsLoading(false);
      }
      
      // Re-check database connection periodically
      if (checkCount % 6 === 0) { // Every 30 seconds
        checkDbConnection();
        
        // Try to sync local transactions when reconnected
        if (dbConnectionStatus === 'connected') {
          syncLocalTransactions();
        }
      }
      
      checkVerificationStatus();
      setCheckCount(prev => prev + 1);
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [transactionId, checkCount, checkDbConnection, dbConnectionStatus, syncLocalTransactions]);

  return { 
    isVerified, 
    isLoading,
    connectionStatus: dbConnectionStatus
  };
};
