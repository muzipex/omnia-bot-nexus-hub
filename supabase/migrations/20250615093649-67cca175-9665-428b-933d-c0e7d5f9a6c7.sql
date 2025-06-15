
-- Add simonmusipex@gmail.com as an admin
-- First, we need to find the user ID for this email from auth.users
-- Then insert it into the admins table

INSERT INTO public.admins (id)
SELECT id 
FROM auth.users 
WHERE email = 'simonmusipex@gmail.com'
ON CONFLICT (id) DO NOTHING;
