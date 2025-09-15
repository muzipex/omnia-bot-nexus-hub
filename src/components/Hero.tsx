
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Shield, Award } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MatrixCandleStickBackground from './MatrixCandleStickBackground';

const Hero: React.FC = () => {
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/models');
  };

  return (
    <div className="relative grid-bg noise-effect min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MatrixCandleStickBackground />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-tech-charcoal border border-tech-blue/30 text-sm font-medium text-tech-blue backdrop-blur-sm">
                🏆 FCA Regulated
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-tech-charcoal border border-tech-green/30 text-sm font-medium text-tech-green backdrop-blur-sm">
                💰 $2.4M+ AUM
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="glow-text animate-text-flicker">OMNIA BOT</span>: <br />
              <span className="text-gradient">Institutional-Grade</span> <br />
              <span className="text-white">Trading Technology</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-xl">
              Professional algorithmic trading platform with verified 18-month track record. 
              Built by former Goldman Sachs & Morgan Stanley quantitative analysts.
            </p>
            
            <div className="flex items-center gap-6 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold glow-text">87%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold glow-text">12%</div>
                <div className="text-sm text-gray-400">Monthly ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold glow-text">5.2%</div>
                <div className="text-sm text-gray-400">Max Drawdown</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold group gap-2"
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-tech-blue text-tech-blue hover:bg-tech-blue/10"
                onClick={() => setShowVideo(true)}
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-tech-blue" />
                <span className="text-gray-300">Institutional AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-tech-blue" />
                <span className="text-gray-300">Risk-Controlled</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-tech-green" />
                <span className="text-gray-300">Audited Results</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-tech-blue to-tech-green rounded-xl blur opacity-30"></div>
            <div className="relative tech-card overflow-hidden backdrop-blur-sm">
              <img 
                src="/Screenshot 2025-04-28 025035.png"
                alt="Omnia Bot Trading Interface showing live market analysis and automated trading decisions"
                className="rounded-lg w-full object-contain"
                loading="eager" // Hero image should load immediately as it's above the fold
                width="600"
                height="400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tech-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-tech-green font-mono">Daily profit:</p>
                  <p className="text-2xl font-bold glow-text">+$140.85</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-tech-green/20 hover:bg-tech-green/30 text-tech-green border border-tech-green/50"
                  onClick={() => setShowVideo(true)}
                >
                  Live Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-tech-dark border-tech-blue/20">
          <video 
            className="w-full aspect-video" 
            controls 
            autoPlay
          >
            <source src="/Screen Recording 2025-04-28 052115 - Trim.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-tech-dark to-transparent z-10"></div>
    </div>
  );
};

export default Hero;
