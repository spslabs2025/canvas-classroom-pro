
-- Update the handle_new_user function to match the actual users table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, trial_start)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NOW()
  );
  
  -- Create default branding for new user
  INSERT INTO public.branding (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'TutorBox'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
