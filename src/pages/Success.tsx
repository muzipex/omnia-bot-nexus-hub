
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { usePaymentVerification } from '@/hooks/use-payment-verification';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const Success: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentPending = urlParams.get('payment_pending') === 'true';
  const paymentSuccess = urlParams.get('payment_success') === 'true';
  const transactionId = urlParams.get('txId') || undefined;
  const planId = urlParams.get('plan') || 'premium';
  const { isVerified, isLoading, connectionStatus } = usePaymentVerification(transactionId);
  const { user } = useAuth();
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);

  // For PayPal success: create transaction record and update subscription
  useEffect(() => {
    if (paymentSuccess && user && !subscriptionUpdated) {
      const updateSubscription = async () => {
        try {
          // Create a completed transaction record with user_email
          const { error } = await supabase.from('transactions').insert({
            tx_id: `paypal_${Date.now()}`,
            plan_id: planId,
            price: planId === 'standard' ? 299 : planId === 'ultimate' ? 899 : 499,
            name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
            status: 'completed',
            payment_method: 'PayPal',
            user_email: user.email || null,
          });

          if (error) {
            console.error('Error creating transaction:', error);
            return;
          }

          // Directly update subscription since PayPal payment is instant
          const expireInterval = planId === 'standard' ? 6 : planId === 'premium' ? 12 : 120;
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + expireInterval);

          const subType = planId === 'standard' ? 'basic' : planId === 'ultimate' ? 'enterprise' : 'premium';

          await supabase.from('subscriptions').update({
            subscription_type: subType,
            status: 'active',
            subscription_started_at: new Date().toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);

          setSubscriptionUpdated(true);
        } catch (err) {
          console.error('Subscription update error:', err);
        }
      };
      updateSubscription();
    }
  }, [paymentSuccess, user, subscriptionUpdated, planId]);

  return (
    <>
      <SEO 
        title={paymentPending ? "Payment Pending" : "Purchase Successful"}
        description={paymentPending 
          ? "Your payment is being verified." 
          : "Thank you for your purchase."
        }
        type="website"
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark grid place-items-center p-4">
        <Breadcrumbs className="absolute top-4 left-4 text-sm" />
        
        <div className="absolute top-4 right-4">
          {connectionStatus === 'connected' ? (
            <div className="flex items-center gap-2 text-tech-green text-sm">
              <Wifi className="w-4 h-4" /><span>Online</span>
            </div>
          ) : connectionStatus === 'offline' ? (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <WifiOff className="w-4 h-4" /><span>Offline</span>
            </div>
          ) : null}
        </div>
        
        <div className="max-w-md w-full tech-card text-center space-y-6">
          {paymentPending ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold text-white">Payment Pending</h1>
              <p className="text-gray-300">
                Your crypto payment is being verified by our admin team. Once approved, your subscription will be activated automatically.
              </p>
              {isVerified && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">✅ Payment verified! Your subscription is now active.</p>
                </div>
              )}
              <Button 
                className="w-full bg-tech-blue hover:bg-tech-blue/90 text-white font-bold"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-tech-green/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-tech-green" />
              </div>
              <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
              <p className="text-gray-300">
                Your subscription has been activated. Head to your dashboard to start trading with OMNIA BOT.
              </p>
              <Button 
                className="w-full bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </>
          )}
          
          <p className="text-sm text-gray-400">
            Need help? Contact our <a href="/contact" className="text-tech-blue hover:underline">support team</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Success;
