export interface PaymentPlan {
    name: string;
    price: number;
    planId: string;
}

export const initializePayPalPayment = async (plan: PaymentPlan) => {
    const successUrl = `${window.location.origin}/success?payment_success=true`;
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=musipeex@gmail.com&item_name=Omnia Bot ${plan.name} Plan&amount=${plan.price}&currency_code=USD&return=${encodeURIComponent(successUrl)}`;
    
    // Open PayPal in a new window
    window.open(paypalUrl, '_blank');
};