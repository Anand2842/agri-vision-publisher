import logo from "@/assets/logo.png";
import heroTractor from "@/assets/hero-tractor.jpg";
import heroPaddy from "@/assets/hero-paddy.jpg";
import heroWheat from "@/assets/hero-wheat.jpg";

import dileepKumar from "@/assets/board/dileep-kumar.jpg";
import rsMehta from "@/assets/board/rs-mehta.jpg";
import deepakChaturvedi from "@/assets/board/deepak-chaturvedi.jpg";
import charuSharma from "@/assets/board/charu-sharma.jpg";
import manishKanwat from "@/assets/board/manish-kanwat.jpg";
import blManjunatha from "@/assets/board/bl-manjunatha.jpg";
import akanshaJoshi from "@/assets/board/akansha-joshi.jpg";
import rajivKale from "@/assets/board/rajiv-kale.jpg";
import nandaKumar from "@/assets/board/nanda-kumar.jpg";
import motilalMeena from "@/assets/board/motilal-meena.jpg";
import letngamTouthang from "@/assets/board/letngam-touthang.jpg";
import dasharathPrasad from "@/assets/board/dasharath-prasad.jpg";

export type SiteContentKeys = {
  header: {
    topbar: "phone" | "email";
    branding: "tagline" | "logo_url" | "title_line1" | "title_line2";
    cta: "special_issue_label";
    navigation: "items";
  };
  footer: {
    branding: "description" | "tagwords";
    contact: "name" | "address" | "phone" | "email";
    legal: "publisher_name" | "eissn" | "pissn";
    navigation: "columns";
  };
  home: {
    hero: "headline" | "slide_images";
    intro: "heading" | "body";
    vision_mission: "heading" | "body";
    testimonials: "heading" | "items";
    readership: "heading" | "items";
    partners: "heading" | "items";
    banner: "deadline_date";
  };
  about: {
    hero: "tagline" | "para1" | "para2" | "para3" | "para4";
    vision: "heading" | "body";
    mission: "heading" | "items";
    particulars: "items";
  };
  contact: {
    office: "chief_editor" | "chief_editor_title" | "email" | "phone" | "address" | "hours" | "turnaround";
    publisher: "name" | "address";
    advertise: "heading" | "body";
  };
  advertise: {
    hero: "heading" | "body";
    benefits: "items";
    audience: "stats";
    sponsorship: "packages";
  };
  editorial_board: {
    hero: "tagline" | "subtitle" | "eyebrow";
    editors: "items";
    advisory: "items" | "description";
    reviewers: "items" | "description";
  };
  membership: {
    hero: "heading" | "subtext";
    plans: "items";
    payment: "bank_holder" | "bank_account" | "bank_name" | "bank_ifsc" | "bank_branch" | "upi_number" | "upi_qr_url" | "contact_email" | "heading" | "body";
  };
  guidelines: {
    hero: "heading" | "intro";
    process: "steps" | "description";
    membership: "body";
    fees: "items";
    requirements: "items";
    formatting: "items";
    originality: "items";
    publication: "body";
  };
  startup_spotlight: {
    hero: "heading";
    startups: "items";
  };
  seo: {
    home: "title" | "description";
    about: "title" | "description";
    contact: "title" | "description";
    editorial_board: "title" | "description";
    membership: "title" | "description";
    guidelines: "title" | "description";
    search: "title" | "description";
    archives: "title" | "description";
    current_issue: "title" | "description";
    startup_spotlight: "title" | "description";
    publication_ethics: "title" | "description";
    advertise: "title" | "description";
  };
  archives: {
    hero: "headline" | "subtitle";
  };
  search_page: {
    hero: "headline";
  };
  current_issue: {
    call_for_papers: "heading" | "subheading" | "body";
    editorial: "description";
  };
  publication_ethics: {
    hero: "eyebrow" | "title" | "body";
    originality: "title" | "body" | "points";
    authorship: "title" | "body";
    peer_review: "title" | "body";
    conflicts: "title" | "body";
    corrections: "title" | "body";
    open_access: "title" | "body";
    reporting: "title" | "body";
  };
  certificate: {
    branding: "magazine_name" | "publisher" | "chief_editor" | "chief_editor_title" | "chief_editor_signature" | "publisher_title" | "publisher_institution" | "publisher_signature" | "seal_text" | "seal_text_membership";
  };
  faq: {
    hero: "eyebrow" | "title" | "intro";
    main: "items";
    cta: "heading" | "body";
  };
};

