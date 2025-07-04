-- Enable Row Level Security on promo_codes table
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access to promo codes
-- since these are typically meant to be publicly accessible
CREATE POLICY "Allow public read access to promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (true);

-- If admin access is needed, you can add a more restrictive policy later
-- For now, this ensures the table is secured but accessible for validation