
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Lock, CheckCircle, Crown, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const SubscriptionBridgeDownload = () => {
  const { subscription, hasValidSubscription, getRemainingTrialDays, checkSubscription } = useSubscription();
  const navigate = useNavigate();

  // Refresh subscription status when component mounts
  useEffect(() => {
    checkSubscription();
  }, []);

  const handleDownload = (bridgeType: 'basic' | 'advanced' | 'enterprise') => {
    // Allow all users to download bridge files for connection purposes
    // Log download for admin tracking
    const downloadData = {
      user_id: subscription?.user_id,
      bridge_type: bridgeType,
      subscription_type: subscription?.subscription_type || 'trial',
      timestamp: new Date().toISOString()
    };
    
    console.log('Bridge download tracked:', downloadData);
    
    // Trigger download
    const fileName = bridgeType === 'basic' ? 'mt5_bridge.py' : 'mt5_bridge_gui.py';
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    link.click();
    
    toast({
      title: "Download Started",
      description: `MT5 ${bridgeType} bridge download initiated successfully.`,
    });
  };

  const bridgeOptions = [
    {
      id: 'basic',
      name: 'Basic Bridge',
      description: 'Command-line MT5 bridge for basic trading operations',
      features: [
        'Connect to MT5 terminal',
        'Execute basic trades',
        'Account information',
        'Position management'
      ],
      requiredSubscription: ['trial', 'basic', 'premium', 'enterprise'],
      icon: Download,
      color: 'text-blue-500'
    },
    {
      id: 'advanced',
      name: 'Advanced Bridge with GUI',
      description: 'Full-featured bridge with graphical interface and advanced features',
      features: [
        'Everything in Basic Bridge',
        'Graphical user interface',
        'Real-time monitoring',
        'Advanced order types',
        'Risk management tools',
        'Performance analytics'
      ],
      requiredSubscription: ['premium', 'enterprise'],
      icon: Star,
      color: 'text-purple-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Bridge',
      description: 'Professional-grade bridge with multi-account support and advanced features',
      features: [
        'Everything in Advanced Bridge',
        'Multi-account management',
        'Custom strategy integration',
        'Advanced API endpoints',
        'Priority support',
        'Custom configurations',
        'Institutional features'
      ],
      requiredSubscription: ['enterprise'],
      icon: Crown,
      color: 'text-yellow-500'
    }
  ];

  const canDownload = (requiredSubs: string[]) => {
    // Allow all users to download bridge files for connection purposes
    return true;
  };

  const getSubscriptionBadge = (type: string) => {
    const badges = {
      trial: { label: 'Trial', color: 'bg-gray-600' },
      basic: { label: 'Basic', color: 'bg-blue-600' },
      premium: { label: 'Premium', color: 'bg-purple-600' },
      enterprise: { label: 'Enterprise', color: 'bg-yellow-600' }
    };
    return badges[type as keyof typeof badges] || badges.trial;
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-tech-blue" />
            Your Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getSubscriptionBadge(subscription?.subscription_type || 'trial').color}>
                {getSubscriptionBadge(subscription?.subscription_type || 'trial').label}
              </Badge>
              {hasValidSubscription ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Inactive</span>
                </div>
              )}
            </div>
            
            {subscription?.subscription_type === 'trial' && (
              <div className="text-right">
                <p className="text-gray-400 text-sm">Trial expires in</p>
                <p className="text-white font-semibold">{getRemainingTrialDays()} days</p>
              </div>
            )}
          </div>
          
          {!hasValidSubscription && (
            <Alert className="mt-4 border-red-500/30 bg-red-500/10">
              <Lock className="w-4 h-4" />
              <AlertDescription className="text-red-400">
                Your subscription has expired. Please upgrade to continue downloading bridge files.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Bridge Download Options */}
      <div className="grid gap-6">
        {bridgeOptions.map((bridge) => {
          const IconComponent = bridge.icon;
          const isAllowed = canDownload(bridge.requiredSubscription);
          
          return (
            <Card key={bridge.id} className={`bg-tech-charcoal border-tech-blue/30 ${!isAllowed ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${bridge.color}`} />
                    <div>
                      <CardTitle className="text-white">{bridge.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {bridge.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {bridge.requiredSubscription.map((sub) => (
                      <Badge 
                        key={sub} 
                        variant="outline" 
                        className={`text-xs ${getSubscriptionBadge(sub).color} border-current`}
                      >
                        {getSubscriptionBadge(sub).label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      {bridge.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                   <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                     <div className="text-sm text-gray-400">
                       Ready to download
                     </div>
                     
                     <Button 
                       onClick={() => handleDownload(bridge.id as 'basic' | 'advanced' | 'enterprise')}
                       className="bg-tech-blue hover:bg-tech-blue/80"
                     >
                       <Download className="w-4 h-4 mr-2" />
                       Download
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionBridgeDownload;
