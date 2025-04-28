
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const CTA: React.FC = () => {
  return (
    <div className="grid-bg noise-effect py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="glow-text">Elevate</span> Your Trading with <span className="blue-glow-text">Omnia BOT</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have transformed their forex trading experience with our cutting-edge algorithmic solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold group gap-2">
              Get Started Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-tech-blue text-tech-blue hover:bg-tech-blue/10 gap-2">
              <Shield className="w-4 h-4" />
              30-Day Money Back
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 -left-64 w-96 h-96 bg-tech-blue/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 -right-64 w-96 h-96 bg-tech-green/20 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-tech-blue rounded-full animate-pulse-glow"></div>
      <div className="absolute top-1/3 right-10 w-3 h-3 bg-tech-green rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-tech-purple rounded-full animate-pulse-glow"></div>
    </div>
  );
};

export default CTA;
