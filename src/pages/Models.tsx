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
import { toast } from "@/components/ui/sonner";

const robotModels = [
  {
    id: "advanced",
    name: "Advanced Algorithm",
    price: 499,
    description: "Our most sophisticated trading model with maximum features",
    features: [
      "Advanced risk management",
      "All currency pairs supported",
      "Real-time market analysis",
      "Multiple timeframe analysis",
      "Custom indicators and strategies",
      "Priority support access"
    ]
  }
];

const setupSteps = [
  {
    title: "Choose Your Plan",
    description: "Select the trading plan that best suits your needs.",
    icon: CreditCard
  },
  {
    title: "Make Payment",
    description: "Securely process your payment via PayPal or card.",
    icon: Download
  },
  {
    title: "Download & Install",
    description: "Download and install Omnia BOT on your computer.",
    icon: ArrowRight
  },
  {
    title: "Start Trading",
    description: "Connect to your broker and start automated trading.",
    icon: Check
  }
];

const Models: React.FC = () => {
  const navigate = useNavigate();
  const { hasPaid, handleDownload } = useDownloadState();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  const handlePayment = () => {
    const plan = robotModels[0]; // We only have one plan
    
    if (selectedPaymentMethod === 'paypal') {
      initializePayPalPayment({
        name: plan.name,
        price: plan.price,
        planId: plan.id
      });
    } else if (selectedPaymentMethod === 'card') {
      flutterwavePayment({
        name: plan.name,
        price: plan.price,
        planId: plan.id
      });
    }
  };

  return (
    <>
      <SEO 
        title="Omnia BOT Models | Advanced Forex Trading Robots"
        description="Explore our range of advanced forex trading robots with support for XM, Exness, FBS and more. Get started with our easy setup process."
      />
      
      <div className="min-h-screen bg-tech-dark">
        <Navbar />
        
        <main className="pt-20">
          {/* Hero Section */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Advanced <span className="text-gradient">Trading Models</span>
              </h1>
              <p className="text-xl text-gray-300">
                Choose the perfect trading model to match your investment strategy.
              </p>
            </div>
            
            {/* Model Card */}
            <div className="max-w-4xl mx-auto tech-card">
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{robotModels[0].name}</h2>
                    <p className="text-gray-300 mb-4">{robotModels[0].description}</p>
                    <ul className="space-y-3">
                      {robotModels[0].features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <Check className="w-5 h-5 text-tech-green mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="w-full md:w-auto text-center">
                    <div className="text-3xl font-bold text-tech-blue mb-2">
                      ${robotModels[0].price}
                    </div>
                    <p className="text-gray-400 mb-4">One-time payment</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Tabs defaultValue="paypal" className="w-full" onValueChange={(value) => setSelectedPaymentMethod(value as 'paypal' | 'card')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      <TabsTrigger value="card">Card Payment</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
