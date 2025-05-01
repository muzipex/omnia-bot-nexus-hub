
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Zap, Download, Copy, Bitcoin } from 'lucide-react';
import { initializePayPalPayment } from '@/lib/paypal';
import { useDownloadState } from '@/hooks/use-download-state';
import { Helmet } from 'react-helmet';
import { USDT_ADDRESS, initializeUSDTPayment } from '@/lib/crypto-payment';
import { useCryptoPayment } from '@/hooks/use-crypto-payment';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

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
  const { verifying, checkTransaction } = useCryptoPayment(cryptoTxId);

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

  const handleVerifyPayment = () => {
    if (cryptoTxId) {
      checkTransaction(cryptoTxId);
    }
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Omnia BOT",
            "description": "Advanced AI-powered forex trading robot",
            "offers": pricingPlans.map(plan => ({
              "@type": "Offer",
              "name": plan.name,
              "price": plan.price.toString(),
              "priceCurrency": "USD",
              "description": plan.features.join(", "),
              "url": `https://omniabot.com/#pricing`
            })),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1500",
              "reviewCount": "1500"
            },
            "review": [
              {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "John Smith"
                },
                "reviewBody": "The AI-powered trading algorithms have completely transformed my trading experience. Highly recommended!"
              },
              {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "Sarah Johnson"
                },
                "reviewBody": "Exceptional performance and reliable automation. Worth every penny!"
              }
            ]
          })}
        </script>
      </Helmet>

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
              <div 
                key={index} 
                className={`tech-card relative ${plan.isPopular ? 'border-tech-green glow-border' : 'hover:border-tech-blue/40'} transition-all duration-300`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-tech-green text-tech-dark text-sm font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 text-sm"> / {plan.period}</span>
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="min-w-4 h-4 rounded-full bg-tech-green/20 flex items-center justify-center mt-1">
                        <Check className="w-3 h-3 text-tech-green" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className={`w-full ${
                      plan.isPopular
                        ? 'bg-tech-green hover:bg-tech-green/90 text-tech-dark'
                        : 'bg-tech-charcoal border border-tech-blue text-tech-blue hover:bg-tech-blue/10'
                    }`}
                    onClick={() => handlePurchase(plan)}
                  >
                    {plan.cta} with PayPal
                  </Button>
                  
                  <Button 
                    className="w-full bg-tech-purple hover:bg-tech-purple/90 text-white gap-2"
                    onClick={() => handleCryptoPurchase(plan)}
                  >
                    <Bitcoin className="w-4 h-4" />
                    Pay with USDT
                  </Button>
                </div>
                
                {hasPaid && (
                  <Button 
                    className="w-full mt-4 bg-tech-blue hover:bg-tech-blue/90 text-white gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                    Download Software
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center max-w-xl mx-auto">
            <p className="text-gray-400 text-sm">
              All plans include a 30-day money-back guarantee. If you're not satisfied with the performance of Omnia BOT, we'll refund your purchase.
            </p>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent"></div>
      </div>

      {/* Crypto Payment Dialog */}
      <Dialog open={showCryptoDialog} onOpenChange={setShowCryptoDialog}>
        <DialogContent className="bg-tech-dark border-tech-blue/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Pay with USDT (Tether)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-gray-300">Send <span className="text-tech-green font-bold">
                ${currentPlan?.price} USDT
              </span> to the following address:</p>
            </div>
            
            <div className="bg-tech-charcoal p-4 rounded-lg border border-tech-blue/30">
              <div className="flex items-center space-x-2">
                <div className="break-all text-sm text-gray-300 font-mono">
                  {USDT_ADDRESS}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyAddress} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-tech-blue/10 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-tech-blue font-bold">Important:</span> Please send only USDT on the Binance Smart Chain (BEP20) network. Sending other tokens or using the wrong network may result in permanent loss of funds.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleVerifyPayment} 
              className="w-full bg-tech-green text-tech-dark font-bold"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Pricing;
