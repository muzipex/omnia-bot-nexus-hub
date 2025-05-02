
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export const useCryptoPayment = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitTransaction = async (transactionId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    toast.loading("Submitting transaction for verification...");
    
    try {
      // Get the transaction details from localStorage
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const existingTx = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (!existingTx) {
        toast.error("Transaction not found. Please try again.");
        setSubmitting(false);
        return;
      }

      // Store the transaction in Supabase for persistent access
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
        // If Supabase fails, continue with localStorage as fallback
        toast.error("Error saving to database, using local storage as fallback");
      } else {
        toast.success("Transaction submitted for admin verification!");
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
    submitTransaction
  };
};
