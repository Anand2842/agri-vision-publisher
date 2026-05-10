import a1 from "@/assets/article-1.jpg";
import a2 from "@/assets/article-2.jpg";
import a3 from "@/assets/article-3.jpg";
import a4 from "@/assets/article-4.jpg";
import a5 from "@/assets/article-5.jpg";
import a6 from "@/assets/article-6.jpg";
import cover from "@/assets/issue-cover-1.jpg";

export { cover };

export type Article = {
  slug: string;
  title: string;
  category: string;
  author: string;
  affiliation: string;
  readTime: number;
  views: string;
  cover: string;
  abstract: string;
  date: string;
  /** Path of the article PDF inside the `article-pdfs` Supabase Storage bucket. */
  pdfPath?: string;
};

export const articles: Article[] = [
  {
    slug: "wheat-rust-resistance-himalayan-foothills",
    title: "Wheat Rust Resistance in the Himalayan Foothills",
    category: "Plant Protection",
    author: "Dr. Anjali Verma",
    affiliation: "ICAR — IARI, New Delhi",
    readTime: 12,
    views: "8.2k",
    cover: a1,
    abstract:
      "A multi-season field study on stripe rust resistance traits in indigenous wheat varieties across northern India.",
    date: "May 2026",
  },
  {
    slug: "vertical-farming-energy-economics",
    title: "Energy Economics of Indoor Vertical Farms",
    category: "Agri-Tech",
    author: "Prof. Liam O'Connor",
    affiliation: "Wageningen University",
    readTime: 9,
    views: "6.4k",
    cover: a2,
    abstract:
      "Quantifying LED, HVAC and labour costs across 14 commercial vertical farms in Europe and Southeast Asia.",
    date: "May 2026",
  },
  {
    slug: "drip-irrigation-thar-desert",
    title: "Drip Irrigation in the Thar: A Decadal Review",
    category: "Sustainability",
    author: "Dr. Rajeshwar Singh",
    affiliation: "CAZRI, Jodhpur",
    readTime: 14,
    views: "11.1k",
    cover: a3,
    abstract:
      "Ten years of micro-irrigation adoption in arid Rajasthan — yields, water-use efficiency and farmer livelihoods.",
    date: "May 2026",
  },
  {
    slug: "regenerative-soil-carbon-sequestration",
    title: "Regenerative Practices and Soil Carbon Sequestration",
    category: "Soil Science",
    author: "Dr. Maya Okafor",
    affiliation: "ICRISAT, Nairobi",
    readTime: 11,
    views: "5.0k",
    cover: a4,
    abstract:
      "Cover cropping, no-till and rotational grazing measured against five-year SOC change in Sahel soils.",
    date: "April 2026",
  },
  {
    slug: "ict-smart-farming-paddy",
    title: "ICT and Smart Farming in Paddy Systems",
    category: "Extension",
    author: "Dr. Ravi Kumar",
    affiliation: "TNAU, Coimbatore",
    readTime: 8,
    views: "9.6k",
    cover: a5,
    abstract:
      "How tablet-based advisory services changed input decisions for 2,400 smallholder rice farmers.",
    date: "April 2026",
  },
  {
    slug: "pollinator-decline-orchards",
    title: "Pollinator Decline in Commercial Orchards",
    category: "Horticulture",
    author: "Dr. Helena Vargas",
    affiliation: "INTA, Mendoza",
    readTime: 10,
    views: "4.3k",
    cover: a6,
    abstract:
      "Long-term surveys of bee diversity in apple and stone-fruit orchards across the Southern Cone.",
    date: "April 2026",
  },
];

export type BoardMember = {
  name: string;
  role: string;
  title?: string;
  inst: string;
  country?: string;
};

