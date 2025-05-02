
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";

export const usePaymentVerification = (transactionId?: string) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!transactionId) {
      setIsLoading(false);
      return;
    }

    const checkVerificationStatus = () => {
      // Get all transactions from localStorage
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const transaction = pendingTransactions.find((tx: any) => tx.txId === transactionId);
      
      if (transaction?.status === 'completed') {
        setIsVerified(true);
        setIsLoading(false);
        
        // Save the verified transaction ID in a separate storage location
        // This enables access to verification status across different sessions/devices
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
      return false;
    };

    // Check immediately
    if (!checkVerificationStatus()) {
      // If not verified, set up polling
      const interval = setInterval(() => {
        if (checkVerificationStatus() || checkCount > 60) { // Stop after ~5 minutes (60 * 5s)
          clearInterval(interval);
        }
        setCheckCount(prev => prev + 1);
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [transactionId, checkCount]);

  // Also check if this transaction was already verified in a previous session
  useEffect(() => {
    if (!transactionId) return;
    
    const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
    if (verifiedTransactions.includes(transactionId)) {
      setIsVerified(true);
      setIsLoading(false);
    }
  }, [transactionId]);

  return { isVerified, isLoading };
};
