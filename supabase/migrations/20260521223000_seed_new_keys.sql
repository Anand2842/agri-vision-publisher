-- Seed new branding keys and guidelines heading
INSERT INTO public.site_content (page, section, key, value) VALUES
('header', 'branding', 'title_line1', 'The Agriculture'),
('header', 'branding', 'title_line2', 'Popular Article Magazine'),
('guidelines', 'hero', 'heading', 'Author Guidelines')
ON CONFLICT (page, section, key) DO UPDATE
SET value = EXCLUDED.value;