export const editorialBoard: BoardMember[] = [
  // Leadership
  { name: "Dr. Kartikeya Choudhary", role: "Founder & Managing Editor", title: "Assistant Professor (Agronomy)", inst: "MS Swaminathan School of Agriculture, Shoolini University, Solan (H.P.)" },
  { name: "Dr. Anoop Kumar Devedee", role: "Co-founder", title: "Assistant Professor, Division of Agronomy", inst: "Deen Dayal Upadhyay Gorakhpur University, Gorakhpur (U.P.)" },
  { name: "Dr. Vijay Bharti", role: "Editor-in-Chief", title: "Professor (Agronomy), Water Management Research Centre", inst: "Sher-e-Kashmir University of Agri Sciences and Technology of Jammu (J&K)" },
  { name: "Dr. Umesh Singh", role: "Associate Editor", title: "Assistant Professor (GPB)", inst: "DKS College of Agriculture and Research Station, Bhatapara, Chhattisgarh" },
  { name: "Dr. Bisheswar Prasad Yadav", role: "International Editor", title: "Director, Directorate of Agricultural Research", inst: "Province-2, Parwanipur, Bara, Nepal" },

  // Editorial Board
  { name: "Dr. R. K. Singh", role: "Editorial Board", title: "Professor, Department of Agronomy", inst: "Institute of Agricultural Sciences, Banaras Hindu University, Varanasi (U.P.)" },
  { name: "Dr. A. V. Dahiphale", role: "Editorial Board", title: "Agronomist, Central Experimental Station", inst: "Wakawali, Dapoli, Ratnagiri, Maharashtra" },
  { name: "Dr. Awani Kumar Singh", role: "Editorial Board", title: "Principal Scientist (Horticulture), CPCT", inst: "Indian Agricultural Research Institute, New Delhi" },
  { name: "Dr. R. P. Sharma", role: "Editorial Board", title: "Senior Scientist — Soil Science", inst: "ICAR-NBSS & LUP, Nagpur, Maharashtra" },
  { name: "Dr. Sandeep Kumar", role: "Editorial Board", title: "Scientist (Seed Production), University Seed Farm, Ladhowal", inst: "Punjab Agricultural University, Ludhiana" },
  { name: "Dr. Sunil Kumar Verma", role: "Editorial Board", title: "Assistant Professor, Department of Agronomy", inst: "Institute of Agricultural Sciences, BHU, Varanasi (U.P.)" },
  { name: "Dr. Alok Kumar", role: "Editorial Board", title: "Senior Horticulture Officer", inst: "National Horticulture Board, Gurugram, Haryana" },
  { name: "Dr. O. P. Garhwal", role: "Editorial Board", title: "Associate Professor (Horticulture)", inst: "Rajasthan Agri. Research Institute, Durgapura (SKN Agri. University, Jobner)" },
  { name: "Dr. Prafulla Pralhadrao C.", role: "Editorial Board", title: "Associate Professor (Seed Pd. Officer), AICRP-NSP", inst: "Dr. PDKV, Akola, Maharashtra" },
  { name: "Dr. Aniruddh Pratap Singh", role: "Editorial Board", title: "Asst. Professor — Olericulture & Floriculture", inst: "Nalanda College of Horticulture, Noorsarai, Bihar" },
  { name: "Dr. Anuradha Saha", role: "Editorial Board", title: "Chief Scientist (Agronomy), AICRP (Rice)", inst: "SKUAST-Jammu, Plant Breeding & Genetics" },
  { name: "Dr. Vikram Kumar", role: "Editorial Board", title: "Scientist-B, Central Silk Board", inst: "P-3 Seed Station, North Garo Hills, Meghalaya" },
  { name: "Dr. Pravin Kumar Upadhyay", role: "Editorial Board", title: "Scientist, Division of Agronomy", inst: "ICAR-Indian Agricultural Research Institute, New Delhi" },
  { name: "Dr. Shruti Godara", role: "Editorial Board", title: "Scientist-B, Biotechnology", inst: "Forest Research Institute (FRI), Dehradun" },
  { name: "Dr. Devi Lal Bagadi", role: "Editorial Board", title: "Plant Physiologist, AICRP on Arid Zone Fruits", inst: "SKN College of Agriculture, Jobner, Rajasthan" },
  { name: "Dr. Kumari Sunita", role: "Editorial Board", title: "Assistant Professor, Department of Botany", inst: "DDU Gorakhpur University, Gorakhpur (U.P.)" },
  { name: "Dr. Mukul Kumar", role: "Editorial Board", title: "Asst. Professor — Biochemistry & Crop Physiology", inst: "Bihar Agricultural University, Sabour" },
  { name: "Dr. Manish Kumar Singh", role: "Editorial Board", title: "Assistant Professor, Department of Vegetable Science", inst: "Banda University of Agriculture and Technology, Banda (U.P.)" },
  { name: "Mr. Kamlesh Meena", role: "Editorial Board", title: "Subject Matter Specialist, KVK (ICAR-IIVR)", inst: "Deoria, Uttar Pradesh" },
  { name: "Dr. Manoj Kumar Sharma", role: "Editorial Board", title: "Assistant Professor, Department of Plant Physiology", inst: "SKN College of Agriculture, Jobner, Rajasthan" },
  { name: "Dr. Sanjeev Kumar", role: "Editorial Board", title: "Agricultural Economist", inst: "Punjab Agricultural University, Ludhiana" },
  { name: "Dr. B. L. Dudwal", role: "Editorial Board", title: "Assistant Professor", inst: "SKN Agriculture University, Jobner, Jaipur (Rajasthan)" },
  { name: "Dr. Swarnali Duary", role: "Editorial Board", title: "Assistant Professor (Agronomy)", inst: "MS Swaminathan School of Agriculture, Centurion University, Odisha" },
  { name: "Dr. Chenesh Patel", role: "Editorial Board", title: "Department of Entomology", inst: "GB Pant University of Agriculture and Technology, Pantnagar" },
  { name: "Dr. Vinod Bhateshwar", role: "Editorial Board", title: "Assistant Professor (LPM)", inst: "Vivekananda Global University, Jaipur (Rajasthan)" },
  { name: "Dr. Amit Kumar", role: "Editorial Board", title: "Assistant Professor (Entomology)", inst: "GLA University, Mathura, Uttar Pradesh" },
  { name: "Dr. Monalisa Sahoo", role: "Editorial Board", title: "Assistant Professor (Agronomy)", inst: "MS Swaminathan School of Agriculture, Centurion University, Odisha" },
  { name: "Dr. Vikash Kumar", role: "Editorial Board", title: "Assistant Professor (Agronomy)", inst: "GLA University, Mathura, Uttar Pradesh" },
  { name: "Gaurav Singh Vishen", role: "Editorial Board", title: "Assistant Professor (Horticulture)", inst: "National PG College, Barhalganj, Gorakhpur (U.P.)" },
  { name: "Mr. Rahul Mishra", role: "Editorial Board", title: "Scientist", inst: "ICAR-IISS, Bhopal" },
  { name: "Dr. Arjun Lal Ola", role: "Editorial Board", title: "Assistant Professor (Vegetable Science)", inst: "Rani Lakshmi Bai Central Agricultural University, Jhansi" },
  { name: "Dr. Vijaykumar", role: "Editorial Board", title: "Assistant Professor, Livestock Research and Information Centre (Deoni)", inst: "Karnataka Veterinary, Animal and Fisheries University, Bidar" },
  { name: "Mr. Avinash Kumar", role: "Editorial Board", title: "Research Scholar", inst: "Dr. Rajendra Prasad Central Agricultural University, Pusa, Bihar" },
  { name: "Ms. Kawaljeet Kaur", role: "Editorial Board", title: "Assistant Professor (Soil Science)", inst: "CT Group of Institutions, Jalandhar, Punjab" },
  { name: "Dr. Rajeev Kumar Srivastava", role: "Editorial Board", title: "Assoc. Professor-cum-Sr. Scientist (Agronomy)", inst: "Dr. RPCAU, Pusa, Samastipur, Bihar" },
  { name: "Rahul Kumar", role: "Editorial Board", title: "Senior Scientist", inst: "Shoolini Lifesciences Pvt. Ltd., Shoolini University, Solan" },
  { name: "Dr. Madhuri Arya", role: "Editorial Board", title: "Asst. Professor-cum-Scientist (PBG)", inst: "Dr. RPCAU, Pusa, Dholi, Muzaffarpur, Bihar" },
  { name: "Dr. Gauri Jairath", role: "Editorial Board", title: "Scientist, Livestock Products Technology", inst: "ICAR-IVRI, Regional Station, Palampur, H.P." },
  { name: "Sudhir Mishra", role: "Editorial Board", title: "Assistant Professor", inst: "National P.G. College, Barhalganj, Gorakhpur (U.P.)" },
  { name: "Dr. Dharminder", role: "Editorial Board", title: "Associate Professor (Agronomy)", inst: "PG College of Agriculture, Dr. RPCAU, Pusa, Samastipur, Bihar" },

  // Content Editors
  { name: "Dr. Mehjabeen", role: "Content Editor", title: "Department of Soil Science & Agricultural Chemistry", inst: "Bihar Agricultural University, Sabour, Bhagalpur, Bihar" },
  { name: "Ms. Aparnna V.P.", role: "Content Editor", title: "Department of Dairy Science and Food Technology", inst: "Institute of Agricultural Sciences, BHU, Varanasi (U.P.)" },
];

