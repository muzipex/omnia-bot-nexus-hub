export interface PaymentPlan {
    name: string;
    price: number;
    planId: string;
}

export interface PaymentRequest {
    id: string;
    plan: PaymentPlan;
    status: 'pending' | 'verified' | 'rejected';
    timestamp: string;
}

let pendingPayments: PaymentRequest[] = [];

export const initializePayPalPayment = async (plan: PaymentPlan) => {
    const paymentId = Math.random().toString(36).substring(2, 15);
    const successUrl = `${window.location.origin}/success?payment_success=true&payment_id=${paymentId}`;
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=musipeex@gmail.com&item_name=Omnia Bot ${plan.name} Plan&amount=${plan.price}&currency_code=USD&return=${encodeURIComponent(successUrl)}`;
    
    // Store payment request
    const paymentRequest: PaymentRequest = {
        id: paymentId,
        plan,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    pendingPayments.push(paymentRequest);
    
    // Store in localStorage for persistence
    localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
    
    // Open PayPal in a new window
    window.open(paypalUrl, '_blank');
};

// Admin functions
export const getPendingPayments = (): PaymentRequest[] => {
    // Load from localStorage to ensure persistence
    const stored = localStorage.getItem('pending_payments');
    if (stored) {
        pendingPayments = JSON.parse(stored);
    }
    return pendingPayments;
};

export const verifyPayment = (paymentId: string) => {
    pendingPayments = pendingPayments.map(payment => {
        if (payment.id === paymentId) {
            return { ...payment, status: 'verified' };
        }
        return payment;
    });
    localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
    localStorage.setItem('payment_verified', 'true');
};

export const rejectPayment = (paymentId: string) => {
    pendingPayments = pendingPayments.map(payment => {
        if (payment.id === paymentId) {
            return { ...payment, status: 'rejected' };
        }
        return payment;
    });
    localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
};