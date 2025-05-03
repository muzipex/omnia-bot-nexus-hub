
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
    toast.loading("Submitting transaction for verification...");
    
    try {
      // First check database connection
      const isConnected = await checkDbConnection();
      
      // Get the transaction details from localStorage
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const existingTx = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (!existingTx) {
        toast.error("Transaction not found. Please try again.");
        setSubmitting(false);
        return;
      }

      // If connected to database, store the transaction in Supabase
      if (isConnected) {
        try {
          const { error } = await supabase
            .from('transactions')
            .insert([{
              tx_id: existingTx.txId,
              plan_id: existingTx.planId,
              price: existingTx.price,
              name: existingTx.name,
              timestamp: new Date(existingTx.timestamp).toISOString(),
              status: 'pending',
              payment_method: 'USDT'
            }]);

          if (error) {
            console.error("Error saving transaction to Supabase:", error);
            toast.warning("Using local storage due to database issues", {
              description: "Your transaction will be verified when connectivity is restored."
            });
          } else {
            toast.success("Transaction submitted for admin verification!");
          }
        } catch (error) {
          console.error("Transaction submission error:", error);
          toast.warning("Using local storage due to database issues", {
            description: "Your transaction will be verified when connectivity is restored."
          });
        }
      } else {
        // Offline mode notification
        toast.warning("Operating in offline mode", {
          description: "Your transaction will be synced when connectivity is restored."
        });
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
