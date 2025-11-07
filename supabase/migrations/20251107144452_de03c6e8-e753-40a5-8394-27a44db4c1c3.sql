-- Allow public read access to system_settings logo for login page
CREATE POLICY "Anyone can view system logos"
ON public.system_settings
FOR SELECT
TO public
USING (true);