export const reviewers: { name: string; dept?: string; inst: string }[] = [
  { name: "Dr. Ranjeet Singh Bochalya", dept: "Division of Agronomy", inst: "SKUAST-Jammu" },
  { name: "Mrs. Manju Netwal", dept: "Department of Horticulture", inst: "SKN College of Agriculture, Jobner" },
  { name: "Dr. Deepak Katkani", inst: "Mahyco" },
  { name: "Mr. Om Prakash Jitarwal", dept: "Department of Horticulture", inst: "CCSHAU, Hisar, Haryana" },
  { name: "Mr. Peeyush Kumar Jayaswal", dept: "Research Scholar", inst: "Birsa Agricultural University, Ranchi" },
  { name: "Mr. Aakash", dept: "Research Scholar", inst: "Institute of Agricultural Sciences, BHU" },
  { name: "Mr. Gaurav Prakash", dept: "Soil Science & Agril. Chemistry", inst: "Agriculture University, Kota" },
  { name: "Mr. Shankar Bijaria", dept: "Research Scholar", inst: "SKRAU, Bikaner" },
  { name: "Dr. Shivam Kumar Singh", dept: "Department of Horticulture", inst: "PG College, Ghazipur" },
  { name: "Mr. Nitin Yadav", dept: "Research Scholar", inst: "Institute of Agricultural Sciences, BHU" },
  { name: "Mr. Rajkumar Jakhar", dept: "Research Scholar", inst: "Institute of Agricultural Sciences, BHU" },
  { name: "Mr. Kartik Madankar", dept: "Research Scholar", inst: "Institute of Agricultural Sciences, BHU" },
  { name: "Mr. Mahendra Kumar", dept: "Research Scholar", inst: "JNKVV, Jabalpur" },
  { name: "Mr. Ayush Bahuguna", dept: "Asst. Development Officer", inst: "Dept. of Horti. & Food Processing, Dehradun" },
  { name: "Mr. Deepak Kumar Yadav", inst: "Agriculture Technical Assistant, Mirzapur (U.P.)" },
  { name: "Mr. Bhagchand Yadav", dept: "Department of Horticulture", inst: "SKRAU, Bikaner" },
  { name: "Mr. Nanu Ram Sharma", dept: "Department of Entomology", inst: "SKRAU, Bikaner" },
  { name: "Ms. Shikha Jain", dept: "Research Scholar, Division of Fruit Science", inst: "Indian Agricultural Research Institute, New Delhi" },
  { name: "Mr. Dodiya Ravi Kumar Dhirubhai", dept: "Department of Entomology", inst: "Anand Agricultural University, Gujarat" },
  { name: "Mr. Suresh Kumar Fagodia", dept: "Soil Science & Agricultural Chemistry", inst: "SKNAU, Jobner" },
  { name: "Mr. Kanik Kumar Bansal", dept: "Research Scholar, Division of Agronomy", inst: "SKUAST-Jammu" },
  { name: "Mr. Vijay Kumar", dept: "Research Scholar, Division of Agronomy", inst: "SKUAST-Jammu" },
  { name: "Shesh Narayan Kumawat", dept: "AICRP-Weed Management, Division of Agronomy", inst: "SKUAST-Jammu" },
  { name: "Pravallika Sree Rayanoothala", dept: "Department of Plant Pathology", inst: "CV Raman Global University, Bhubaneswar, Odisha" },
  { name: "Mr. Veerendra Kumar Patel", dept: "Research Scholar, Soil Science", inst: "Mahatma Gandhi Chitrakoot Gramodaya University, Satna, M.P." },
  { name: "Mr. Vishal Yadav", dept: "Research Scholar, Extension Education", inst: "ANDUA&T, Kumarganj, Ayodhya, U.P." },
  { name: "Anushi", dept: "Research Scholar, Horticulture (Fruit Science)", inst: "CSAUAT, Kanpur, U.P." },
  { name: "Ganesh Ram", dept: "Research Scholar, Department of Horticulture", inst: "RVSKVV, Gwalior, Madhya Pradesh" },
];

