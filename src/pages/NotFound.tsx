import React from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO 
        title="404 - Page Not Found"
        description="The page you are looking for could not be found."
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark flex flex-col items-center justify-center p-4">
        <Breadcrumbs className="absolute top-4 left-4 text-sm" />
        <div className="max-w-md w-full tech-card text-center space-y-6">
          <h1 className="text-4xl font-bold">
            <span className="text-tech-blue">404</span> - Page Not Found
          </h1>
          
          <div className="p-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-tech-blue/10 flex items-center justify-center">
              <span className="text-6xl text-tech-blue">?</span>
            </div>
            
            <p className="text-xl text-gray-300 mb-8">
              Oops! We couldn't find the page you're looking for.
            </p>

            <Button 
              className="bg-tech-blue hover:bg-tech-blue/90 text-white gap-2"
              onClick={() => window.location.href = '/'}
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </div>
          
          <p className="text-gray-400 text-sm">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
