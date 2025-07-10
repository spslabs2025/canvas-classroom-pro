-- Create a table to store drawing strokes for better pen tool support
CREATE TABLE IF NOT EXISTS public.drawing_strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID NOT NULL REFERENCES public.slides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stroke_data JSONB NOT NULL,
  tool_type TEXT NOT NULL DEFAULT 'pen',
  color TEXT NOT NULL DEFAULT '#000000',
  size INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drawing_strokes ENABLE ROW LEVEL SECURITY;

-- Create policies for drawing strokes
CREATE POLICY "Users can view strokes from their slides"
ON public.drawing_strokes
FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.slides s
    INNER JOIN public.lessons l ON s.lesson_id = l.id
    WHERE s.id = drawing_strokes.slide_id AND l.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create strokes on their slides"
ON public.drawing_strokes
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.slides s
    INNER JOIN public.lessons l ON s.lesson_id = l.id
    WHERE s.id = drawing_strokes.slide_id AND l.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own strokes"
ON public.drawing_strokes
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own strokes"
ON public.drawing_strokes
FOR DELETE
USING (user_id = auth.uid());

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_slide_id ON public.drawing_strokes(slide_id);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_user_id ON public.drawing_strokes(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_drawing_strokes_updated_at
  BEFORE UPDATE ON public.drawing_strokes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();