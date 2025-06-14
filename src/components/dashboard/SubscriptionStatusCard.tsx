
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/use-subscription';
import { Crown, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionStatusCard = () => {
  const { subscription, hasValidSubscription, getRemainingTrialDays } = useSubscription();
  const navigate = useNavigate();

  const getSubscriptionIcon = () => {
    if (!subscription) return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    
    switch (subscription.subscription_type) {
      case 'premium':
      case 'enterprise':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-green-400" />;
    }
  };

  const getStatusColor = () => {
    if (!hasValidSubscription) return 'bg-red-600';
    if (subscription?.subscription_type === 'trial') return 'bg-blue-600';
    return 'bg-green-600';
  };

  const getStatusText = () => {
    if (!subscription) return 'No Subscription';
    if (!hasValidSubscription) return 'Expired';
    return subscription.subscription_type.toUpperCase();
  };

  const remainingDays = getRemainingTrialDays();

  return (
    <Card className="bg-gradient-to-br from-tech-charcoal to-tech-dark border-tech-blue/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          {getSubscriptionIcon()}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Current Plan</span>
          <Badge className={`${getStatusColor()} text-white border-0`}>
            {getStatusText()}
          </Badge>
        </div>
        
        {subscription?.subscription_type === 'trial' && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Days Remaining</span>
            <span className={`font-bold ${remainingDays <= 3 ? 'text-red-400' : 'text-blue-400'}`}>
              {remainingDays}
            </span>
          </div>
        )}
        
        {subscription?.subscription_expires_at && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Expires</span>
            <span className="text-white text-sm">
              {new Date(subscription.subscription_expires_at).toLocaleDateString()}
            </span>
          </div>
        )}
        
        <div className="pt-2 space-y-2">
          {!hasValidSubscription && (
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-tech-purple to-tech-blue hover:from-tech-purple/80 hover:to-tech-blue/80"
            >
              Upgrade Now
            </Button>
          )}
          
          {hasValidSubscription && subscription?.subscription_type === 'trial' && remainingDays <= 7 && (
            <Button 
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="w-full border-tech-blue/30 text-tech-blue hover:bg-tech-blue/10"
            >
              Upgrade Before Trial Ends
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
