
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Shield } from "lucide-react";
import heroImage from '/lovable-uploads/be6502e0-2669-4abe-b2d4-fe0a40a81c80.png';

const Hero: React.FC = () => {
  return (
    <div className="relative grid-bg noise-effect min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-tech-charcoal border border-tech-blue/30 text-sm font-medium text-tech-blue">
              Algorithmic Forex Trading
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="glow-text animate-text-flicker">OMNIA BOT</span>: <br />
              <span className="text-gradient">Advanced Forex</span> <br />
              <span className="text-white">Trading Automation</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-xl">
              Leverage AI-powered algorithms to execute trades with precision and consistency, no matter the market conditions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold group gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-tech-blue text-tech-blue hover:bg-tech-blue/10">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-tech-blue" />
                <span className="text-gray-300">AI-Powered Logic</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-tech-blue" />
                <span className="text-gray-300">24/7 Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-tech-blue to-tech-green rounded-xl blur opacity-30"></div>
            <div className="relative tech-card overflow-hidden">
              <img 
                src={heroImage}
                alt="Omnia Bot Trading Interface" 
                className="rounded-lg w-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tech-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-tech-green font-mono">Daily profit:</p>
                  <p className="text-2xl font-bold glow-text">+$14.85</p>
                </div>
                <Button size="sm" className="bg-tech-green/20 hover:bg-tech-green/30 text-tech-green border border-tech-green/50">
                  Live Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-tech-dark to-transparent"></div>
    </div>
  );
};

export default Hero;
