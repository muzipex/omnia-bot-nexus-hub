
import React from 'react';
import { Rocket } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-tech-dark border-t border-tech-blue/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Rocket className="w-6 h-6 text-tech-blue" />
                <div className="absolute -inset-1 bg-tech-blue/20 rounded-full blur-sm -z-10"></div>
              </div>
              <h3 className="text-xl font-bold blue-glow-text">OMNIA BOT</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Next-generation algorithmic forex trading solution powered by advanced AI technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'Careers', 'Blog', 'Press'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-tech-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'Tutorials', 'FAQ', 'Support Center', 'API'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-tech-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-tech-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-tech-blue/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Omnia BOT. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {['Facebook', 'Twitter', 'LinkedIn', 'YouTube'].map((platform, i) => (
              <a 
                key={i} 
                href="#" 
                className="text-gray-400 hover:text-tech-blue transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Risk Warning: Trading forex involves substantial risk of loss and is not suitable for all investors. 
            Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
