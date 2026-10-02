DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profile owners and editors can view profiles" ON public.profiles FOR SELECT TO authenticated USING (id = (select auth.uid()) OR public.has_role((select auth.uid()), 'admin') OR public.has_role((select auth.uid()), 'moderator'));
CREATE POLICY "Published article authors are visible" ON public.profiles FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.articles a WHERE a.author_id = profiles.id AND a.status = 'published'));
GRANT SELECT ON public.profiles TO anon, authenticated;