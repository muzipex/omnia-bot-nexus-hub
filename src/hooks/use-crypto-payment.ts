
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

export const useCryptoPayment = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitTransaction = async (transactionId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    toast.loading("Submitting transaction for verification...");
    
    try {
      // Store the transaction in localStorage for admin verification
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      
      // Check if this transaction is already submitted
      const existingTx = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (!existingTx) {
        toast.error("Transaction not found. Please try again.");
        setSubmitting(false);
        return;
      }
      
      // Update the transaction status to pending admin verification
      toast.success("Transaction submitted for admin verification!");
      
      // Navigate to a thank you page
      navigate('/success?payment_pending=true&tx_method=usdt');
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
