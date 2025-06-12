
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export const useCryptoPayment = () => {
  const [submitting, setSubmitting] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('connected');
  const navigate = useNavigate();

  // Check database connection status
  const checkDbConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('transactions').select('count').limit(1);
      const isConnected = !error;
      setDbStatus(isConnected ? 'connected' : 'offline');
      return isConnected;
    } catch (error) {
      console.error("Database connection error:", error);
      setDbStatus('offline');
      return false;
    }
  };

  const submitTransaction = async (transactionId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      // First check database connection
      const isConnected = await checkDbConnection();
      
      // Get the transaction details from localStorage
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const existingTx = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (!existingTx) {
        // Create a new transaction entry
        const newTransaction = {
          txId: transactionId,
          planId: 'premium', // Default plan
          price: 499, // Default price
          name: 'Premium Plan',
          timestamp: new Date().toISOString(),
          status: 'pending',
          payment_method: 'USDT'
        };
        
        // Save to localStorage
        const updatedTransactions = [...pendingTransactions, newTransaction];
        localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
      }

      // If connected to database, store the transaction in Supabase
      if (isConnected) {
        try {
          const txToSubmit = existingTx || {
            txId: transactionId,
            planId: 'premium',
            price: 499,
            name: 'Premium Plan',
            timestamp: new Date().toISOString()
          };

          const { error } = await supabase
            .from('transactions')
            .insert([{
              tx_id: txToSubmit.txId,
              plan_id: txToSubmit.planId,
              price: txToSubmit.price,
              name: txToSubmit.name,
              timestamp: new Date(txToSubmit.timestamp).toISOString(),
              status: 'pending',
              payment_method: 'USDT'
            }]);

          if (error) {
            console.error("Error saving transaction to Supabase:", error);
            toast.warning("Transaction saved locally - will sync when online");
          } else {
            toast.success("Transaction submitted for admin verification!");
          }
        } catch (error) {
          console.error("Transaction submission error:", error);
          toast.warning("Transaction saved locally - will sync when online");
        }
      } else {
        // Offline mode notification
        toast.warning("Transaction saved locally - will sync when online");
      }
      
      // Navigate to a thank you page
      navigate('/success?payment_pending=true&txId=' + transactionId);
    } catch (error) {
      console.error("Transaction submission error:", error);
      toast.error("Error submitting transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    submitTransaction,
    dbStatus
  };
};
