
-- Create users table with proper authentication support
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 0, -- in seconds
  status TEXT DEFAULT 'draft', -- draft, recording, completed
  thumbnail_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slides table for multi-slide support
CREATE TABLE IF NOT EXISTS public.slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  canvas_data JSONB DEFAULT '{}',
  background_template TEXT DEFAULT 'white',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  duration INTEGER,
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subtitles table
CREATE TABLE IF NOT EXISTS public.subtitles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  srt_content TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branding table
CREATE TABLE IF NOT EXISTS public.branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  logo_url TEXT,
  watermark_text TEXT,
  watermark_position TEXT DEFAULT 'bottom-right',
  watermark_opacity DECIMAL DEFAULT 0.8,
  brand_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for lessons
CREATE POLICY "Users can view own lessons" ON public.lessons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lessons" ON public.lessons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lessons" ON public.lessons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lessons" ON public.lessons
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for slides
CREATE POLICY "Users can view own slides" ON public.slides
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can create own slides" ON public.slides
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can update own slides" ON public.slides
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can delete own slides" ON public.slides
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

-- Create RLS policies for recordings
CREATE POLICY "Users can view own recordings" ON public.recordings
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can create own recordings" ON public.recordings
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can update own recordings" ON public.recordings
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

-- Create RLS policies for subtitles
CREATE POLICY "Users can view own subtitles" ON public.subtitles
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

CREATE POLICY "Users can create own subtitles" ON public.subtitles
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.lessons WHERE id = lesson_id));

-- Create RLS policies for branding
CREATE POLICY "Users can view own branding" ON public.branding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own branding" ON public.branding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding" ON public.branding
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, trial_start, trial_end)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW() + INTERVAL '14 days'
  );
  
  -- Create default branding for new user
  INSERT INTO public.branding (user_id, watermark_text)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'TutorBox'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branding_updated_at BEFORE UPDATE ON public.branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
