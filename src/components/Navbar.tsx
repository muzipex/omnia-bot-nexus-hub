
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShieldCheck, Rocket, Menu, X, User, LogOut } from "lucide-react";
import { scrollToSection } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { AuthModal } from './auth/AuthModal';
import { toast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, signOut, setShowAuthModal } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-tech-dark/80 border-b border-tech-blue/20 py-3" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2" aria-label="Omnia BOT Home">
            <div className="relative">
              <Rocket className="w-8 h-8 text-tech-blue animate-pulse-glow" aria-hidden="true" />
              <div className="absolute -inset-1 bg-tech-blue/20 rounded-full blur-sm -z-10"></div>
            </div>
            <h1 className="text-2xl font-bold blue-glow-text tracking-tight">OMNIA BOT</h1>
          </a>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav aria-label="Desktop navigation">
              <ul className="flex items-center space-x-8">
                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-gray-300 hover:text-tech-blue transition-colors">Features</a></li>
                <li><a href="#performance" onClick={(e) => handleNavClick(e, 'performance')} className="text-gray-300 hover:text-tech-blue transition-colors">Performance</a></li>
                <li><a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-gray-300 hover:text-tech-blue transition-colors">Testimonials</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-gray-300 hover:text-tech-blue transition-colors">Pricing</a></li>
              </ul>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="outline" className="border-tech-blue text-tech-blue hover:bg-tech-blue/10">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAuthClick('login')}
                  className="border-tech-blue text-tech-blue hover:bg-tech-blue/10"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button 
                  onClick={() => handleAuthClick('signup')}
                  className="bg-tech-green text-tech-dark hover:bg-tech-green/80 font-bold"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          
          <Button 
            className="md:hidden bg-transparent border-none text-tech-blue hover:bg-transparent hover:text-tech-green"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>

          {/* Mobile Menu */}
          <div 
            id="mobile-menu"
            className={`absolute top-full left-0 right-0 bg-tech-dark/95 border-b border-tech-blue/20 md:hidden ${
              isMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <nav aria-label="Mobile navigation">
              <ul className="container mx-auto px-4 py-4 space-y-4">
                <li>
                  <a 
                    href="#features" 
                    className="block text-gray-300 hover:text-tech-blue transition-colors"
                    onClick={(e) => handleNavClick(e, 'features')}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a 
                    href="#performance" 
                    className="block text-gray-300 hover:text-tech-blue transition-colors"
                    onClick={(e) => handleNavClick(e, 'performance')}
                  >
                    Performance
                  </a>
                </li>
                <li>
                  <a 
                    href="#testimonials" 
                    className="block text-gray-300 hover:text-tech-blue transition-colors"
                    onClick={(e) => handleNavClick(e, 'testimonials')}
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a 
                    href="#pricing" 
                    className="block text-gray-300 hover:text-tech-blue transition-colors"
                    onClick={(e) => handleNavClick(e, 'pricing')}
                  >
                    Pricing
                  </a>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full border-tech-blue text-tech-blue hover:bg-tech-blue/10"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </li>
                    <li>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleAuthClick('login');
                          setIsMenuOpen(false);
                        }}
                        className="w-full border-tech-blue text-tech-blue hover:bg-tech-blue/10"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </li>
                    <li>
                      <Button 
                        onClick={() => {
                          handleAuthClick('signup');
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-tech-green text-tech-dark hover:bg-tech-green/80 font-bold"
                      >
                        Sign Up
                      </Button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
          
          <Link 
            to="/admin" 
            className="text-tech-blue/50 hover:text-tech-blue transition-colors p-1" 
            title="Admin Portal"
          >
            Admin
          </Link>
        </div>
      </nav>

      <AuthModal />
    </>
  );
};

export default Navbar;
