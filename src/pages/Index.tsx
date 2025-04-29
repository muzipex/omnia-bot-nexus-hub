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
