CREATE TABLE public.site_content (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page      TEXT NOT NULL,
  section   TEXT NOT NULL,
  key       TEXT NOT NULL,
  value     TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, section, key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content public read" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site content" ON public.site_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed Default Content
INSERT INTO public.site_content (page, section, key, value) VALUES

-- Header & Footer
('header', 'topbar', 'phone', '+91 9509164410'),
('header', 'topbar', 'email', 'dkdkdangi@gmail.com'),
('header', 'branding', 'tagline', 'Knowledge · Innovation · Sustainability'),
('header', 'cta', 'special_issue_label', 'Special Issue'),

('footer', 'branding', 'description', 'A peer-reviewed, open-access monthly magazine advancing agriculture through knowledge, innovation, sustainability and community.'),
('footer', 'branding', 'tagwords', '["Knowledge", "Innovation", "Sustainability", "Community"]'),
('footer', 'contact', 'name', 'Dr. Dileep Kumar'),
('footer', 'contact', 'address', 'ICAR–RRS–CAZRI, Jaisalmer 345001'),
('footer', 'contact', 'phone', '+91 9509164410'),
('footer', 'contact', 'email', 'dkdkdangi@gmail.com'),
('footer', 'legal', 'publisher_name', 'Ram Mangalam Agri – Rural Development Foundation'),

-- Home
('home', 'hero', 'headline', 'Welcome to The Agriculture Popular Article Magazine'),
('home', 'intro', 'heading', 'The Agriculture Popular Article Magazine'),
('home', 'intro', 'body', 'The Agriculture Popular Article Magazine is a peer-reviewed, open access monthly magazine, initiated for the purpose of providing information about novel innovations and techniques developed in agriculture and its allied sectors. Other than agriculture, it also focuses on the environmental aspects as it is of greater concern in the present scenario and needs to be addressed by agriculturists. This magazine gives a platform to researchers, scientists, students, innovative and progressive farmers and any other members of the scientific community to share their innovative ideas and to spread awareness in the agriculture sector by publishing articles addressing current and future needs. The Agriculture Popular Article Magazine also aims at providing a platform to different agri and agri-tech start-ups to showcase their success stories, business ideas and plans, thereby enticing a sense of innovativeness among brilliant minds throughout the world.'),
('home', 'vision_mission', 'heading', 'Vision and Mission'),
('home', 'vision_mission', 'body', 'Informative, innovative and content-rich communication of information is most needed and is of great priority. A broad spectrum of advancement of technologies and other possibilities in the farming sector has become very important; consequently, The Agriculture Popular Article Magazine helps in disseminating such information to the farming community as well as other agencies, institutes and organisations to provide them with the latest developments in the field of agriculture and environmental studies. The magazine is appealing due to its unique way of presenting information, which further helps in providing a platform for comprehensive data sharing regarding different aspects of agriculture including its policies, technologies, economics and other scientific advances.'),
('home', 'testimonials', 'heading', 'Our Testimonials'),
('home', 'testimonials', 'items', '[{"quote":"A genuinely indispensable monthly read — the kind of magazine that bridges the lab and the field with rare clarity. I look forward to every issue.","name":"Andy Guscott","role":"Researcher, IRRI"},{"quote":"The Agriculture Popular Article Magazine has become required reading in our extension office. Practical, peer-reviewed, beautifully produced.","name":"Kirstin W. Everton","role":"Extension Officer, Cornell"}]'),
('home', 'readership', 'heading', 'Readership'),
('home', 'readership', 'items', '[{"label":"Readers","value":50000},{"label":"Farmers","value":30000},{"label":"Academicians","value":55000},{"label":"Faculty","value":3700},{"label":"International Visitors","value":2500}]'),
('home', 'partners', 'heading', 'Our Partners'),
('home', 'partners', 'items', '["AgriNext","FAO","ICAR","CGIAR","Wageningen UR","Indus Agritech","EMBRAPA","TNAU"]'),

-- About
('about', 'hero', 'tagline', 'A peer-reviewed magazine for India''s agricultural community.'),
('about', 'hero', 'para1', 'The Agriculture Popular Article Magazine is a monthly, online, peer-reviewed publication dedicated to advancing Indian agriculture through knowledge, innovation, sustainability and community. It is published by the Ram Mangalam Agri – Rural Development Foundation (RADF) and edited by Dr. Dileep Kumar, Senior Scientist (Agriculture Extension) at ICAR–RRS–CAZRI, Jaisalmer.'),
('about', 'hero', 'para2', 'We sit between the academic journal and the trade magazine: rigorous enough for research, accessible enough for the field officer, the KVK scientist and the progressive farmer. Every article is reviewed by qualified specialists before it reaches our readers.'),
('about', 'hero', 'para3', 'Our pages cover agronomy, horticulture, soil and water management, animal sciences, agri-business, extension and allied disciplines — with a particular focus on the arid and semi-arid systems of western India and on the smallholder economies of South Asia.'),
('about', 'hero', 'para4', 'The magazine is open-access. Authors retain copyright. Readers pay nothing. Members and institutional partners support the work that makes the magazine possible.'),
('about', 'vision', 'heading', 'Vision'),
('about', 'vision', 'body', 'A connected community of researchers, extension workers and farmers in which every agricultural breakthrough — from a smallholder''s adaptation to a national soil-carbon programme — finds an audience large enough to matter.'),
('about', 'mission', 'heading', 'Mission'),
('about', 'mission', 'items', '["Disseminate practical, science-based agricultural knowledge to farmers, extension workers, students and policy-makers.","Highlight indigenous innovations, traditional wisdom and locally adapted practices alongside contemporary research.","Bridge the gap between scientific research and on-farm application through accessible popular articles.","Support young scientists, research scholars and field practitioners with a credible publishing platform.","Encourage interdisciplinary work across agronomy, horticulture, animal sciences, extension and allied fields.","Strengthen India''s rural development ecosystem by amplifying voices from KVKs, ICAR institutes and state universities."]'),
('about', 'particulars', 'items', '[["Title","The Agriculture Popular Article Magazine"],["Frequency","Monthly"],["Subject","Agriculture"],["Language","English / Hindi"],["Format","Online"],["Starting Year","2026"],["Publisher","Ram Mangalam Agri – Rural Development Foundation (RADF)"],["Chief Editor","Dr. Dileep Kumar"],["Address","ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India"],["Mobile","+91 95091 64410"],["Email","dkdkdangi@gmail.com"]]'),

-- Contact
('contact', 'office', 'chief_editor', 'Dr. Dileep Kumar Dangi'),
('contact', 'office', 'chief_editor_title', 'Senior Scientist (Agriculture Extension)'),
('contact', 'office', 'email', 'dkdkdangi@gmail.com'),
('contact', 'office', 'phone', '+91 9509164410'),
('contact', 'office', 'address', 'ICAR-RRS-CAZRI, Jaisalmer 345001, Rajasthan, India'),
('contact', 'office', 'hours', 'Mon–Sat · 08:00 to 20:00 IST'),
('contact', 'office', 'turnaround', 'Editorial decisions are typically returned within 21 days.'),
('contact', 'publisher', 'name', 'Ram Mangalam Agri – Rural Development Foundation'),
('contact', 'publisher', 'address', 'Ajmer Road, Hirapura, Jaipur, India'),
('contact', 'advertise', 'heading', 'Reach the agriculture community'),
('contact', 'advertise', 'body', 'Agro-based industrial and other allied sectors can advertise in The Agriculture Popular Article Magazine. Write to us for placements, rate cards and partnership enquiries.'),

-- Editorial Board
('editorial_board', 'hero', 'tagline', 'The minds behind the magazine.'),
('editorial_board', 'hero', 'subtitle', 'Editors, advisors and peer reviewers drawn from ICAR institutes, state agricultural universities and partner laboratories across India, Nepal, Sri Lanka and the United States.'),
('editorial_board', 'editors', 'items', '[{"name":"Dr. Dileep Kumar","role":"Editor-in-Chief","title":"Founder & Managing Editor · Senior Scientist (Agriculture Extension)","inst":"ICAR–RRS–CAZRI, Jaisalmer · S.K.R.A.U. Bikaner","country":"India"},{"name":"Dr. Dilip Kumar Jha","role":"International Editor","title":"Faculty","inst":"Agriculture and Forestry University (AFU)","country":"Nepal"},{"name":"Dr. Punya Prasad Regmi","role":"International Editor","title":"Vice-Chancellor","inst":"Agriculture and Forestry University (AFU)","country":"Nepal"},{"name":"Dr. Chamindri Withranga","role":"International Editor","title":"Faculty","inst":"University of Colombo","country":"Sri Lanka"},{"name":"Talata Colombo","role":"International Editor","inst":"Sri Lanka","country":"Sri Lanka"},{"name":"Dr. R. S. Mehta","role":"Associate Editor","title":"Principal Scientist","inst":"ICAR–CAZRI Regional Research Station, Jaisalmer"},{"name":"Dr. Deepak Chaturvedi","role":"Associate Editor","inst":"ICAR–CAZRI, Jodhpur"},{"name":"Dr. Charu Sharma","role":"Associate Editor","title":"Subject Matter Specialist","inst":"Krishi Vigyan Kendra, Jaisalmer"},{"name":"Dr. Manish Kanwat","role":"Associate Editor","inst":"ICAR–CAZRI Regional Research Station, Bhuj"},{"name":"Dr. B. L. Manjunatha","role":"Associate Editor","inst":"ICAR–CAZRI, Jodhpur"},{"name":"Akansha Joshi","role":"Associate Editor","inst":"G.B. Pant University of Agriculture & Technology, Pantnagar"},{"name":"Dr. Rajiv Baliram Kale","role":"Associate Editor","inst":"ICAR–Directorate of Onion and Garlic Research, Pune"},{"name":"Dr. Nanda Kumar S.","role":"Associate Editor","inst":"ICAR"},{"name":"Dr. MotiLal Meena","role":"Associate Editor","inst":"Krishi Vigyan Kendra, Pali"},{"name":"Dr. Letngam Touthang","role":"Associate Editor","inst":"ICAR"},{"name":"Dr. Dasharath Prasad","role":"Associate Editor","inst":"Krishi Vigyan Kendra, S.K.R.A.U."}]'),
('editorial_board', 'advisory', 'items', '[{"name":"Dr. Pema Gyamtsho","inst":"ICIMOD"},{"name":"Dr. Karim Maredia","inst":"Michigan State University","country":"USA"},{"name":"Dr. P. Das","inst":"ICAR"},{"name":"Dr. Rajbir Singh","inst":"ICAR"},{"name":"Dr. B. N. Tripathi","inst":"SKUAST–Jammu"},{"name":"Dr. Nazir Ahmad Ganai","inst":"SKUAST–Srinagar"},{"name":"Dr. K. D. Kokate","inst":"Former DDG (Agricultural Extension), ICAR"},{"name":"Dr. Arjun Kumar Shrestha","inst":"Agriculture and Forestry University","country":"Nepal"},{"name":"Dr. Inderjeet Singh","inst":"Bihar Animal Sciences University, Patna"},{"name":"Dr. P. K. Ghosh","inst":"Visva-Bharati"},{"name":"Dr. S. K. Dwivedi","inst":"DRDO"},{"name":"Prof. S. V. Reddy","inst":"PRDIS"},{"name":"Dr. V. V. Sadamate","inst":"Former Adviser (Agriculture), Planning Commission"},{"name":"Dr. Tirtha Raj Regmi","inst":"Heifer International","country":"Nepal"},{"name":"Dr. Suresh Chandra Babu","inst":"IFPRI"},{"name":"Shiva Sundar Shrestha","inst":"Nepal Agroforestry Foundation","country":"Nepal"},{"name":"Dr. Ramjee P. Ghimire","inst":"Michigan State University","country":"USA"}]'),
('editorial_board', 'reviewers', 'items', '[{"name":"Atul Galav","inst":""},{"name":"Dr. Babaloo Sharma","inst":""},{"name":"Dr. Gajendra Singh","inst":""},{"name":"Dr. Anil Patidar","inst":""},{"name":"Gorav Singh","inst":""},{"name":"Dr. Ajaya Thakan","inst":""},{"name":"Lalit Godara","inst":""},{"name":"Roshan Lal Meena","inst":""},{"name":"Balveer","inst":""},{"name":"Himanshu","inst":""},{"name":"Rudraksh","inst":""},{"name":"Rahul","inst":""},{"name":"Dr. Bhagwan Singh","inst":""},{"name":"Dr. Ramniwas","inst":"KVK Pokaran"},{"name":"Dr. Ramniwas","inst":"ICAR–NRC on Pomegranate"},{"name":"Dr. S. C. Meena","inst":""},{"name":"Dr. Permendra","inst":""},{"name":"Dr. Hardev","inst":""},{"name":"Dr. Rajkumar Yogi","inst":""},{"name":"Dr. Sheran K.","inst":""},{"name":"Dr. Ashok Yadav","inst":""},{"name":"Dr. Sativeer Dangi","inst":""},{"name":"Dr. Leela Ram Sandhu","inst":""},{"name":"Dr. Arvind Jhajharia","inst":""},{"name":"Dr. Sonalika Mahajan","inst":""},{"name":"Dr. Paumpi Paul","inst":""},{"name":"Viklas Chandra Gautam","inst":""}]'),

-- Membership
('membership', 'hero', 'heading', 'Choose the plan that fits your work.'),
('membership', 'hero', 'subtext', 'Annual members publish for free. Non-member authors and non-member co-authors pay a small per-article publication fee. Membership directly supports independent agricultural publishing in India.'),
('membership', 'plans', 'items', '[{"id":"single","name":"Single Article","price":"₹200","period":"per article","validity":"1 article","features":["Peer review","Online publication","Author certificate","Indexed listing"],"featured":false},{"id":"annual","name":"Annual Membership","price":"₹500","period":"per year","validity":"Up to 8 articles · 12 months","features":["Publish up to 8 articles free","Priority review queue","Member ID & certificate","Listed on author directory"],"featured":true},{"id":"lifetime","name":"Lifetime Membership","price":"₹2,000","period":"one-time","validity":"5 years","features":["Unlimited submissions for 5 years","Editorial consultations","Member ID & certificate","Lifetime member directory"],"featured":false},{"id":"institute","name":"Institute / Library","price":"₹5,000","period":"one-time","validity":"5 years","features":["Institutional authorship support","Branded archive page","Discounted author fees for faculty","Quarterly impact reports"],"featured":false}]'),
('membership', 'payment', 'bank_holder', 'Dileep Kumar'),
('membership', 'payment', 'bank_account', '32971942417'),
('membership', 'payment', 'bank_name', 'State Bank of India'),
('membership', 'payment', 'bank_ifsc', 'SBIN0003877'),
('membership', 'payment', 'bank_branch', 'SBI Main Jaisalmer'),
('membership', 'payment', 'upi_number', '+91 9509164410'),
('membership', 'payment', 'contact_email', 'dkdkdangi@gmail.com'),

-- Guidelines
('guidelines', 'hero', 'intro', 'The Agriculture Popular Article Magazine welcomes original popular-science articles from researchers, extension officers, students and progressive farmers. Please read the guidelines below carefully before preparing your manuscript.'),
('guidelines', 'process', 'steps', '["Submit","Initial Screening","Peer Review","Revision","Approval","Publish"]'),
('guidelines', 'process', 'description', 'Every manuscript is screened by the editorial office, then sent to at least one subject-matter reviewer. Authors typically receive a decision within 21 days. Accepted articles are scheduled into the next available monthly issue.'),
('guidelines', 'membership', 'body', 'Annual membership of the magazine is required for all corresponding authors. On enrolment, members receive a unique Member ID and a digital membership certificate, and may submit up to eight articles in the 12-month validity period at no additional charge.'),
('guidelines', 'fees', 'items', '[{"who":"Annual Members","fee":"Free","note":"Up to 8 articles in 12 months"},{"who":"Non-member Authors","fee":"₹200 / article","note":"Single article membership"},{"who":"Non-member Co-authors","fee":"₹100 / co-author","note":"Per additional author"}]'),
('guidelines', 'requirements', 'items', '["Manuscripts must be submitted in Microsoft Word format (.doc / .docx). Other formats will be rejected at screening.","Article length: 2–4 pages (approximately 1,500–3,000 words).","Each article must contain a clear introduction and a conclusion.","Submissions for the next monthly issue close on the 25th of every month.","Submit online through the portal, or e-mail your file to dkdkdangi@gmail.com."]'),
('guidelines', 'formatting', 'items', '[{"l":"Title","v":"Times New Roman 14 pt · Bold · Centered"},{"l":"Author details","v":"TNR 12 pt — name, designation, affiliation"},{"l":"Corresponding email","v":"TNR 12 pt · Bold"},{"l":"Headings","v":"TNR 14 pt · Bold"},{"l":"Sub-headings","v":"TNR 12 pt · Bold"},{"l":"Body text","v":"TNR 12 pt · Justified · 1.5 line spacing"},{"l":"Units & abbreviations","v":"SI units · IUB / IUPAC nomenclature"},{"l":"File format","v":"Microsoft Word (.doc / .docx) only"}]'),
('guidelines', 'originality', 'items', '["Submissions must be the authors'' own original work and not under review elsewhere.","Plagiarism is screened on every submission; manuscripts above 15% similarity are returned.","Proper attribution must be given to all data, figures and ideas borrowed from other sources.","Authors retain copyright; articles are released under CC BY 4.0."]'),
('guidelines', 'publication', 'body', 'Published articles are made available as a downloadable PDF on the magazine''s website and are also e-mailed directly to the corresponding author. Each author receives a digital publication certificate for the article.'),

-- Startup Spotlight
('startup_spotlight', 'hero', 'heading', 'The companies rebuilding agriculture from the ground up.'),
('startup_spotlight', 'startups', 'items', '[{"name":"Cropwise AI","founder":"Neel Patel","innovation":"Satellite-driven yield forecasting for smallholders."},{"name":"Mycro Soil","founder":"Lara Diop","innovation":"Mycorrhizal inoculants restoring degraded farmland."},{"name":"Aquaponix","founder":"James Park","innovation":"Modular aquaponics units for peri-urban food production."},{"name":"Beewise India","founder":"Tara Mehta","innovation":"Sensor-equipped hives for precision apiculture."}]')

ON CONFLICT (page, section, key) DO UPDATE 
SET value = EXCLUDED.value;
