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

export const editorialBoard = [
  { name: "Prof. Mahendra K. Sharma", role: "Editor-in-Chief", inst: "Indian Agricultural Research Institute", country: "India" },
  { name: "Dr. Sofia Almeida", role: "Senior Editor", inst: "EMBRAPA", country: "Brazil" },
  { name: "Prof. Hiroshi Tanaka", role: "Senior Editor", inst: "University of Tokyo", country: "Japan" },
  { name: "Dr. Amani Ndlovu", role: "Associate Editor", inst: "University of Pretoria", country: "South Africa" },
  { name: "Prof. Elena Rossi", role: "Associate Editor", inst: "University of Bologna", country: "Italy" },
  { name: "Dr. Wei Chen", role: "Associate Editor", inst: "China Agricultural University", country: "China" },
  { name: "Dr. Carlos Mendoza", role: "Associate Editor", inst: "UNAM", country: "Mexico" },
  { name: "Prof. Aisha Rahman", role: "Associate Editor", inst: "BRAC University", country: "Bangladesh" },
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
