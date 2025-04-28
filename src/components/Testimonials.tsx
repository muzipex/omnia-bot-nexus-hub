
import React from 'react';

const testimonials = [
  {
    name: 'Alex Morgan',
    role: 'Professional Trader',
    content: 'Omnia BOT has completely transformed my forex trading. The consistency and precision it offers are unmatched by any other trading system I\'ve used.',
    rating: 5
  },
  {
    name: 'Sarah Chen',
    role: 'Passive Investor',
    content: 'As someone with limited trading experience, Omnia BOT has been a game-changer. Setup was simple and the results speak for themselves.',
    rating: 5
  },
  {
    name: 'Michael Torres',
    role: 'Fund Manager',
    content: 'We\'ve integrated Omnia BOT into our fund\'s strategy and have seen a significant improvement in our monthly returns with reduced volatility.',
    rating: 4
  }
];

const Testimonials: React.FC = () => {
  return (
    <div id="testimonials" className="grid-bg noise-effect py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="blue-glow-text">Trusted</span> by <span className="glow-text">Traders</span> Worldwide
          </h2>
          <p className="text-gray-300 text-lg">
            Join thousands of successful traders who have elevated their trading with Omnia BOT.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="tech-card hover:border-tech-blue/40 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-white">{testimonial.name}</h3>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-tech-green' : 'text-gray-600'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-300">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tech-charcoal border border-tech-blue/30">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-tech-blue to-tech-purple flex items-center justify-center text-white text-xs font-bold border-2 border-tech-charcoal"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-gray-300 ml-1">
              <span className="text-tech-green font-bold">1,500+</span> active traders
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
