
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: 'trial' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  trial_started_at?: string;
  trial_expires_at?: string;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  credit_card_token?: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Type assertion to fix the type issues
        const typedSubscription: Subscription = {
          ...data,
          subscription_type: data.subscription_type as 'trial' | 'basic' | 'premium' | 'enterprise',
          status: data.status as 'active' | 'inactive' | 'expired' | 'cancelled'
        };
        
        setSubscription(typedSubscription);
        
        // Check if subscription is valid
        const now = new Date();
        let isValid = false;

        if (typedSubscription.subscription_type === 'trial' && typedSubscription.status === 'active') {
          const trialExpires = new Date(typedSubscription.trial_expires_at || '');
          isValid = now <= trialExpires;
        } else if (typedSubscription.status === 'active' && typedSubscription.subscription_expires_at) {
          const subscriptionExpires = new Date(typedSubscription.subscription_expires_at);
          isValid = now <= subscriptionExpires;
        }

        setHasValidSubscription(isValid);
      } else {
        // No subscription found - create a default trial subscription
        setHasValidSubscription(true); // Allow access for now
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      // On error, allow access
      setHasValidSubscription(true);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTrialDays = () => {
    if (!subscription || subscription.subscription_type !== 'trial') return 0;
    
    const now = new Date();
    const trialExpires = new Date(subscription.trial_expires_at || '');
    const diffTime = trialExpires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Set up real-time subscription updates
  useEffect(() => {
    checkSubscription();

    if (!user) return;

    // Set up real-time subscription updates
    const channel = supabase
      .channel('subscription-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('Subscription updated, refreshing...');
        checkSubscription();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    subscription,
    loading,
    hasValidSubscription,
    getRemainingTrialDays,
    checkSubscription
  };
};
