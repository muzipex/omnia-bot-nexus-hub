
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Zap, Download, Bitcoin } from 'lucide-react';
import { initializePayPalPayment } from '@/lib/paypal';
import { useDownloadState } from '@/hooks/use-download-state';
import { Helmet } from 'react-helmet';
import { USDT_ADDRESS, initializeUSDTPayment } from '@/lib/crypto-payment';
import { useCryptoPayment } from '@/hooks/use-crypto-payment';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { usePaymentVerification } from '@/hooks/use-payment-verification';
import PricingPlan from '../components/pricing/PricingPlan';
import CryptoPaymentDialog from '../components/pricing/CryptoPaymentDialog';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Pricing plans data
const pricingPlans = [
  {
    name: 'Standard',
    price: 299,
    planId: 'standard',
    period: 'one-time payment',
    description: 'Perfect for beginners starting their forex journey.',
    features: [
      'Single account license',
      'Access to 5 major currency pairs',
      'Basic risk management',
      'Email support',
      'Free updates for 6 months'
    ],
    isPopular: false,
    cta: 'Get Started'
  },
  {
    name: 'Premium',
    price: 499,
    planId: 'premium',
    period: 'one-time payment',
    description: 'Our most popular plan for serious traders.',
    features: [
      'Dual account license',
      'Access to all currency pairs',
      'Advanced risk parameters',
      'Priority email support',
      'Free updates for 12 months',
      'Performance analytics dashboard',
      'Custom strategy configuration'
    ],
    isPopular: true,
    cta: 'Buy Premium'
  },
  {
    name: 'Ultimate',
    price: 899,
    planId: 'ultimate',
    period: 'one-time payment',
    description: 'Maximum flexibility for professional traders.',
    features: [
      'Five account license',
      'Access to all currency pairs',
      'Advanced risk parameters',
      '24/7 priority support',
      'Lifetime free updates',
      'Performance analytics dashboard',
      'Custom strategy configuration',
      'VIP trading signals'
    ],
    isPopular: false,
    cta: 'Go Ultimate'
  }
];

const Pricing: React.FC = () => {
  const { hasPaid, handleDownload } = useDownloadState();
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<typeof pricingPlans[0] | null>(null);
  const [cryptoTxId, setCryptoTxId] = useState<string | undefined>();
  const { submitting, submitTransaction } = useCryptoPayment();
  const navigate = useNavigate();
  const { isVerified, isLoading } = usePaymentVerification(cryptoTxId);

  const handlePurchase = (plan: typeof pricingPlans[0]) => {
    initializePayPalPayment({
      name: plan.name,
      price: plan.price,
      planId: plan.planId
    });
  };

  const handleCryptoPurchase = (plan: typeof pricingPlans[0]) => {
    setCurrentPlan(plan);
    setShowCryptoDialog(true);
    
    // Initialize crypto payment
    const result = initializeUSDTPayment({
      name: plan.name,
      price: plan.price,
      planId: plan.planId
    });
    
    setCryptoTxId(result.txId);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(USDT_ADDRESS)
      .then(() => toast.success("Address copied to clipboard"))
      .catch(() => toast.error("Failed to copy address"));
  };

  const handleSubmitTransaction = () => {
    if (cryptoTxId) {
      submitTransaction(cryptoTxId);
      setShowCryptoDialog(false);
      
      // Redirect to success page with transaction ID for verification
      navigate(`/success?payment_pending=true&txId=${cryptoTxId}`);
    }
  };

  // Notification function for unpaid download attempts
  const handleUnpaidDownload = () => {
    toast.error("Please purchase the software before downloading.");
    
    // Scroll to pricing section
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Pricing - OMNIA BOT</title>
        <meta name="description" content="Choose the perfect plan for your trading needs. Get started with OMNIA BOT today." />
      </Helmet>

      <div className="min-h-screen bg-tech-dark flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <div id="pricing" className="bg-tech-dark py-24 relative">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="purple-glow-text">Invest</span> in Your <span className="glow-text">Success</span>
                </h2>
                <p className="text-gray-300 text-lg">
                  Choose the perfect plan that aligns with your trading goals and preferences.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <PricingPlan
                    key={index}
                    plan={plan}
                    handlePurchase={handlePurchase}
                    handleCryptoPurchase={handleCryptoPurchase}
                    handleDownload={handleDownload}
                    handleUnpaidDownload={handleUnpaidDownload}
                    hasPaid={hasPaid}
                    isVerified={isVerified}
                    isLoading={isLoading}
                  />
                ))}
              </div>
              
              <div className="mt-12 text-center max-w-xl mx-auto">
                <p className="text-gray-300 text-sm bg-tech-charcoal rounded-lg p-3 inline-block">
                  All plans include a 30-day money-back guarantee. If you're not satisfied with the performance of Omnia BOT, we'll refund your purchase.
                </p>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent"></div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Crypto Payment Dialog */}
      <CryptoPaymentDialog
        showCryptoDialog={showCryptoDialog}
        setShowCryptoDialog={setShowCryptoDialog}
        currentPlan={currentPlan}
        handleCopyAddress={handleCopyAddress}
        submitting={submitting}
        handleSubmitTransaction={handleSubmitTransaction}
      />
    </>
  );
};

export default Pricing;
