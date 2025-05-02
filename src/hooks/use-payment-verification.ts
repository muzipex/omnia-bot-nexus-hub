
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentVerification = (transactionId?: string) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!transactionId) {
      setIsLoading(false);
      return;
    }

    const checkVerificationStatus = async () => {
      try {
        // Check Supabase for transaction status first
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('tx_id', transactionId)
          .single();

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

    // Set up real-time subscription
    const channel = supabase
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

    // Check immediately
    checkVerificationStatus();

    // Then set up polling as fallback
    const interval = setInterval(() => {
      if (checkCount > 60) { // Stop after ~5 minutes (60 * 5s)
        clearInterval(interval);
        setIsLoading(false);
      }
      checkVerificationStatus();
      setCheckCount(prev => prev + 1);
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [transactionId, checkCount]);

  return { isVerified, isLoading };
};
