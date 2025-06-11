
-- Create table for storing MT5 connected accounts
CREATE TABLE public.mt5_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_number BIGINT NOT NULL,
  server TEXT NOT NULL,
  account_name TEXT,
  broker TEXT,
  currency TEXT DEFAULT 'USD',
  balance NUMERIC DEFAULT 0,
  equity NUMERIC DEFAULT 0,
  margin NUMERIC DEFAULT 0,
  free_margin NUMERIC DEFAULT 0,
  margin_level NUMERIC DEFAULT 0,
  leverage INTEGER DEFAULT 100,
  is_connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, account_number, server)
);

-- Create table for subscription management
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_type TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'basic', 'premium', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'expired', 'cancelled'
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_expires_at TIMESTAMP WITH TIME ZONE,
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  credit_card_token TEXT, -- For storing encrypted card details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for account synchronization logs
CREATE TABLE public.account_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES mt5_connected_accounts(id) ON DELETE CASCADE,
  sync_status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  sync_data JSONB,
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mt5_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mt5_connected_accounts
CREATE POLICY "Users can view their own connected accounts" 
ON public.mt5_connected_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts" 
ON public.mt5_connected_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts" 
ON public.mt5_connected_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts" 
ON public.mt5_connected_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow service role to manage subscriptions
CREATE POLICY "Service role can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true);

-- RLS policies for account_sync_logs  
CREATE POLICY "Users can view sync logs for their accounts" 
ON public.account_sync_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM mt5_connected_accounts 
    WHERE id = account_sync_logs.account_id 
    AND user_id = auth.uid()
  )
);

-- Create function to automatically create trial subscription for new users
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    subscription_type,
    status,
    trial_started_at,
    trial_expires_at
  ) VALUES (
    NEW.id,
    'trial',
    'active',
    now(),
    now() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create trial subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_trial_subscription();

-- Create function to update account sync status
CREATE OR REPLACE FUNCTION public.update_account_sync_status(
  account_id UUID,
  sync_status TEXT,
  sync_data JSONB DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  sync_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.account_sync_logs (
    account_id,
    sync_status,
    sync_data,
    error_message,
    sync_duration_ms
  ) VALUES (
    account_id,
    sync_status,
    sync_data,
    error_message,
    sync_duration_ms
  ) RETURNING id INTO log_id;
  
  -- Update the connected account's last sync time
  UPDATE public.mt5_connected_accounts 
  SET 
    last_sync = now(),
    is_connected = CASE WHEN sync_status = 'success' THEN true ELSE false END
  WHERE id = account_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
