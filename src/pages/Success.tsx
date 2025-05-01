import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Clock } from 'lucide-react';
import { useDownloadState } from '@/hooks/use-download-state';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';

const Success: React.FC = () => {
  const { hasPaid, handleDownload } = useDownloadState();
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment_success') === 'true';
  const navigate = useNavigate();

  useEffect(() => {
    if (!paymentSuccess) {
      navigate('/');
    }
    console.log('Purchase conversion completed');
  }, [paymentSuccess, navigate]);

  return (
    <>
      <SEO 
        title={!hasPaid ? "Payment Pending" : "Purchase Successful"}
        description={!hasPaid 
          ? "Your payment is being verified. We'll process your order soon." 
          : "Thank you for your purchase. Download Omnia BOT and start your trading journey."
        }
        type="website"
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark grid place-items-center p-4">
        <Breadcrumbs className="absolute top-4 left-4 text-sm" />
        <div className="max-w-md w-full tech-card text-center space-y-6" role="main">
          {!hasPaid ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-500" aria-hidden="true" />
              </div>
              
              <h1 className="text-3xl font-bold text-white">Payment Pending Verification</h1>
              
              <div className="space-y-4">
                <p className="text-gray-300">
                  Thank you for your purchase! Our admin team will verify your payment shortly.
                </p>
                
                <div className="bg-tech-blue/10 rounded-lg p-4 border border-tech-blue/20">
                  <h2 className="text-tech-blue font-bold mb-2">Next Steps:</h2>
                  <ol className="text-left text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Our team will verify your payment (usually within 24 hours)</li>
                    <li>You'll receive a confirmation email once approved</li>
                    <li>Return to this page to download the software</li>
                    <li>Follow the setup guide in your welcome email</li>
                  </ol>
                </div>
              </div>
              
              <Button 
                size="lg"
                className="w-full bg-tech-blue hover:bg-tech-blue/90 text-white font-bold gap-2"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-tech-green/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-tech-green" aria-hidden="true" />
              </div>
              
              <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
              
              <div className="space-y-4">
                <p className="text-gray-300">
                  Thank you for your purchase. You can now download Omnia BOT and start your trading journey.
                </p>
                
                <div className="bg-tech-blue/10 rounded-lg p-4 border border-tech-blue/20">
                  <h2 className="text-tech-blue font-bold mb-2">Next Steps:</h2>
                  <ol className="text-left text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Download the Omnia BOT software</li>
                    <li>Install on your trading computer</li>
                    <li>Follow the setup guide in your welcome email</li>
                    <li>Connect to your trading account</li>
                  </ol>
                </div>
              </div>
              
              <Button 
                size="lg"
                className="w-full bg-tech-green hover:bg-tech-green/90 text-tech-dark font-bold gap-2"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5" />
                Download Omnia BOT
              </Button>

              <p className="text-sm text-gray-400">
                Need help? Contact our <a href="/support" className="text-tech-blue hover:underline">support team</a>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Success;