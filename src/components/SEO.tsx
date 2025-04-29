import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'AI-Powered Forex Trading Robot',
  description = 'Advanced AI-powered forex trading robot with 87% win rate. Automated 24/7 trading, risk management, and consistent profits in any market condition.',
  canonical = 'https://omniabot.com',
  type = 'website',
  image = 'https://omniabot.com/Screenshot 2025-04-28 025035.png',
  noindex = false,
}) => {
  const siteTitle = `${title} | Omnia BOT`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Omnia BOT" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@OmniaBOT" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;