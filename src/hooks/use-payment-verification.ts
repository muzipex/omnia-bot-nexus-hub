import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";

export const usePaymentVerification = (transactionId?: string) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) {
      setIsLoading(false);
      return;
    }

    const checkVerificationStatus = () => {
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const transaction = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (transaction?.status === 'completed') {
        setIsVerified(true);
        setIsLoading(false);
        toast.success("Your payment has been verified!");
        return true;
      } else if (transaction?.status === 'rejected') {
        setIsVerified(false);
        setIsLoading(false);
        toast.error("Your payment was rejected. Please try again or contact support.");
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkVerificationStatus()) {
      // If not verified, set up polling
      const interval = setInterval(() => {
        if (checkVerificationStatus()) {
          clearInterval(interval);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [transactionId]);

  return { isVerified, isLoading };
};