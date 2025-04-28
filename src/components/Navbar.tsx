
import React from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, Rocket } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-tech-dark/80 border-b border-tech-blue/20 py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Rocket className="w-8 h-8 text-tech-blue animate-pulse-glow" />
            <div className="absolute -inset-1 bg-tech-blue/20 rounded-full blur-sm -z-10"></div>
          </div>
          <h1 className="text-2xl font-bold blue-glow-text tracking-tight">OMNIA BOT</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-tech-blue transition-colors">Features</a>
          <a href="#performance" className="text-gray-300 hover:text-tech-blue transition-colors">Performance</a>
          <a href="#testimonials" className="text-gray-300 hover:text-tech-blue transition-colors">Testimonials</a>
          <a href="#pricing" className="text-gray-300 hover:text-tech-blue transition-colors">Pricing</a>
        </div>
        
        <Button variant="outline" className="hidden md:flex items-center gap-2 border-tech-blue text-tech-blue hover:bg-tech-blue/10">
          <ShieldCheck className="w-4 h-4" />
          Login
        </Button>
        
        <Button className="md:hidden bg-transparent border-none text-tech-blue hover:bg-transparent hover:text-tech-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