export const SITE_CONTENT_DEFAULTS: Record<string, Record<string, Record<string, string>>> = {
  header: {
    topbar: { phone: "+91 9509164410", email: "dkdkdangi@gmail.com" },
    branding: { tagline: "Knowledge · Innovation · Sustainability", logo_url: logo, title_line1: "The Agriculture", title_line2: "Popular Article Magazine" },
    cta: { special_issue_label: "Special Issue" },
    navigation: {
      items: JSON.stringify([
        { label: "Current Issue", href: "/current-issue" },
        { label: "Archives", href: "/archives" },
        { label: "Submission Guidelines", href: "/submission-guidelines" },
        { label: "Membership", href: "/membership" },
        { label: "About", href: "/about", children: [
            { label: "About the Magazine", href: "/about" },
            { label: "Editorial Board", href: "/editorial-board" },
            { label: "Startup Spotlight", href: "/startup-spotlight" },
            { label: "Contact Office", href: "/contact" }
          ]
        }
      ]),
    },
  },
  footer: {
    branding: {
      description: "A peer-reviewed, open-access monthly magazine advancing agriculture through knowledge, innovation, sustainability and community.",
      tagwords: '["Knowledge", "Innovation", "Sustainability", "Community"]',
    },
    contact: {
      name: "Dr. Dileep Kumar",
      address: "ICAR–RRS–CAZRI, Jaisalmer 345001",
      phone: "+91 9509164410",
      email: "dkdkdangi@gmail.com",
    },
    legal: { publisher_name: "Ram Mangalam Agri – Rural Development Foundation", eissn: "3107-4521", pissn: "3107-4513" },
    navigation: {
      columns: JSON.stringify([
        {
          title: "Magazine",
          links: [
            { label: "Current Issue", href: "/current-issue" },
            { label: "Archives", href: "/archives" },
            { label: "About Us", href: "/about" },
            { label: "Editorial Board", href: "/editorial-board" },
          ],
        },
        {
          title: "Authors",
          links: [
            { label: "Submit Article", href: "/auth" },
            { label: "Author Guidelines", href: "/submission-guidelines" },
            { label: "Membership & Fees", href: "/membership" },
          ],
        },
      ]),
    },
  },
  home: {
    hero: {
      headline: "Welcome to The Agriculture Popular Article Magazine",
      slide_images: JSON.stringify([
        { img: heroTractor, alt: "Tractor plowing a field" },
        { img: heroPaddy, alt: "Terraced rice paddies" },
        { img: heroWheat, alt: "Golden wheat at sunset" },
      ]),
    },
    intro: {
      heading: "The Agriculture Popular Article Magazine",
      body: "The Agriculture Popular Article Magazine is a peer-reviewed, open access monthly magazine, initiated for the purpose of providing information about novel innovations and techniques developed in agriculture and its allied sectors. Other than agriculture, it also focuses on the environmental aspects as it is of greater concern in the present scenario and needs to be addressed by agriculturists. This magazine gives a platform to researchers, scientists, students, innovative and progressive farmers and any other members of the scientific community to share their innovative ideas and to spread awareness in the agriculture sector by publishing articles addressing current and future needs. The Agriculture Popular Article Magazine also aims at providing a platform to different agri and agri-tech start-ups to showcase their success stories, business ideas and plans, thereby enticing a sense of innovativeness among brilliant minds throughout the world.",
    },
    vision_mission: {
      heading: "Vision and Mission",
      body: "Informative, innovative and content-rich communication of information is most needed and is of great priority. A broad spectrum of advancement of technologies and other possibilities in the farming sector has become very important; consequently, The Agriculture Popular Article Magazine helps in disseminating such information to the farming community as well as other agencies, institutes and organisations to provide them with the latest developments in the field of agriculture and environmental studies. The magazine is appealing due to its unique way of presenting information, which further helps in providing a platform for comprehensive data sharing regarding different aspects of agriculture including its policies, technologies, economics and other scientific advances.",
    },
    testimonials: {
      heading: "Our Testimonials",
      items: '[{"quote":"A genuinely indispensable monthly read — the kind of magazine that bridges the lab and the field with rare clarity. I look forward to every issue.","name":"Andy Guscott","role":"Researcher, IRRI"},{"quote":"The Agriculture Popular Article Magazine has become required reading in our extension office. Practical, peer-reviewed, beautifully produced.","name":"Kirstin W. Everton","role":"Extension Officer, Cornell"}]',
    },
    readership: {
      heading: "Readership",
      items: '[{"label":"Readers","value":50000},{"label":"Farmers","value":30000},{"label":"Academicians","value":55000},{"label":"Faculty","value":3700},{"label":"International Visitors","value":2500}]',
    },
    partners: {
      heading: "Our Partners",
      items: JSON.stringify([
        { name: "AgriNext", logo_url: "" },
        { name: "FAO", logo_url: "" },
        { name: "ICAR", logo_url: "" },
        { name: "CGIAR", logo_url: "" },
        { name: "Wageningen UR", logo_url: "" },
        { name: "Indus Agritech", logo_url: "" },
        { name: "EMBRAPA", logo_url: "" },
        { name: "TNAU", logo_url: "" },
      ]),
    },
    banner: {
      deadline_date: "25th of every month",
    },
  },
  about: {
    hero: {
      tagline: "A peer-reviewed magazine for India's agricultural community.",
      para1: "The Agriculture Popular Article Magazine is a monthly, online, peer-reviewed publication dedicated to advancing Indian agriculture through knowledge, innovation, sustainability and community. It is published by the Ram Mangalam Agri – Rural Development Foundation (RADF) and edited by Dr. Dileep Kumar, Senior Scientist (Agriculture Extension) at ICAR–RRS–CAZRI, Jaisalmer.",
      para2: "We sit between the academic journal and the trade magazine: rigorous enough for research, accessible enough for the field officer, the KVK scientist and the progressive farmer. Every article is reviewed by qualified specialists before it reaches our readers.",
      para3: "Our pages cover agronomy, horticulture, soil and water management, animal sciences, agri-business, extension and allied disciplines — with a particular focus on the arid and semi-arid systems of western India and on the smallholder economies of South Asia.",
      para4: "The magazine is open-access. Copyright of accepted articles is transferred to the publisher upon acceptance. Readers pay nothing. Members and institutional partners support the work that makes the magazine possible.",
    },
    vision: {
      heading: "Vision",
      body: "A connected community of researchers, extension workers and farmers in which every agricultural breakthrough — from a smallholder's adaptation to a national soil-carbon programme — finds an audience large enough to matter.",
    },
    mission: {
      heading: "Mission",
      items: '["Disseminate practical, science-based agricultural knowledge to farmers, extension workers, students and policy-makers.","Highlight indigenous innovations, traditional wisdom and locally adapted practices alongside contemporary research.","Bridge the gap between scientific research and on-farm application through accessible popular articles.","Support young scientists, research scholars and field practitioners with a credible publishing platform.","Encourage interdisciplinary work across agronomy, horticulture, animal sciences, extension and allied fields.","Strengthen India\'s rural development ecosystem by amplifying voices from KVKs, ICAR institutes and state universities."]',
    },
    particulars: {
      items: '[["Title","The Agriculture Popular Article Magazine"],["E-ISSN","3107-4521"],["P-ISSN","3107-4513"],["Frequency","Monthly"],["Subject","Agriculture"],["Language","English / Hindi"],["Format","Online"],["Starting Year","2026"],["Publisher","Ram Mangalam Agri – Rural Development Foundation (RADF)"],["Chief Editor","Dr. Dileep Kumar"],["Address","ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India"],["Mobile","+91 95091 64410"],["Email","dkdkdangi@gmail.com"]]',
    },
  },
  contact: {
    office: {
      chief_editor: "Dr. Dileep Kumar Dangi",
      chief_editor_title: "Senior Scientist (Agriculture Extension)",
      email: "dkdkdangi@gmail.com",
      phone: "+91 9509164410",
      address: "ICAR-RRS-CAZRI, Jaisalmer 345001, Rajasthan, India",
      hours: "Mon–Sat · 08:00 to 20:00 IST",
      turnaround: "Editorial decisions are typically returned within 21 days.",
    },
    publisher: {
      name: "Ram Mangalam Agri – Rural Development Foundation",
      address: "Ajmer Road, Hirapura, Jaipur, India",
    },
    advertise: {
      heading: "Reach the agriculture community",
      body: "Agro-based industrial and other allied sectors can advertise in The Agriculture Popular Article Magazine. Write to us for placements, rate cards and partnership enquiries.",
    },
  },
  advertise: {
    hero: {
      heading: "Reach the agriculture community",
      body: "Agro-based industrial and other allied sectors can advertise in The Agriculture Popular Article Magazine. Write to us for placements, rate cards and partnership enquiries.",
    },
    benefits: {
      items: JSON.stringify([
        { title: "Targeted Audience", description: "Direct connection with researchers, KVK scientists, faculty members, and progressive farmers.", icon: "Users" },
        { title: "Extensive Reach", description: "Over 50,000+ active monthly readers and growing agricultural community network.", icon: "BarChart3" },
        { title: "International Visibility", description: "Global readership across India, Nepal, Sri Lanka, and international agricultural research bodies.", icon: "Globe2" },
        { title: "Credible Alignment", description: "Associate your brand with an open-access, peer-reviewed scientific and rural advancement platform.", icon: "Award" }
      ]),
    },
    audience: {
      stats: JSON.stringify([
        { value: "50,000+", label: "Monthly Readers" },
        { value: "30,000+", label: "Active Farmers" },
        { value: "55,000+", label: "Academicians" },
        { value: "2,500+", label: "International Visitors" }
      ]),
    },
    sponsorship: {
      packages: JSON.stringify([
        { name: "Issue Sponsor", price: "Enquire for Price", description: "Premium placement on the cover and table of contents pages of our monthly issue.", features: ["Full-page back cover advertisement", "Editorial board acknowledgement", "Logo in Monthly Newsletter", "Hyperlink to company website"], cta: "Contact Editor", highlighted: true },
        { name: "Startup Spotlight Sponsor", price: "Special Startup Rate", description: "Specifically designed for young agri-tech startups looking to showcase innovations.", features: ["Feature story in Startup Spotlight section", "Half-page display advertisement", "Social media announcement", "Direct inquiry lead forwarding"], cta: "Enquire Now", highlighted: false },
        { name: "Standard Banner Placement", price: "Flexible Monthly Rates", description: "Standard slots across our dynamic online article pages and categories.", features: ["Sidebar banner on article view pages", "Bottom banner on home page", "Rotational priority slots", "Basic CTR performance analytics"], cta: "Request Rate Card", highlighted: false }
      ]),
    },
  },
  editorial_board: {
    hero: {
      eyebrow: "Masthead · Volume 1",
      tagline: "The minds behind the magazine.",
      subtitle: "Editors, advisors and peer reviewers drawn from ICAR institutes, state agricultural universities and partner laboratories across India, Nepal, Sri Lanka and the United States.",
    },
    editors: {
      items: JSON.stringify([
        {
          name: "Dr. Dileep Kumar",
          role: "Editor-in-Chief",
          title: "Founder & Managing Editor · Senior Scientist (Agriculture Extension)",
          inst: "ICAR–RRS–CAZRI, Jaisalmer · S.K.R.A.U. Bikaner",
          country: "India",
          photo_url: dileepKumar,
        },
        {
          name: "Dr. Dilip Kumar Jha",
          role: "International Editor",
          title: "Faculty",
          inst: "Agriculture and Forestry University (AFU)",
          country: "Nepal",
          photo_url: "",
        },
        {
          name: "Dr. Punya Prasad Regmi",
          role: "International Editor",
          title: "Vice-Chancellor",
          inst: "Agriculture and Forestry University (AFU)",
          country: "Nepal",
          photo_url: "",
        },
        {
          name: "Dr. Chamindri Withranga",
          role: "International Editor",
          title: "Faculty",
          inst: "University of Colombo",
          country: "Sri Lanka",
          photo_url: "",
        },
        { name: "Talata Colombo", role: "International Editor", inst: "Sri Lanka", country: "Sri Lanka", photo_url: "" },
        {
          name: "Dr. R. S. Mehta",
          role: "Associate Editor",
          title: "Principal Scientist",
          inst: "ICAR–CAZRI Regional Research Station, Jaisalmer",
          country: "India",
          photo_url: rsMehta,
        },
        {
          name: "Dr. Deepak Chaturvedi",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR–CAZRI, Jodhpur",
          country: "India",
          photo_url: deepakChaturvedi,
        },
        {
          name: "Dr. Charu Sharma",
          role: "Associate Editor",
          title: "Subject Matter Specialist",
          inst: "Krishi Vigyan Kendra, Jaisalmer",
          country: "India",
          photo_url: charuSharma,
        },
        {
          name: "Dr. Manish Kanwat",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR–CAZRI Regional Research Station, Bhuj",
          country: "India",
          photo_url: manishKanwat,
        },
        {
          name: "Dr. B. L. Manjunatha",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR–CAZRI, Jodhpur",
          country: "India",
          photo_url: blManjunatha,
        },
        {
          name: "Akansha Joshi",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "G.B. Pant University of Agriculture & Technology, Pantnagar",
          country: "India",
          photo_url: akanshaJoshi,
        },
        {
          name: "Dr. Rajiv Baliram Kale",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR–Directorate of Onion and Garlic Research, Pune",
          country: "India",
          photo_url: rajivKale,
        },
        {
          name: "Dr. Nanda Kumar S.",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR",
          country: "India",
          photo_url: nandaKumar,
        },
        {
          name: "Dr. MotiLal Meena",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "Krishi Vigyan Kendra, Pali",
          country: "India",
          photo_url: motilalMeena,
        },
        {
          name: "Dr. Letngam Touthang",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "ICAR",
          country: "India",
          photo_url: letngamTouthang,
        },
        {
          name: "Dr. Dasharath Prasad",
          role: "Associate Editor",
          title: "Associate Editor",
          inst: "Krishi Vigyan Kendra, S.K.R.A.U.",
          country: "India",
          photo_url: dasharathPrasad,
        },
      ]),
    },
    advisory: {
      items: '[{"name":"Dr. Pema Gyamtsho","inst":"ICIMOD"},{"name":"Dr. Karim Maredia","inst":"Michigan State University","country":"USA"},{"name":"Dr. P. Das","inst":"ICAR"},{"name":"Dr. Rajbir Singh","inst":"ICAR"},{"name":"Dr. B. N. Tripathi","inst":"SKUAST–Jammu"},{"name":"Dr. Nazir Ahmad Ganai","inst":"SKUAST–Srinagar"},{"name":"Dr. K. D. Kokate","inst":"Former DDG (Agricultural Extension), ICAR"},{"name":"Dr. Arjun Kumar Shrestha","inst":"Agriculture and Forestry University","country":"Nepal"},{"name":"Dr. Inderjeet Singh","inst":"Bihar Animal Sciences University, Patna"},{"name":"Dr. P. K. Ghosh","inst":"Visva-Bharati"},{"name":"Dr. S. K. Dwivedi","inst":"DRDO"},{"name":"Prof. S. V. Reddy","inst":"PRDIS"},{"name":"Dr. V. V. Sadamate","inst":"Former Adviser (Agriculture), Planning Commission"},{"name":"Dr. Tirtha Raj Regmi","inst":"Heifer International","country":"Nepal"},{"name":"Dr. Suresh Chandra Babu","inst":"IFPRI"},{"name":"Shiva Sundar Shrestha","inst":"Nepal Agroforestry Foundation","country":"Nepal"},{"name":"Dr. Ramjee P. Ghimire","inst":"Michigan State University","country":"USA"}]',
      description: "Senior scientists, policy advisors and institutional leaders who guide the magazine's editorial direction and international outreach.",
    },
    reviewers: {
      items: '[{"name":"Atul Galav","inst":""},{"name":"Dr. Babaloo Sharma","inst":""},{"name":"Dr. Gajendra Singh","inst":""},{"name":"Dr. Anil Patidar","inst":""},{"name":"Gorav Singh","inst":""},{"name":"Dr. Ajaya Thakan","inst":""},{"name":"Lalit Godara","inst":""},{"name":"Roshan Lal Meena","inst":""},{"name":"Balveer","inst":""},{"name":"Himanshu","inst":""},{"name":"Rudraksh","inst":""},{"name":"Rahul","inst":""},{"name":"Dr. Bhagwan Singh","inst":""},{"name":"Dr. Ramniwas","inst":"KVK Pokaran"},{"name":"Dr. Ramniwas","inst":"ICAR–NRC on Pomegranate"},{"name":"Dr. S. C. Meena","inst":""},{"name":"Dr. Permendra","inst":""},{"name":"Dr. Hardev","inst":""},{"name":"Dr. Rajkumar Yogi","inst":""},{"name":"Dr. Sheran K.","inst":""},{"name":"Dr. Ashok Yadav","inst":""},{"name":"Dr. Sativeer Dangi","inst":""},{"name":"Dr. Leela Ram Sandhu","inst":""},{"name":"Dr. Arvind Jhajharia","inst":""},{"name":"Dr. Sonalika Mahajan","inst":""},{"name":"Dr. Paumpi Paul","inst":""},{"name":"Viklas Chandra Gautam","inst":""}]',
      description: "Scholars and practitioners who evaluate every submission for scientific rigour, originality and clarity before publication.",
    },
  },
  membership: {
    hero: {
      heading: "Choose the plan that fits your work.",
      subtext: "Annual members publish for free. Non-member authors and non-member co-authors pay a small per-article publication fee. Membership directly supports independent agricultural publishing in India.",
    },
    plans: {
      items: '[{"id":"single","name":"Single Article","price":"₹200","amount":200,"period":"per article","validity":"1 article","features":["Peer review","Online publication","Author certificate","Indexed listing"],"featured":false},{"id":"annual","name":"Annual Membership","price":"₹500","amount":500,"period":"per year","validity":"Up to 8 articles · 12 months","features":["Publish up to 8 articles free","Priority review queue","Member ID & certificate","Listed on author directory"],"featured":true},{"id":"lifetime","name":"Lifetime Membership","price":"₹2,000","amount":2000,"period":"one-time","validity":"5 years","features":["Unlimited submissions for 5 years","Editorial consultations","Member ID & certificate","Lifetime member directory"],"featured":false},{"id":"institute","name":"Institute / Library","price":"₹5,000","amount":5000,"period":"one-time","validity":"5 years","features":["Institutional authorship support","Branded archive page","Discounted author fees for faculty","Quarterly impact reports"],"featured":false}]',
    },
    payment: {
      bank_holder: "Dileep Kumar",
      bank_account: "32971942417",
      bank_name: "State Bank of India",
      bank_ifsc: "SBIN0003877",
      bank_branch: "SBI Main Jaisalmer",
      upi_number: "+91 9509164410",
      upi_qr_url: "",
      contact_email: "dkdkdangi@gmail.com",
      heading: "Payment Details",
      body: "We support direct bank transfers (NEFT/IMPS) and UPI mobile payments. Please find the credentials below.",
    },
  },
  guidelines: {
    hero: {
      heading: "Author Guidelines",
      intro: "The Agriculture Popular Article Magazine welcomes original popular-science articles from researchers, extension officers, students and progressive farmers. Please read the guidelines below carefully before preparing your manuscript.",
    },
    process: {
      steps: '["Submit","Initial Screening","Peer Review","Revision","Approval","Publish"]',
      description: "Every manuscript is screened by the editorial office, then sent to at least one subject-matter reviewer. Authors typically receive a decision within 21 days. Accepted articles are scheduled into the next available monthly issue.",
    },
    membership: {
      body: "Annual membership of the magazine is required for all corresponding authors. On enrolment, members receive a unique Member ID and a digital membership certificate, and may submit up to eight articles in the 12-month validity period at no additional charge.",
    },
    fees: {
      items: '[{"who":"Annual Members","fee":"Free","note":"Up to 8 articles in 12 months"},{"who":"Non-member Authors","fee":"₹200 / article","note":"Single article membership"},{"who":"Non-member Co-authors","fee":"₹100 / co-author","note":"Per additional author"}]',
    },
    requirements: {
      items: '["Manuscripts must be submitted in Microsoft Word format (.doc / .docx). Other formats will be rejected at screening.","Article length: 2–4 pages (approximately 1,500–3,000 words).","Each article must contain a clear introduction and a conclusion.","Submissions for the next monthly issue close on the 25th of every month.","Submit online through the portal, or e-mail your file to dkdkdangi@gmail.com."]',
    },
    formatting: {
      items: '[{"l":"Title","v":"Times New Roman 14 pt · Bold · Centered"},{"l":"Author details","v":"TNR 12 pt — name, designation, affiliation"},{"l":"Corresponding email","v":"TNR 12 pt · Bold"},{"l":"Headings","v":"TNR 14 pt · Bold"},{"l":"Sub-headings","v":"TNR 12 pt · Bold"},{"l":"Body text","v":"TNR 12 pt · Justified · 1.5 line spacing"},{"l":"Units & abbreviations","v":"SI units · IUB / IUPAC nomenclature"},{"l":"File format","v":"Microsoft Word (.doc / .docx) only"}]',
    },
    originality: {
      items: '["Submissions must be the authors\' own original work and not under review elsewhere.","Plagiarism is screened on every submission; manuscripts above 15% similarity are returned.","Proper attribution must be given to all data, figures and ideas borrowed from other sources.","Copyright of the accepted article is transferred to the publisher (Ram Mangalam Agri–Rural Development Foundation) upon acceptance."]',
    },
    publication: {
      body: "Published articles are made available as a downloadable PDF on the magazine's website and are also e-mailed directly to the corresponding author. Each author receives a digital publication certificate for the article.",
    },
  },
  startup_spotlight: {
    hero: {
      heading: "The companies rebuilding agriculture from the ground up.",
    },
    startups: {
      items: '[{"name":"Cropwise AI","founder":"Neel Patel","innovation":"Satellite-driven yield forecasting for smallholders.","logo_url":""},{"name":"Mycro Soil","founder":"Lara Diop","innovation":"Mycorrhizal inoculants restoring degraded farmland.","logo_url":""},{"name":"Aquaponix","founder":"James Park","innovation":"Modular aquaponics units for peri-urban food production.","logo_url":""},{"name":"Beewise India","founder":"Tara Mehta","innovation":"Sensor-equipped hives for precision apiculture.","logo_url":""}]',
    },
  },
  seo: {
    home: {
      title: "The Agriculture Popular Article Magazine — Peer-Reviewed Open Access Monthly",
      description: "A peer-reviewed, open access monthly magazine on agriculture, allied sciences and the environment. Innovations, research and start-up stories.",
    },
    about: {
      title: "About — The Agriculture Popular Article Magazine",
      description: "About The Agriculture Popular Article Magazine — a peer-reviewed monthly published by Ram Mangalam Agri – Rural Development Foundation, edited by Dr. Dileep Kumar.",
    },
    contact: {
      title: "Contact — The Agriculture Popular Article Magazine",
      description: "Reach the editorial office of The Agriculture Popular Article Magazine at ICAR-RRS-CAZRI, Jaisalmer.",
    },
    editorial_board: {
      title: "Editorial Board — The Agriculture Popular Article Magazine",
      description: "Masthead of The Agriculture Popular Article Magazine — Editor-in-Chief Dr. Dileep Kumar, international editors, associate editors, advisory committee and peer reviewers.",
    },
    membership: {
      title: "Membership & Pricing — The Agriculture Popular Article Magazine",
      description: "Annual membership, submission fees, and payment particulars for publishing in The Agriculture Popular Article Magazine.",
    },
    guidelines: {
      title: "Submission Guidelines — The Agriculture Popular Article Magazine",
      description: "Editorial process, membership, fees and formatting rules for The Agriculture Popular Article Magazine.",
    },
    search: {
      title: "Search — The Agriculture Popular Article Magazine",
      description: "Search for agricultural popular articles, authors, categories, or volumes.",
    },
    archives: {
      title: "Archives — The Agriculture Popular Article Magazine",
      description: "Browse the full archive of The Agriculture Popular Article Magazine issues.",
    },
    current_issue: {
      title: "Current Issue — The Agriculture Popular Article Magazine",
      description: "Read or download the latest peer-reviewed issue of The Agriculture Popular Article Magazine.",
    },
    startup_spotlight: {
      title: "Startup Spotlight — The Agriculture Popular Article Magazine",
      description: "The companies rebuilding agriculture from the ground up showcased in the magazine.",
    },
    publication_ethics: {
      title: "Publication Ethics & Plagiarism Policy — The Agriculture Popular Article Magazine",
      description: "Publication ethics, plagiarism policy, authorship, peer review and editorial standards followed by The Agriculture Popular Article Magazine.",
    },
    advertise: {
      title: "Advertise — The Agriculture Popular Article Magazine",
      description: "Reach a highly targeted audience of scientists, progressive farmers, researchers, and agri-startups by advertising with us.",
    },
  },
  archives: {
    hero: {
      headline: "Every Issue, Since 2026",
      subtitle: "Original agricultural research, reviews, extension reports and policy briefs published monthly. Open-access and accessible to all.",
    },
  },
  search_page: {
    hero: {
      headline: "Find articles, authors, issues.",
    },
  },
  current_issue: {
    call_for_papers: {
      heading: "Call for Papers",
      subheading: "Submit to the next issue",
      body: "We invite popular science articles, field case studies, and startup stories for our upcoming monthly issue. Submissions are reviewed continuously.",
    },
    editorial: {
      description: "A peer-reviewed selection of original research and field reports advancing agricultural science and practice.",
    },
  },
  publication_ethics: {
    hero: {
      eyebrow: "Editorial Policy",
      title: "Publication Ethics & Plagiarism Policy",
      body: "The Agriculture Popular Article Magazine is committed to maintaining the highest standards of publication ethics. All authors, reviewers and editors are expected to follow the principles set out below."
    },
    originality: {
      title: "1. Originality & Plagiarism",
      body: "Manuscripts submitted to the magazine must be the original work of the authors and must not have been published or be under consideration elsewhere. All submissions are screened for plagiarism. Any manuscript with a similarity index above 15% (excluding references and standard terminology) will be returned to the author for revision or rejected outright.",
      points: '["Verbatim copying without quotation and citation is considered plagiarism.","Paraphrasing another author\'s work without attribution is plagiarism.","Self-plagiarism (republishing one\'s own work without disclosure) is not permitted.","All sources, data and figures must be properly cited."]'
    },
    authorship: {
      title: "2. Authorship",
      body: "Authorship should be limited to those who have made a significant contribution to the conception, design, execution or interpretation of the reported study. All persons who have made substantial contributions must be listed as co-authors. The corresponding author is responsible for ensuring that all co-authors have seen and approved the final version of the manuscript."
    },
    peer_review: {
      title: "3. Peer Review",
      body: "Every research article is subject to a double-blind peer review process. The identity of authors and reviewers is kept confidential. Reviewers are expected to evaluate manuscripts objectively, declare any conflicts of interest, and return their assessment within the agreed timeline."
    },
    conflicts: {
      title: "4. Conflicts of Interest",
      body: "Authors must disclose any financial, personal or professional relationships that could be perceived as influencing the content of their manuscript. Reviewers and editors must recuse themselves from manuscripts where a conflict of interest exists."
    },
    corrections: {
      title: "5. Corrections, Retractions & Misconduct",
      body: "If errors are discovered in a published article, the magazine will publish a correction or, in serious cases, retract the article. Allegations of misconduct including fabrication of data, image manipulation, duplicate submission or plagiarism will be investigated in line with COPE (Committee on Publication Ethics) guidelines."
    },
    open_access: {
      title: "6. Open Access & Copyright",
      body: "All articles are published under an open-access license. Authors retain copyright of their work and grant the magazine a non-exclusive license to publish and distribute the article. Readers may share and adapt the work for non-commercial purposes with proper attribution."
    },
    reporting: {
      title: "7. Reporting Concerns",
      body: "Concerns about publication ethics, plagiarism or research misconduct should be reported in writing to the Chief Editor through the <a href=\"/contact\" class=\"text-primary underline underline-offset-2\">contact page</a>. All reports will be reviewed confidentially."
    }
  },
  certificate: {
    branding: {
      magazine_name: "The Agriculture Popular Article Magazine",
      publisher: "Ram Mangalam Agri–Rural Development Foundation (RADF)",
      chief_editor: "Dr. Dileep Kumar",
      chief_editor_title: "Chief Editor, ICAR-CAZRI",
      chief_editor_signature: "Dileep K. Dangi",
      publisher_title: "Managing Director",
      publisher_institution: "RADF Jaipur",
      publisher_signature: "Ram Mangalam",
      seal_text: "• TAPAM • RADF JAIPUR • RESEARCH & POPULAR SCIENCE PUBLICATION",
      seal_text_membership: "• TAPAM ESTD 2026 • SCIENCE & AGRICULTURE RURAL ADVANCEMENT"
    }
  }
};
