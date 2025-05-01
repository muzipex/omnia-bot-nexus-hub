
import { toast } from "@/components/ui/sonner";

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
  
  // Store pending transaction in localStorage
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
  
  // Copy address to clipboard
  navigator.clipboard.writeText(USDT_ADDRESS)
    .then(() => {
      toast.success("USDT address copied to clipboard");
    })
    .catch(() => {
      toast.error("Failed to copy address");
    });
    
  return {
    txId,
    address: USDT_ADDRESS,
    amount: price
  };
};

// Function to simulate transaction verification (in production, this would connect to an API)
export const verifyUSDTTransaction = async (txId: string): Promise<boolean> => {
  // In a real implementation, you would check with a blockchain API
  // For demo purposes, we'll simulate a successful verification
  return new Promise((resolve) => {
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const isVerified = Math.random() < 0.8;
      
      if (isVerified) {
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
      }
      
      resolve(isVerified);
    }, 3000); // Simulate network delay
  });
};
