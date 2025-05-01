import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/sonner";

export const useDownloadState = () => {
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success') === 'true';
    const paymentId = urlParams.get('payment_id');
    
    if (paymentSuccess && paymentId) {
      // Check if this payment has been verified by admin
      const storedPayments = localStorage.getItem('pending_payments');
      if (storedPayments) {
        const payments = JSON.parse(storedPayments);
        const payment = payments.find((p: any) => p.id === paymentId);
        
        if (payment && payment.status === 'verified') {
          setHasPaid(true);
          localStorage.setItem('current_payment_id', paymentId);
        }
      }
    } else {
      // Check if user has a verified payment in localStorage
      const currentPaymentId = localStorage.getItem('current_payment_id');
      if (currentPaymentId) {
        const storedPayments = localStorage.getItem('pending_payments');
        if (storedPayments) {
          const payments = JSON.parse(storedPayments);
          const payment = payments.find((p: any) => p.id === currentPaymentId);
          if (payment && payment.status === 'verified') {
            setHasPaid(true);
          }
        }
      }
    }
  }, []);

  const handleDownload = () => {
    if (hasPaid) {
      // Trigger download
      toast.success("Download started!");
      // In a real app, this would be a secure download URL
      window.location.href = '/downloads/omnia-bot-latest.zip';
    } else {
      toast.error("Payment verification required");
      window.location.href = '#pricing';
    }
  };

  return {
    hasPaid,
    handleDownload
  };
};