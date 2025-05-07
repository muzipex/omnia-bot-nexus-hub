
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Download, Bitcoin } from 'lucide-react';

interface PricingPlanProps {
  plan: {
    name: string;
    price: number;
    planId: string;
    period: string;
    description: string;
    features: string[];
    isPopular: boolean;
    cta: string;
  };
  handlePurchase: (plan: any) => void;
  handleCryptoPurchase: (plan: any) => void;
  handleDownload: () => void;
  handleUnpaidDownload: () => void;
  hasPaid: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  plan,
  handlePurchase,
  handleCryptoPurchase,
  handleDownload,
  handleUnpaidDownload,
  hasPaid,
  isVerified,
  isLoading
}) => {
  return (
    <div
      className={`tech-card relative ${plan.isPopular ? 'border-tech-green glow-border' : 'hover:border-tech-blue/40'} transition-all duration-300`}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-tech-green text-tech-dark text-sm font-bold rounded-full flex items-center gap-1">
          <Check className="w-4 h-4" />
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
      
      {/* Download button - now properly prevents downloads before payment */}
      <Button 
        className="w-full mt-4 bg-tech-blue hover:bg-tech-blue/90 text-white gap-2"
        onClick={(hasPaid || isVerified) ? handleDownload : handleUnpaidDownload}
        disabled={isLoading}
      >
        <Download className="w-4 h-4" />
        {isLoading ? "Verifying Payment..." : "Download Software"}
      </Button>
    </div>
  );
};

export default PricingPlan;
