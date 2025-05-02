
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/sonner";

export const useDownloadState = () => {
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const verifiedPayment = urlParams.get('verified_by_admin');
    
    if (paymentSuccess === 'true' && verifiedPayment === 'true') {
      setHasPaid(true);
      // Store payment status in localStorage
      localStorage.setItem('omniabot_payment_verified', 'true');
    } else {
      // Check localStorage for existing payment verification
      const storedPaymentStatus = localStorage.getItem('omniabot_payment_verified');
      if (storedPaymentStatus === 'true') {
        setHasPaid(true);
      }
      
      // Also check if any of the user's transactions have been verified
      // This connects the admin verification to the user download capability
      const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
      if (verifiedTransactions.length > 0) {
        setHasPaid(true);
        localStorage.setItem('omniabot_payment_verified', 'true');
      }
    }
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
    handleDownload
  };
};
