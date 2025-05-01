
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Check, Download, CreditCard, ArrowRight } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useDownloadState } from '@/hooks/use-download-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { flutterwavePayment } from '@/lib/flutterwave';
import { initializePayPalPayment } from '@/lib/paypal';

const robotModels = [
  {
    id: "advanced",
    name: "Advanced Algorithm",
    description: "Uses neural networks and deep learning to analyze market patterns and execute trades with high accuracy.",
    features: [
      "AI-powered decision making",
      "Advanced risk management",
      "Real-time market analysis",
      "Multiple timeframe analysis",
      "Customizable trading parameters"
    ]
  },
  {
    id: "scalping",
    name: "Scalping Pro",
    description: "Specialized in making multiple small quick trades to capture small price movements throughout the day.",
    features: [
      "Ultra-fast execution",
      "Low spread detection",
      "Custom scalping strategies",
      "Smart take-profit and stop-loss",
      "Anti-slippage mechanisms"
    ]
  },
  {
    id: "swing",
    name: "Swing Master",
    description: "Designed for medium-term trades that capture larger market movements over days or weeks.",
    features: [
      "Trend identification algorithms",
      "Support/resistance detection",
      "Fundamental data integration",
      "Swing pattern recognition",
      "Automated position sizing"
    ]
  }
];

const supportedBrokers = [
  { name: "XM", logo: "https://placehold.co/100x60?text=XM", description: "Compatible with XM MT4/MT5 platforms with all account types" },
  { name: "Exness", logo: "https://placehold.co/100x60?text=Exness", description: "Full support for Exness trading accounts with zero spreads" },
  { name: "FBS", logo: "https://placehold.co/100x60?text=FBS", description: "Compatible with FBS trading platforms and all account types" },
  { name: "IC Markets", logo: "https://placehold.co/100x60?text=IC+Markets", description: "Works with IC Markets raw spread accounts and cTrader" },
  { name: "Pepperstone", logo: "https://placehold.co/100x60?text=Pepperstone", description: "Full compatibility with Pepperstone MT4/MT5 and cTrader" },
  { name: "OctaFX", logo: "https://placehold.co/100x60?text=OctaFX", description: "Works seamlessly with OctaFX Micro and ECN accounts" }
];

const setupSteps = [
  {
    title: "Download & Extract",
    description: "Download the Omnia BOT installer package and extract it on your computer.",
    icon: Download
  },
  {
    title: "Install Dependencies",
    description: "Run the setup wizard to install necessary dependencies for your trading platform.",
    icon: Check
  },
  {
    title: "Configure Settings",
    description: "Open the configuration panel to set up your trading preferences and risk parameters.",
    icon: CreditCard
  },
  {
    title: "Connect Broker",
    description: "Enter your broker credentials and establish a secure connection to your trading account.",
    icon: ArrowRight
  }
];

