
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// USDT Payment address (Binance)
export const USDT_ADDRESS = "0xfd78ec55f626e38da6420983b55987952363417f";

interface CryptoPaymentDetails {
  name: string;
  price: number;
  planId: string;
}

// Function to handle USDT payments
export const initializeUSDTPayment = (details: CryptoPaymentDetails) => {
  const { name, price, planId } = details;
  
  // Generate a unique transaction ID
  const txId = `USDT-${planId}-${Date.now()}`;
  
  // Store pending transaction in localStorage for offline access
  const pendingTransaction = {
    txId,
    planId,
    price,
    name,
    timestamp: Date.now(),
    status: 'pending'
  };
  
  // Store this transaction in localStorage to track it
  const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
  pendingTransactions.push(pendingTransaction);
  localStorage.setItem('pending_crypto_transactions', JSON.stringify(pendingTransactions));
  
  // Try to store in Supabase as well
  (async () => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          tx_id: txId,
          plan_id: planId,
          price: price,
          name: name,
          status: 'pending',
          payment_method: 'USDT'
        }]);
        
      if (error) {
        console.error("Error storing transaction in Supabase:", error);
        // This is fine, we'll use localStorage as fallback
        toast.error("Error saving to database, using local storage as fallback");
      }
    } catch (error) {
      console.error("Error storing transaction in Supabase:", error);
      // This is fine, we'll use localStorage as fallback
      toast.error("Error saving to database, using local storage as fallback");
    }
  })();
  
  // Copy address to clipboard
  navigator.clipboard.writeText(USDT_ADDRESS)
    .then(() => {
      toast.success("USDT address copied to clipboard");
    })
    .catch((error) => {
      console.error("Failed to copy address:", error);
      toast.error("Failed to copy address");
    });
    
  return {
    txId,
    address: USDT_ADDRESS,
    amount: price
  };
};

// Function to verify USDT transaction (in production, this would connect to an API)
export const verifyUSDTTransaction = async (txId: string): Promise<boolean> => {
  try {
    // First check if the transaction exists in Supabase
    const { data, error } = await supabase
      .from('transactions')
      .select('status')
      .eq('tx_id', txId)
      .maybeSingle();
      
    if (!error && data && data.status === 'completed') {
      // Transaction is already verified in Supabase
      
      // Update localStorage for offline access
      const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
      const updatedTransactions = pendingTransactions.map((tx: any) => {
        if (tx.txId === txId) {
          return { ...tx, status: 'completed' };
        }
        return tx;
      });
      localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
      
      // Set payment status
      localStorage.setItem('omniabot_payment_verified', 'true');
      
      // Add to verified transactions
      const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
      if (!verifiedTransactions.includes(txId)) {
        verifiedTransactions.push(txId);
        localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
      }
      
      return true;
    }
    
    // If not verified in Supabase, simulate verification for demo
    // In a real app, you would check with a blockchain API
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // 20% chance of success for demo purposes (since we want admin to verify most transactions)
        const isVerified = Math.random() < 0.2;
        
        if (isVerified) {
          // Update transaction status in Supabase
          supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('tx_id', txId)
            .then(() => {
              // Update transaction status in localStorage
              const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
              const updatedTransactions = pendingTransactions.map((tx: any) => {
                if (tx.txId === txId) {
                  return { ...tx, status: 'completed' };
                }
                return tx;
              });
              localStorage.setItem('pending_crypto_transactions', JSON.stringify(updatedTransactions));
              
              // Set payment status
              localStorage.setItem('omniabot_payment_verified', 'true');
              
              // Add to verified transactions
              const verifiedTransactions = JSON.parse(localStorage.getItem('verified_transactions') || '[]');
              if (!verifiedTransactions.includes(txId)) {
                verifiedTransactions.push(txId);
                localStorage.setItem('verified_transactions', JSON.stringify(verifiedTransactions));
              }
            })
            .catch((error) => {
              console.error("Error updating transaction status in Supabase:", error);
            });
        }
        
        resolve(isVerified);
      }, 3000); // Simulate network delay
    });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return false;
  }
};
