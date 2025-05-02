
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const useDownloadState = () => {
  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      setIsCheckingPayment(true);
      
      try {
        // Check URL parameters for payment success
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment_success');
        const verifiedPayment = urlParams.get('verified_by_admin');
        
        if (paymentSuccess === 'true' && verifiedPayment === 'true') {
          setHasPaid(true);
          // Store payment status in localStorage
          localStorage.setItem('omniabot_payment_verified', 'true');
          setIsCheckingPayment(false);
          return;
        }
        
        // Check if there's a transaction ID in URL params
        const txId = urlParams.get('txId');
        if (txId) {
          // Check if this transaction is verified in Supabase
          const { data, error } = await supabase
            .from('transactions')
            .select('status')
            .eq('tx_id', txId)
            .single();
            
          if (!error && data && data.status === 'completed') {
            setHasPaid(true);
            localStorage.setItem('omniabot_payment_verified', 'true');
            
            // Store in verified_transactions for cross-device consistency
            const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
            if (!verifiedTransactions.includes(txId)) {
              verifiedTransactions.push(txId);
              localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
            }
            
            setIsCheckingPayment(false);
            return;
          }
        }
        
        // Check localStorage for existing payment verification
        const storedPaymentStatus = localStorage.getItem('omniabot_payment_verified');
        if (storedPaymentStatus === 'true') {
          setHasPaid(true);
          setIsCheckingPayment(false);
          return;
        }
        
        // Check if any verified transactions exist in Supabase
        const { data: transactions } = await supabase
          .from('transactions')
          .select('tx_id')
          .eq('status', 'completed')
          .limit(1);
          
        if (transactions && transactions.length > 0) {
          setHasPaid(true);
          localStorage.setItem('omniabot_payment_verified', 'true');
          setIsCheckingPayment(false);
          return;
        }
        
        // Also check if any of the user's transactions have been verified in localStorage
        // This connects the admin verification to the user download capability
        const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
        if (verifiedTransactions.length > 0) {
          setHasPaid(true);
          localStorage.setItem('omniabot_payment_verified', 'true');
          setIsCheckingPayment(false);
          return;
        }
        
        setIsCheckingPayment(false);
      } catch (error) {
        console.error("Error checking payment status:", error);
        
        // Fallback to localStorage check
        const storedPaymentStatus = localStorage.getItem('omniabot_payment_verified');
        if (storedPaymentStatus === 'true') {
          setHasPaid(true);
        }
        
        const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
        if (verifiedTransactions.length > 0) {
          setHasPaid(true);
          localStorage.setItem('omniabot_payment_verified', 'true');
        }
        
        setIsCheckingPayment(false);
      }
    };
    
    checkPaymentStatus();
    
    // Set up real-time updates for transactions
    const channel = supabase
      .channel('payment-verified')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: 'status=eq.completed'
      }, () => {
        // When any transaction is verified, update the payment status
        setHasPaid(true);
        localStorage.setItem('omniabot_payment_verified', 'true');
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownload = () => {
    if (hasPaid) {
      // Trigger download
      toast.success("Download started!");
      window.location.href = '/downloads/omnia-bot-latest.zip';
    } else {
      // Show error message if not paid
      toast.error("Payment verification required");
      window.location.href = '#pricing';
    }
  };

  return {
    hasPaid,
    isCheckingPayment,
    handleDownload
  };
};
