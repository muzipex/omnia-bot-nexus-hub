
-- Create a function that upgrades subscription when a transaction is marked completed
CREATE OR REPLACE FUNCTION public.upgrade_subscription_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type text;
  expire_interval interval;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Map plan_id to subscription_type
    CASE NEW.plan_id
      WHEN 'standard' THEN plan_type := 'basic';
      WHEN 'premium' THEN plan_type := 'premium';
      WHEN 'ultimate' THEN plan_type := 'enterprise';
      ELSE plan_type := 'basic';
    END CASE;

    -- Map plan to expiry (standard=6mo, premium=12mo, ultimate=lifetime/10yr)
    CASE NEW.plan_id
      WHEN 'standard' THEN expire_interval := INTERVAL '6 months';
      WHEN 'premium' THEN expire_interval := INTERVAL '12 months';
      WHEN 'ultimate' THEN expire_interval := INTERVAL '10 years';
      ELSE expire_interval := INTERVAL '6 months';
    END CASE;

    -- Update subscription if user_email matches a user, or upsert by looking up user
    UPDATE public.subscriptions
    SET 
      subscription_type = plan_type,
      status = 'active',
      subscription_started_at = now(),
      subscription_expires_at = now() + expire_interval,
      updated_at = now()
    WHERE user_id = (
      SELECT id FROM auth.users WHERE email = NEW.user_email LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
CREATE TRIGGER on_transaction_completed
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.upgrade_subscription_on_payment();
