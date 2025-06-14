
import React, { useEffect } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Performance from "@/components/Performance";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";
import AppStatusBanner from "@/components/AppStatusBanner";

const Index = () => {
  const { trackPageView } = useVisitorTracking();

  useEffect(() => {
    trackPageView('/');
  }, [trackPageView]);

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-tech-dark">
        <AppStatusBanner />
        <Navbar />
        <Hero />
        <Features />
        <Performance />
        <Testimonials />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </>
  );
};

export default Index;
