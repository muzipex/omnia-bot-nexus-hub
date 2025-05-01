import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Zap, Download } from 'lucide-react';
import { initializePayPalPayment } from '@/lib/paypal';
import { useDownloadState } from '@/hooks/use-download-state';
import { Helmet } from 'react-helmet';

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
    description: 'Advanced features for serious traders.',
    features: [
      'Multi-account license',
      'Access to all currency pairs',
      'Advanced risk management',
      'Priority support',
      'Free lifetime updates',
      'Custom indicators',
      'Performance analytics'
    ],
    isPopular: true,
    cta: 'Get Premium'
  }
];

const Pricing: React.FC = () => {
  const { hasPaid, handleDownload } = useDownloadState();

  const handlePurchase = (plan: typeof pricingPlans[0]) => {
    initializePayPalPayment({
      name: plan.name,
      price: plan.price,
      planId: plan.planId
    });
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
              "ratingCount": "1500"
            }
          })}
        </script>
      </Helmet>

      <div className="relative py-24 overflow-hidden" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Simple</span> Pricing,{" "}
              <span className="text-gradient">Powerful</span> Features
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Choose the plan that best fits your trading needs. All plans include our core AI-powered trading technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative tech-card p-6 ${
                  plan.isPopular ? 'border-2 border-tech-green' : ''
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-tech-green text-tech-dark text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-tech-blue mb-2">
                    ${plan.price}
                  </div>
                  <p className="text-gray-400 text-sm">{plan.period}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-gray-300">{plan.description}</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-tech-green mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
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
    </>
  );
};

export default Pricing;
