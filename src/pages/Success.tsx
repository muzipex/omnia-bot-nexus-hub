import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from 'lucide-react';
import { useDownloadState } from '@/hooks/use-download-state';

const Success: React.FC = () => {
  const { handleDownload } = useDownloadState();

  return (
    <div className="min-h-screen bg-tech-dark grid place-items-center p-4">
      <div className="max-w-md w-full tech-card text-center p-8 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-tech-green/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-tech-green" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
        
        <p className="text-gray-300">
          Thank you for your purchase. You can now download Omnia BOT and start your trading journey.
        </p>
        
        <Button 
          size="lg"
          className="w-full bg-tech-green hover:bg-tech-green/90 text-tech-dark gap-2"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5" />
          Download Omnia BOT
        </Button>
        
        <p className="text-sm text-gray-400">
          Need help? Contact our support team via WhatsApp at +256 750 058769
        </p>
      </div>
    </div>
  );
};

export default Success;