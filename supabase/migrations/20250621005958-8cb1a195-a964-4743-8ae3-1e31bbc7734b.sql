
-- Create the users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  trial_start TIMESTAMP WITH TIME ZONE,
  is_pro BOOLEAN DEFAULT FALSE,
  promo_code TEXT,
  razorpay_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the promo_codes table
CREATE TABLE public.promo_codes (
  code TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('percentage', 'flat', 'extra_days')),
  value INT,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create the lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  export_status TEXT DEFAULT 'pending'
);

-- Create the slides table
CREATE TABLE public.slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  canvas_data JSONB DEFAULT '{}'::jsonb
);

-- Create the transcripts table
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  srt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the branding table
CREATE TABLE public.branding (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  logo_url TEXT,
  position TEXT DEFAULT 'bottom-right',
  opacity FLOAT DEFAULT 0.8,
  font TEXT DEFAULT 'Inter',
  color TEXT DEFAULT '#ffffff'
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own profile" 
ON public.users 
FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "Users can access their own lessons" 
ON public.lessons 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can access slides from their lessons" 
ON public.slides 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.id = slides.lesson_id 
    AND lessons.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access transcripts from their lessons" 
ON public.transcripts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.id = transcripts.lesson_id 
    AND lessons.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access their own branding" 
ON public.branding 
FOR ALL 
USING (auth.uid() = user_id);

-- Allow public read access to promo_codes (no RLS needed for this table)

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, trial_start)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed some sample promo codes
INSERT INTO public.promo_codes (code, type, value, expires_at)
VALUES
  ('WELCOME10', 'percentage', 10, NOW() + interval '30 days'),
  ('FLAT500', 'flat', 500, NOW() + interval '15 days'),
  ('EXTRA7', 'extra_days', 7, NOW() + interval '60 days');
