
import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, ShieldCheck } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasValidSubscription, getRemainingTrialDays } = useSubscription();
  const navigate = useNavigate();

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  if (!hasValidSubscription && subscription) {
    const remainingDays = getRemainingTrialDays();
    const isTrialExpired = subscription.subscription_type === 'trial' && remainingDays <= 0;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-gray-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {isTrialExpired ? (
                <Clock className="w-8 h-8 text-gray-600" />
              ) : (
                <CreditCard className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-black">
              {isTrialExpired ? 'Trial Expired' : 'Subscription Required'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-gray-300 text-gray-700">
                Current Plan: {subscription.subscription_type.toUpperCase()}
              </Badge>
              {subscription.subscription_type === 'trial' && (
                <p className="text-sm text-gray-600">
                  {remainingDays > 0 
                    ? `${remainingDays} days remaining` 
                    : 'Trial period has ended'
                  }
                </p>
              )}
            </div>
            
            <p className="text-gray-600">
              {isTrialExpired 
                ? 'Your free trial has ended. Please upgrade to continue using OMNIA BOT.'
                : 'To access the dashboard and start trading, please upgrade your subscription.'
              }
            </p>

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/pricing')} 
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                View Pricing Plans
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasValidSubscription) {
    return (
      <>
        {children}
        {/* Subscription status indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {subscription?.subscription_type === 'trial' 
              ? `Trial: ${getRemainingTrialDays()} days left`
              : subscription?.subscription_type.toUpperCase()
            }
          </Badge>
        </div>
      </>
    );
  }

  return null;
};

export default SubscriptionGuard;
