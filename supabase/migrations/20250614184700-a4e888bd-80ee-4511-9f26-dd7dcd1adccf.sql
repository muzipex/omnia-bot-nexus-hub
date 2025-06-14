
-- Create a table to persist each user's Telegram bot configuration.
CREATE TABLE IF NOT EXISTS public.telegram_bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_token TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- RLS: Only the owner can access their own Telegram config.
ALTER TABLE public.telegram_bot_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can access own telegram bot config"
  ON public.telegram_bot_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User can insert own telegram bot config"
  ON public.telegram_bot_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own telegram bot config"
  ON public.telegram_bot_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "User can delete own telegram bot config"
  ON public.telegram_bot_configs
  FOR DELETE USING (auth.uid() = user_id);

