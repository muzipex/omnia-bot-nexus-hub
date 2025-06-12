
import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
  keywords?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'AI-Powered Forex Trading Robot',
  description = 'Advanced AI-powered forex trading robot with 87% win rate. Automated 24/7 trading, risk management, and consistent profits in any market condition.',
  canonical = 'https://omniabot.com',
  type = 'website',
  image = 'https://omniabot.com/Screenshot%202025-04-28%20025035.png',
  noindex = false,
  keywords = 'forex trading robot, AI trading bot, automated trading, MT5 bot, forex AI, trading automation, algorithmic trading, forex signals',
  structuredData,
}) => {
  const siteTitle = title.includes('Omnia BOT') ? title : `${title} | Omnia BOT`;
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Omnia BOT",
    "description": description,
    "url": canonical,
    "image": image,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "299",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Omnia BOT",
      "url": "https://omniabot.com"
    }
  };
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      
      {/* Enhanced Meta Tags */}
      <meta name="author" content="Omnia BOT" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#9b87f5" />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Omnia BOT" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@OmniaBOT" />
      <meta name="twitter:creator" content="@OmniaBOT" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://api.telegram.org" />
    </Helmet>
  );
};

export default SEO;
