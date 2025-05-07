
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// Placeholder payment addresses - these would come from your backend in production
export const USDT_ADDRESS = "TW45XUnQQzFp5tchGQbXiG5ibonLWV4ERt";
export const ETH_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
export const BTC_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

// Types
export interface PaymentMethod {
  name: string;
  address: string;
  icon: string;
}

export interface PaymentState {
  showModal: boolean;
  selectedMethod: PaymentMethod | null;
  paymentStep: number;
  isSubmitting: boolean;
  orderId: string | null;
  countdown: number;
}

interface PaymentDetails {
  name: string;
  price: number;
  planId: string;
}

// Initial payment methods
const paymentMethods: PaymentMethod[] = [
  {
    name: "USDT (TRC20)",
    address: USDT_ADDRESS,
    icon: "/crypto-icons/usdt.svg"
  },
  {
    name: "Ethereum (ETH)",
    address: ETH_ADDRESS,
    icon: "/crypto-icons/eth.svg"
  },
  {
    name: "Bitcoin (BTC)",
    address: BTC_ADDRESS,
    icon: "/crypto-icons/btc.svg"
  }
];

/**
 * Copy the crypto payment address to clipboard
 */
export const copyPaymentAddress = async () => {
  // Generate order ID if not already present
  const orderId = localStorage.getItem('orderId') || (() => {
    const newId = 'ORD-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
    localStorage.setItem('orderId', newId);
    return newId;
  })();
  
  // Copy address to clipboard
  try {
    // Fixed to properly handle the Promise chain
    navigator.clipboard.writeText(USDT_ADDRESS)
      .then(() => {
        toast.success("Payment address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy address:", err);
        toast.error("Failed to copy address. Please try again.");
      });
  } catch (err) {
    console.error("Clipboard error:", err);
    toast.error("Could not access clipboard");
  }

  // Log the payment attempt to Supabase (non-blocking)
  try {
    await supabase
      .from('transactions')
      .insert([
        {
          order_id: orderId,
          payment_method: 'USDT',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('Failed to log payment attempt:', error);
    // Don't block user flow on logging failure
  }

  return orderId;
};

/**
 * Initialize USDT payment
 */
export const initializeUSDTPayment = (details: PaymentDetails) => {
  const txId = 'TX-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
  
  // Store transaction in localStorage for later verification
  const pendingTransactions = JSON.parse(localStorage.getItem('pending_crypto_transactions') || '[]');
  const newTransaction = {
    txId,
    planId: details.planId,
    name: details.name,
    price: details.price,
    timestamp: Date.now(),
    status: 'pending',
  };
  
  pendingTransactions.push(newTransaction);
  localStorage.setItem('pending_crypto_transactions', JSON.stringify(pendingTransactions));
  
  return { txId };
};

/**
 * Verify a crypto payment using the transaction hash
 */
export const verifyPayment = async (txHash: string, amount: string) => {
  try {
    // Here we would normally verify with blockchain API
    // This is a placeholder implementation
    
    toast.info("Verifying transaction...");
    
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, any hash of reasonable length is accepted
    if (txHash.length > 30 && parseFloat(amount) >= 97) {
      toast.success("Payment verified! Downloading...");
      localStorage.setItem('paymentVerified', 'true');
      return true;
    } else {
      toast.error("Invalid transaction or amount.");
      return false;
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    toast.error("Verification failed. Please try again.");
    return false;
  }
};

/**
 * Check if a user has made a payment
 */
export const checkPaymentStatus = () => {
  return localStorage.getItem('paymentVerified') === 'true';
};

/**
 * Get all available payment methods
 */
export const getPaymentMethods = () => {
  return paymentMethods;
};

/**
 * Reset payment state
 */
export const resetPayment = () => {
  localStorage.removeItem('orderId');
  localStorage.removeItem('paymentVerified');
};
