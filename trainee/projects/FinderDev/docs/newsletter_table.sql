-- Newsletter Subscriptions Tablosu
-- Supabase SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscriptions(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS set_newsletter_subscriptions_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER set_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_newsletter_updated_at();

-- Row Level Security (RLS) - Public read/write for newsletter
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Herkes newsletter'e abone olabilir
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Herkes kendi email'ini kontrol edebilir (opsiyonel)
CREATE POLICY "Anyone can view newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (true);