export const startups = [
  { name: "Cropwise AI", founder: "Neel Patel", innovation: "Satellite-driven yield forecasting for smallholders." },
  { name: "Mycro Soil", founder: "Lara Diop", innovation: "Mycorrhizal inoculants restoring degraded farmland." },
  { name: "Aquaponix", founder: "James Park", innovation: "Modular aquaponics units for peri-urban food production." },
  { name: "Beewise India", founder: "Tara Mehta", innovation: "Sensor-equipped hives for precision apiculture." },
];

export const issues = [
  { volume: 4, number: 5, title: "Adapting to a Warming Climate", date: "May 2026", desc: "Twelve original studies on climate-resilient agriculture, from heat-tolerant wheat to dryland horticulture." },
  { volume: 4, number: 4, title: "The Soil Beneath Us", date: "April 2026", desc: "A special issue on soil carbon, microbiology, and the regenerative movement." },
  { volume: 4, number: 3, title: "Water, Reimagined", date: "March 2026", desc: "Micro-irrigation, watershed management and aquaponic systems across four continents." },
  { volume: 4, number: 2, title: "Smallholder Futures", date: "February 2026", desc: "Extension, ICT and finance for the world's 500 million smallholder farms." },
  { volume: 4, number: 1, title: "The Year in Agri-Tech", date: "January 2026", desc: "From robotics to remote sensing, the technologies redefining farming this decade." },
  { volume: 3, number: 12, title: "Pollinators in Peril", date: "December 2025", desc: "Bee decline, biodiversity and the orchards that depend on both." },
];

export const stats = [
  { label: "Articles Published", value: 1284 },
  { label: "Researchers", value: 3120 },
  { label: "Countries", value: 64 },
  { label: "Institutions", value: 410 },
];
