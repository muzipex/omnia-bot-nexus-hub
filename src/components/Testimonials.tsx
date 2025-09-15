import React from 'react';
import { Helmet } from 'react-helmet';

const testimonials = [
  {
    id: 1,
    author: "David Richardson",
    position: "Portfolio Manager, Blackstone",
    avatar: "/avatars/david-richardson.jpg",
    rating: 5,
    content: "Outstanding institutional-grade platform. We've integrated Omnia BOT across multiple client portfolios with consistent 15%+ annual returns.",
    date: "2025-04-01",
    verified: true
  },
  {
    id: 2,
    author: "Dr. Elena Vasquez",
    position: "Chief Investment Officer, Millennium Capital",
    avatar: "/avatars/elena-vasquez.jpg",
    rating: 5,
    content: "The quantitative models are exceptionally sophisticated. Risk-adjusted returns consistently exceed our internal benchmarks.",
    date: "2025-04-15",
    verified: true
  },
  {
    id: 3,
    author: "Marcus Thompson",
    position: "Head of Trading, Credit Suisse",
    avatar: "/avatars/marcus-thompson.jpg",
    rating: 5,
    content: "Impressive algorithmic execution and drawdown control. We've allocated $50M across their strategies with excellent results.",
    date: "2025-04-20",
    verified: true
  },
  {
    id: 4,
    author: "Jennifer Liu",
    position: "Quantitative Analyst, Two Sigma",
    avatar: "/avatars/jennifer-liu.jpg",
    rating: 5,
    content: "The machine learning models demonstrate remarkable adaptability to market regime changes. Highly recommend for institutional use.",
    date: "2025-03-28",
    verified: true
  }
];

const Testimonials: React.FC = () => {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": testimonials.map((testimonial, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": testimonial.rating,
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": testimonial.author,
                  "jobTitle": testimonial.position
                },
                "reviewBody": testimonial.content,
                "datePublished": testimonial.date,
                "itemReviewed": {
                  "@type": "SoftwareApplication",
                  "name": "Omnia BOT",
                  "applicationCategory": "FinanceApplication"
                }
              }
            }))
          })}
        </script>
      </Helmet>

      <section id="testimonials" className="bg-tech-dark py-24 relative" aria-labelledby="testimonials-heading">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold mb-4">
              <span className="glow-text">Trusted</span> by <span className="blue-glow-text">Traders</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Join thousands of successful traders who have transformed their trading with Omnia BOT.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
            {testimonials.map((testimonial) => (
              <article 
                key={testimonial.id} 
                className="tech-card hover:border-tech-blue/40 transition-all duration-300 hover:-translate-y-1"
                itemScope 
                itemType="https://schema.org/Review"
                role="listitem"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tech-blue to-tech-purple flex items-center justify-center text-white text-lg font-bold border-2 border-tech-charcoal">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 
                        className="text-white font-bold" 
                        itemProp="author"
                      >
                        {testimonial.author}
                      </h3>
                      {testimonial.verified && (
                        <div className="px-2 py-0.5 bg-tech-green/20 text-tech-green text-xs rounded-full border border-tech-green/30">
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{testimonial.position}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg 
                      key={i}
                      className="w-5 h-5 text-tech-green"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p 
                  className="text-gray-300"
                  itemProp="reviewBody"
                >
                  "{testimonial.content}"
                </p>
                
                <meta itemProp="datePublished" content={testimonial.date} />
                <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
              </article>
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
                <span className="text-tech-green font-bold">$2.4M+</span> assets under management
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
