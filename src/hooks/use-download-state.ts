import { useEffect, useState } from 'react';

export const useDownloadState = () => {
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    if (paymentSuccess === 'true') {
      setHasPaid(true);
      // Store payment status in localStorage
      localStorage.setItem('omniabot_payment_verified', 'true');
    } else {
      // Check localStorage for existing payment verification
      const storedPaymentStatus = localStorage.getItem('omniabot_payment_verified');
      if (storedPaymentStatus === 'true') {
        setHasPaid(true);
      }
    }
  }, []);

  const handleDownload = () => {
    if (hasPaid) {
      // Trigger download (you'll need to replace this with your actual download URL)
      window.location.href = '/downloads/omnia-bot-latest.zip';
    } else {
      // Redirect to pricing page if not paid
      window.location.href = '#pricing';
    }
  };

  return {
    hasPaid,
    handleDownload
  };
};