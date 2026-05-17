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
    pdfPath: "v4-i5/01-wheat-rust-resistance.pdf",
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
    pdfPath: "v4-i5/02-vertical-farming-energy.pdf",
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
    pdfPath: "v4-i5/03-drip-irrigation-thar.pdf",
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
    pdfPath: "v4-i5/04-regenerative-soil-carbon.pdf",
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
    pdfPath: "v4-i5/05-ict-smart-farming-paddy.pdf",
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
    pdfPath: "v4-i5/06-pollinator-decline-orchards.pdf",
  },
];

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

export type BoardMember = {
  name: string;
  role: string;
  title?: string;
  inst: string;
  country?: string;
  photo?: string;
};

export const editorialBoard: BoardMember[] = [
  {
    name: "Dr. Dileep Kumar",
    role: "Editor-in-Chief",
    title: "Founder & Managing Editor · Senior Scientist (Agriculture Extension)",
    inst: "ICAR–RRS–CAZRI, Jaisalmer · S.K.R.A.U. Bikaner",
    country: "India",
    photo: dileepKumar,
  },
  { name: "Dr. Dilip Kumar Jha", role: "International Editor", title: "Faculty", inst: "Agriculture and Forestry University (AFU)", country: "Nepal" },
  { name: "Dr. Punya Prasad Regmi", role: "International Editor", title: "Vice-Chancellor", inst: "Agriculture and Forestry University (AFU)", country: "Nepal" },
  { name: "Dr. Chamindri Withranga", role: "International Editor", title: "Faculty", inst: "University of Colombo", country: "Sri Lanka" },
  { name: "Talata Colombo", role: "International Editor", inst: "Sri Lanka", country: "Sri Lanka" },
  { name: "Dr. R. S. Mehta", role: "Associate Editor", title: "Principal Scientist", inst: "ICAR–CAZRI Regional Research Station, Jaisalmer", photo: rsMehta },
  { name: "Dr. Deepak Chaturvedi", role: "Associate Editor", inst: "ICAR–CAZRI, Jodhpur", photo: deepakChaturvedi },
  { name: "Dr. Charu Sharma", role: "Associate Editor", title: "Subject Matter Specialist", inst: "Krishi Vigyan Kendra, Jaisalmer", photo: charuSharma },
  { name: "Dr. Manish Kanwat", role: "Associate Editor", inst: "ICAR–CAZRI Regional Research Station, Bhuj", photo: manishKanwat },
  { name: "Dr. B. L. Manjunatha", role: "Associate Editor", inst: "ICAR–CAZRI, Jodhpur", photo: blManjunatha },
  { name: "Akansha Joshi", role: "Associate Editor", inst: "G.B. Pant University of Agriculture & Technology, Pantnagar", photo: akanshaJoshi },
  { name: "Dr. Rajiv Baliram Kale", role: "Associate Editor", inst: "ICAR–Directorate of Onion and Garlic Research, Pune", photo: rajivKale },
  { name: "Dr. Nanda Kumar S.", role: "Associate Editor", inst: "ICAR", photo: nandaKumar },
  { name: "Dr. MotiLal Meena", role: "Associate Editor", inst: "Krishi Vigyan Kendra, Pali", photo: motilalMeena },
  { name: "Dr. Letngam Touthang", role: "Associate Editor", inst: "ICAR", photo: letngamTouthang },
  { name: "Dr. Dasharath Prasad", role: "Associate Editor", inst: "Krishi Vigyan Kendra, S.K.R.A.U.", photo: dasharathPrasad },
];

export const advisoryCommittee: { name: string; inst: string; country?: string }[] = [
  { name: "Dr. Pema Gyamtsho", inst: "ICIMOD" },
  { name: "Dr. Karim Maredia", inst: "Michigan State University", country: "USA" },
  { name: "Dr. P. Das", inst: "ICAR" },
  { name: "Dr. Rajbir Singh", inst: "ICAR" },
  { name: "Dr. B. N. Tripathi", inst: "SKUAST–Jammu" },
  { name: "Dr. Nazir Ahmad Ganai", inst: "SKUAST–Srinagar" },
  { name: "Dr. K. D. Kokate", inst: "Former DDG (Agricultural Extension), ICAR" },
  { name: "Dr. Arjun Kumar Shrestha", inst: "Agriculture and Forestry University", country: "Nepal" },
  { name: "Dr. Inderjeet Singh", inst: "Bihar Animal Sciences University, Patna" },
  { name: "Dr. P. K. Ghosh", inst: "Visva-Bharati" },
  { name: "Dr. S. K. Dwivedi", inst: "DRDO" },
  { name: "Prof. S. V. Reddy", inst: "PRDIS" },
  { name: "Dr. V. V. Sadamate", inst: "Former Adviser (Agriculture), Planning Commission" },
  { name: "Dr. Tirtha Raj Regmi", inst: "Heifer International", country: "Nepal" },
  { name: "Dr. Suresh Chandra Babu", inst: "IFPRI" },
  { name: "Shiva Sundar Shrestha", inst: "Nepal Agroforestry Foundation", country: "Nepal" },
  { name: "Dr. Ramjee P. Ghimire", inst: "Michigan State University", country: "USA" },
];

export const reviewers: { name: string; dept?: string; inst: string }[] = [
  { name: "Atul Galav", inst: "" },
  { name: "Dr. Babaloo Sharma", inst: "" },
  { name: "Dr. Gajendra Singh", inst: "" },
  { name: "Dr. Anil Patidar", inst: "" },
  { name: "Gorav Singh", inst: "" },
  { name: "Dr. Ajaya Thakan", inst: "" },
  { name: "Lalit Godara", inst: "" },
  { name: "Roshan Lal Meena", inst: "" },
  { name: "Balveer", inst: "" },
  { name: "Himanshu", inst: "" },
  { name: "Rudraksh", inst: "" },
  { name: "Rahul", inst: "" },
  { name: "Dr. Bhagwan Singh", inst: "" },
  { name: "Dr. Ramniwas", inst: "KVK Pokaran" },
  { name: "Dr. Ramniwas", inst: "ICAR–NRC on Pomegranate" },
  { name: "Dr. S. C. Meena", inst: "" },
  { name: "Dr. Permendra", inst: "" },
  { name: "Dr. Hardev", inst: "" },
  { name: "Dr. Rajkumar Yogi", inst: "" },
  { name: "Dr. Sheran K.", inst: "" },
  { name: "Dr. Ashok Yadav", inst: "" },
  { name: "Dr. Sativeer Dangi", inst: "" },
  { name: "Dr. Leela Ram Sandhu", inst: "" },
  { name: "Dr. Arvind Jhajharia", inst: "" },
  { name: "Dr. Sonalika Mahajan", inst: "" },
  { name: "Dr. Paumpi Paul", inst: "" },
  { name: "Viklas Chandra Gautam", inst: "" },
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
