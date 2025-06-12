
import { supabase } from "@/integrations/supabase/client";

export const USDT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

export const initializeUSDTPayment = (paymentData: {
  name: string;
  price: number;
  planId: string;
}) => {
  const txId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Save transaction details to localStorage for later submission
  const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
  const newTransaction = {
    txId,
    planId: paymentData.planId,
    price: paymentData.price,
    name: paymentData.name,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  pendingTransactions.push(newTransaction);
  localStorage.setItem('pending_crypto_transactions', JSON.stringify(pendingTransactions));
  
  return {
    address: USDT_ADDRESS,
    amount: paymentData.price,
    txId: txId
  };
};

export const handleCopyAddress = async () => {
  try {
    await navigator.clipboard.writeText(USDT_ADDRESS);
    return true;
  } catch (err) {
    console.error('Failed to copy address:', err);
    return false;
  }
};

export const submitCryptoTransaction = async (transactionData: {
  name: string;
  plan_id: string;
  price: number;
  user_email?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        name: transactionData.name,
        payment_method: 'crypto',
        plan_id: transactionData.plan_id,
        price: transactionData.price,
        status: 'pending',
        tx_id: `crypto_${Date.now()}`,
        user_email: transactionData.user_email,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting crypto transaction:', error);
    return { success: false, error };
  }
};
