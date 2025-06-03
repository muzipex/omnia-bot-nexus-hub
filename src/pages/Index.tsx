
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Performance from '../components/Performance';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import TradingViewChart from '../components/dashboard/TradingViewChart';

const Index = () => {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-tech-dark flex flex-col relative">
        <header role="banner">
          <Navbar />
        </header>
        
        <main id="main-content" role="main">
          <Hero />
          
          <section aria-labelledby="live-chart-heading" className="py-16 bg-tech-dark">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 id="live-chart-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Live Market Analysis
                  </h2>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Monitor real-time gold prices and market movements with our integrated TradingView charts
                  </p>
                </div>
                <TradingViewChart height={600} />
              </div>
            </div>
          </section>
          
          <section aria-labelledby="features-heading">
            <Features />
          </section>
          <section aria-labelledby="performance-heading">
            <Performance />
          </section>
          <section aria-labelledby="testimonials-heading">
            <Testimonials />
          </section>
          <section aria-labelledby="pricing-heading">
            <Pricing />
          </section>
          <section aria-labelledby="cta-heading">
            <CTA />
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