const Models: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const navigate = useNavigate();
  const { hasPaid, handleDownload } = useDownloadState();
  
  const pricingPlans = [
    {
      name: 'Standard',
      price: 299,
      planId: 'standard',
    },
    {
      name: 'Premium',
      price: 499,
      planId: 'premium',
    },
    {
      name: 'Ultimate',
      price: 899,
      planId: 'ultimate',
    }
  ];
  
  const handlePayment = () => {
    const plan = pricingPlans.find(p => p.planId === selectedPlan);
    if (!plan) return;
    
    if (selectedPaymentMethod === 'paypal') {
      initializePayPalPayment({
        name: plan.name,
        price: plan.price,
        planId: plan.planId
      });
    } else if (selectedPaymentMethod === 'flutterwave') {
      flutterwavePayment({
        name: plan.name,
        price: plan.price,
        planId: plan.planId
      });
    }
  };

  return (
    <>
      <SEO 
        title="Omnia BOT Models | Advanced Forex Trading Robots"
        description="Explore our range of advanced forex trading robots with support for XM, Exness, FBS and more. Get started with our easy setup process."
      />
      <div className="min-h-screen bg-tech-dark flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <div className="grid-bg noise-effect py-16 md:py-24 relative">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Advanced <span className="glow-text">Trading Models</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Our AI-powered forex trading robots are designed to maximize your profits with minimal effort.
                </p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 -left-64 w-96 h-96 bg-tech-blue/20 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 -right-64 w-96 h-96 bg-tech-green/20 rounded-full filter blur-3xl opacity-20"></div>
          </div>
          
          {/* Robot Models Section */}
          <div className="py-16 bg-tech-dark">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-12 text-center">
                Choose Your <span className="blue-glow-text">Trading Model</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {robotModels.map((model) => (
                  <div key={model.id} className="tech-card hover:border-tech-blue/40 transition-all duration-300 h-full flex flex-col">
                    <h3 className="text-2xl font-bold mb-3 text-white">{model.name}</h3>
                    <p className="text-gray-300 mb-6">{model.description}</p>
                    <div className="space-y-3 mt-auto">
                      {model.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="min-w-4 h-4 rounded-full bg-tech-green/20 flex items-center justify-center mt-1">
                            <Check className="w-3 h-3 text-tech-green" />
                          </div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Supported Brokers */}
          <div className="py-16 bg-tech-charcoal">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-2 text-center">
                Compatible <span className="purple-glow-text">Brokers</span>
              </h2>
              <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
                Omnia BOT seamlessly integrates with all major forex brokers, giving you flexibility in your trading setup.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportedBrokers.map((broker, index) => (
                  <div key={index} className="flex items-center gap-4 tech-card border-tech-blue/10 p-4">
                    <img 
                      src={broker.logo} 
                      alt={`${broker.name} logo`} 
                      className="w-16 h-12 object-contain"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-white">{broker.name}</h3>
                      <p className="text-sm text-gray-300">{broker.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="py-16 bg-tech-dark">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto tech-card border-tech-blue/30">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Get <span className="blue-glow-text">Started Now</span>
                </h2>
                
                <Tabs defaultValue="premium" className="mb-8" onValueChange={setSelectedPlan}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                    <TabsTrigger value="ultimate">Ultimate</TabsTrigger>
                  </TabsList>
                  
                  {pricingPlans.map((plan) => (
                    <TabsContent key={plan.planId} value={plan.planId} className="text-center">
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400 text-sm"> / one-time payment</span>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-white">Payment Method</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      variant={selectedPaymentMethod === 'paypal' ? 'default' : 'outline'}
                      className={selectedPaymentMethod === 'paypal' ? 'bg-tech-blue' : 'border-tech-blue/40'}
                      onClick={() => setSelectedPaymentMethod('paypal')}
                    >
                      PayPal
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === 'flutterwave' ? 'default' : 'outline'}
                      className={selectedPaymentMethod === 'flutterwave' ? 'bg-tech-purple' : 'border-tech-purple/40'}
                      onClick={() => setSelectedPaymentMethod('flutterwave')}
                    >
                      Flutterwave
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold"
                  size="lg"
                  onClick={handlePayment}
                >
                  Proceed to Payment
                </Button>
                
                {hasPaid && (
                  <div className="mt-6 text-center">
                    <Button 
                      className="bg-tech-blue hover:bg-tech-blue/90 text-white gap-2"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                      Download Software
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Setup Instructions */}
          <div className="py-16 bg-tech-charcoal">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-2 text-center">
                Easy <span className="glow-text">Setup Process</span>
              </h2>
              <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
                Getting started with Omnia BOT is simple. Follow these steps after your purchase.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {setupSteps.map((step, index) => (
                  <div key={index} className="tech-card border-tech-blue/10 relative">
                    <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-tech-blue text-tech-dark flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="mb-4 h-10 w-10 rounded-full bg-tech-blue/20 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-tech-blue" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Models;
