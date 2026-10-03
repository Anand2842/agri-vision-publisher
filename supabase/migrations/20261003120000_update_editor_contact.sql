-- Update contact and publisher details for Dr. Dileep Kumar
UPDATE public.site_content
SET value = '+91 8107240852'
WHERE (page = 'header' AND section = 'topbar' AND key = 'phone')
   OR (page = 'footer' AND section = 'contact' AND key = 'phone')
   OR (page = 'contact' AND section = 'office' AND key = 'phone')
   OR (page = 'membership' AND section = 'payment' AND key = 'upi_number');

UPDATE public.site_content
SET value = 'dkdkdkdangi@gmail.com'
WHERE (page = 'header' AND section = 'topbar' AND key = 'email')
   OR (page = 'footer' AND section = 'contact' AND key = 'email')
   OR (page = 'contact' AND section = 'office' AND key = 'email')
   OR (page = 'membership' AND section = 'payment' AND key = 'contact_email');

UPDATE public.site_content
SET value = 'Dr. Dileep Kumar'
WHERE (page = 'footer' AND section = 'contact' AND key = 'name')
   OR (page = 'footer' AND section = 'legal' AND key = 'publisher_name')
   OR (page = 'contact' AND section = 'office' AND key = 'chief_editor')
   OR (page = 'contact' AND section = 'publisher' AND key = 'name');

UPDATE public.site_content
SET value = 'ICAR–RRS–CAZRI, Jaisalmer 345001'
WHERE (page = 'footer' AND section = 'contact' AND key = 'address');

UPDATE public.site_content
SET value = 'ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India'
WHERE (page = 'contact' AND section = 'office' AND key = 'address')
   OR (page = 'contact' AND section = 'publisher' AND key = 'address');

-- Update particulars JSON in about page if present
UPDATE public.site_content
SET value = '[["Title","The Agriculture Popular Article Magazine"],["E-ISSN","Applied For"],["P-ISSN","Applied For"],["Frequency","Monthly"],["Subject","Agriculture"],["Language","English"],["Format","Online (PDF)"],["Starting Year","2026"],["Publisher","Dr. Dileep Kumar"],["Chief Editor","Dr. Dileep Kumar"],["Publisher Address","ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India"],["Mobile","+91 8107240852"],["Email","dkdkdkdangi@gmail.com"]]'
WHERE page = 'about' AND section = 'particulars' AND key = 'items';

-- Update submission requirements guidelines email
UPDATE public.site_content
SET value = '["Manuscripts must be submitted in Microsoft Word format (.doc / .docx). Other formats will be rejected at screening.","Article length: 2–4 pages (approximately 1,500–3,000 words).","Each article must contain a clear introduction and a conclusion.","Submissions for the next monthly issue close on the 25th of every month.","Submit online through the portal, or e-mail your file to dkdkdkdangi@gmail.com."]'
WHERE page = 'guidelines' AND section = 'requirements' AND key = 'items';
