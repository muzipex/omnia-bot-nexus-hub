
import { useState, useEffect } from 'react';
import { verifyUSDTTransaction } from '@/lib/crypto-payment';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

export const useCryptoPayment = (txId?: string) => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  // Verify transaction
  const checkTransaction = async (transactionId: string) => {
    if (verifying) return;
    
    setVerifying(true);
    toast.loading("Verifying payment...");
    
    try {
      const success = await verifyUSDTTransaction(transactionId);
      setVerified(success);
      
      if (success) {
        toast.success("Payment verified successfully!");
        navigate('/success?payment_success=true&tx_method=usdt');
      } else {
        toast.error("Payment verification failed. Please try again later.");
      }
    } catch (error) {
      console.error("Transaction verification error:", error);
      toast.error("Error verifying payment");
    } finally {
      setVerifying(false);
    }
  };

  // Check for pending transactions on component mount
  useEffect(() => {
    if (txId) {
      checkTransaction(txId);
    }
  }, [txId]);

  return {
    verifying,
    verified,
    checkTransaction
  };
};
