INSERT INTO public.subscriptions (user_id, subscription_type, status, trial_started_at, trial_expires_at)
SELECT u.id, 'trial', 'active', now(), now() + INTERVAL '7 days'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id
)