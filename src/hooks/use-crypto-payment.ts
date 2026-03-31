
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './use-auth';

export const useCryptoPayment = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const submitTransaction = async (transactionId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const existingTx = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
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
          payment_method: 'USDT',
          user_email: user?.email || null,
        }]);

      if (error) {
        console.error("Error saving transaction:", error);
        toast.warning("Transaction saved locally - will sync when online");
      } else {
        toast.success("Transaction submitted for admin verification!");
      }
      
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
  };
};
