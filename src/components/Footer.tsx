import React from 'react';
import { Rocket, Phone } from "lucide-react";
import { Helmet } from 'react-helmet';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Omnia BOT",
            "description": "Next-generation algorithmic forex trading solution powered by advanced AI technology",
            "url": "https://omniabot.com",
            "logo": "https://omniabot.com/favicon.ico",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+256750058769",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://facebook.com/omniabot",
              "https://twitter.com/omniabot",
              "https://linkedin.com/company/omniabot",
              "https://youtube.com/omniabot"
            ]
          })}
        </script>
      </Helmet>

      <footer className="bg-tech-dark border-t border-tech-blue/20 py-12" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <Rocket className="w-6 h-6 text-tech-blue" aria-hidden="true" />
                  <div className="absolute -inset-1 bg-tech-blue/20 rounded-full blur-sm -z-10"></div>
                </div>
                <h2 className="text-xl font-bold blue-glow-text">OMNIA BOT</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Next-generation algorithmic forex trading solution powered by advanced AI technology.
              </p>
            </div>
            
            <nav aria-labelledby="company-links">
              <h3 id="company-links" className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2" role="list">
                {['About Us', 'Contact', 'Careers', 'Blog', 'Press'].map((item, i) => (
                  <li key={i}>
                    <a 
                      href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-gray-400 hover:text-tech-blue transition-colors"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            
            <nav aria-labelledby="resources-links">
              <h3 id="resources-links" className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2" role="list">
                {['Documentation', 'Tutorials', 'FAQ', 'Support Center', 'API'].map((item, i) => (
                  <li key={i}>
                    <a 
                      href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-gray-400 hover:text-tech-blue transition-colors"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            
            <nav aria-labelledby="legal-links">
              <h3 id="legal-links" className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2" role="list">
                {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((item, i) => (
                  <li key={i}>
                    <a 
                      href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-gray-400 hover:text-tech-blue transition-colors"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          <div className="border-t border-tech-blue/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm flex flex-col md:flex-row items-center gap-4">
              <p>© {currentYear} Omnia BOT. All rights reserved.</p>
              <p>Created by <span className="text-tech-blue">MUGERWA SIMON PETER</span></p>
              <a 
                href="https://wa.me/256750058769" 
                className="flex items-center gap-2 text-tech-green hover:text-tech-green/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp: +256 750 058769</span>
              </a>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {[
                { name: 'Facebook', url: 'https://facebook.com/omniabot' },
                { name: 'Twitter', url: 'https://twitter.com/omniabot' },
                { name: 'LinkedIn', url: 'https://linkedin.com/company/omniabot' },
                { name: 'YouTube', url: 'https://youtube.com/omniabot' }
              ].map((platform, i) => (
                <a 
                  key={i} 
                  href={platform.url}
                  className="text-gray-400 hover:text-tech-blue transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${platform.name} page`}
                >
                  {platform.name}
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs" role="note">
              Risk Warning: Trading forex involves substantial risk of loss and is not suitable for all investors. 
              Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
