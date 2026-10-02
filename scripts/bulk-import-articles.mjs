#!/usr/bin/env node
/**
 * Bulk Article Importer
 * ---------------------
 * Parses a multi-article .docx file and inserts each article into the
 * Supabase `articles` table with status "published".
 *
 * Usage:
 *   node scripts/bulk-import-articles.mjs [--dry-run]
 *
 * Flags:
 *   --dry-run   Print the articles that would be imported without touching the DB
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Load env ────────────────────────────────────────────────────────────────
const envPath = resolve(ROOT, ".env");
const envText = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^(\w+)=["']?(.+?)["']?$/);
  if (m) env[m[1]] = m[2];
}

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const HAS_SERVICE_ROLE = !!env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth helper: sign in if using anon key ──────────────────────────────────
async function ensureAuth() {
  if (HAS_SERVICE_ROLE) {
    console.log("🔑 Using service role key (bypasses RLS)");
    return;
  }

  // Need to sign in with email/password
  const email = process.env.ADMIN_EMAIL || process.argv.find(a => a.startsWith("--email="))?.split("=")[1];
  const password = process.env.ADMIN_PASSWORD || process.argv.find(a => a.startsWith("--password="))?.split("=")[1];

  if (!email || !password) {
    console.error("❌ No SUPABASE_SERVICE_ROLE_KEY found. Please provide admin credentials:");
    console.error("   node scripts/bulk-import-articles.mjs --email=you@email.com --password=yourpass");
    console.error("   Or add SUPABASE_SERVICE_ROLE_KEY to .env");
    process.exit(1);
  }

  console.log(`🔐 Signing in as ${email}...`);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`❌ Auth failed: ${error.message}`);
    process.exit(1);
  }
  console.log("   ✓ Authenticated\n");
}

// ── Config ──────────────────────────────────────────────────────────────────
const DOCX_PATH = resolve(ROOT, "popular  article-18 Re write.docx");
const DRY_RUN = process.argv.includes("--dry-run");

// ── Extract text from docx via Python helper script ─────────────────────────
function extractParagraphs() {
  const pyScript = resolve(__dirname, "extract-docx.py");
  const result = execSync(`python3 "${pyScript}" "${DOCX_PATH}"`, {
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(result);
}

// ── Split paragraphs into articles ──────────────────────────────────────────
function splitIntoArticles(paragraphs) {
  // Find article headings: "1. TITLE IN UPPERCASE"
  const headingPattern = /^(\d{1,2})\.\s+[A-Z][A-Z]/;
  const headings = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const m = paragraphs[i].match(headingPattern);
    if (m) {
      const num = parseInt(m[1]);
      if (num >= 1 && num <= 20) {
        // Heuristic: top-level article headings tend to have at least 3 uppercase words
        const uppercaseWordCount = paragraphs[i]
          .replace(/^\d+\.\s*/, "")
          .split(/\s+/)
          .filter((w) => w === w.toUpperCase() && w.length > 1).length;
        if (uppercaseWordCount >= 3) {
          headings.push({ index: i, num, raw: paragraphs[i] });
        }
      }
    }
  }

  const articles = [];
  for (let h = 0; h < headings.length; h++) {
    const startIdx = headings[h].index;
    const endIdx = h + 1 < headings.length ? headings[h + 1].index : paragraphs.length;

    // Title: strip the leading number "1. "
    const rawTitle = headings[h].raw.replace(/^\d+\.\s*/, "").trim();
    // Title case it
    const title = rawTitle
      .toLowerCase()
      .replace(/(^|\s|[-/(\[])\S/g, (c) => c.toUpperCase());

    // Collect body paragraphs
    const bodyParagraphs = paragraphs.slice(startIdx + 1, endIdx).filter((p) => p.length > 0);

    // First paragraph after heading is often the author line
    let author = "D. Kumar, Saren K., R.S. Mehta, S.C. Meena";
    let authorBio = "Scientists, ICAR-CAZRI-RRS, Jaisalmer";
    let bodyStart = 0;

    if (bodyParagraphs.length > 0 && /Kumar|Saren|Mehta|Meena/i.test(bodyParagraphs[0])) {
      author = bodyParagraphs[0].replace(/[¹²³⁴⁰₁₂₃₄]/g, "").replace(/\s+/g, " ").trim();
      bodyStart = 1;
      if (
        bodyParagraphs.length > 1 &&
        /SCIENTIST|ICAR|CAZRI/i.test(bodyParagraphs[1])
      ) {
        authorBio = bodyParagraphs[1].replace(/^[\d,\s]+/, "").trim();
        bodyStart = 2;
      }
    }

    // Build content as clean text
    const contentParagraphs = bodyParagraphs.slice(bodyStart);
    const content = contentParagraphs.join("\n\n");

    // First 2-3 sentences as abstract
    const sentences = contentParagraphs
      .join(" ")
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 20);
    const abstract = sentences.slice(0, 3).join(" ").substring(0, 500);

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Estimate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    articles.push({
      title,
      slug,
      abstract,
      content,
      author,
      authorBio,
      readTime,
      articleNumber: headings[h].num,
    });
  }

  return articles;
}

// ── Upload the original docx to storage ─────────────────────────────────────
async function uploadDocx() {
  const fileBuffer = readFileSync(DOCX_PATH);
  const path = `bulk-import/popular-article-18-rewrite.docx`;
  const { error } = await supabase.storage
    .from("article-pdfs")
    .upload(path, fileBuffer, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    });
  if (error) {
    console.warn(`⚠ Could not upload docx to storage: ${error.message}`);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("article-pdfs").getPublicUrl(path);
  return publicUrl;
}

// ── Fetch or create a category ──────────────────────────────────────────────
async function getOrCreateCategory(name) {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", `%${name}%`)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("categories")
    .insert({ name })
    .select("id")
    .single();
  if (error) {
    console.warn(`⚠ Could not create category "${name}": ${error.message}`);
    return null;
  }
  return created.id;
}

// ── Fetch the latest issue ──────────────────────────────────────────────────
async function getLatestIssue() {
  const { data } = await supabase
    .from("issues")
    .select("id,volume,issue_number,title")
    .order("volume", { ascending: false })
    .order("issue_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📄 Extracting text from docx...");
  const paragraphs = extractParagraphs();
  console.log(`   Found ${paragraphs.length} paragraphs`);

  console.log("\n✂️  Splitting into individual articles...");
  const articles = splitIntoArticles(paragraphs);
  console.log(`   Found ${articles.length} articles\n`);

  // Print article list
  for (const a of articles) {
    console.log(`  #${a.articleNumber.toString().padStart(2)}  ${a.title}`);
    console.log(`        slug: ${a.slug}`);
    console.log(`        abstract: ${a.abstract.substring(0, 80)}...`);
    console.log(`        words: ${a.content.split(/\s+/).length}, read: ${a.readTime} min`);
    console.log();
  }

  if (DRY_RUN) {
    console.log("🏁 Dry run complete — no database changes made.");
    return;
  }

  // Authenticate before touching the DB
  await ensureAuth();

  // Check for existing slugs to avoid duplicates
  const slugs = articles.map((a) => a.slug);
  const { data: existingArticles } = await supabase
    .from("articles")
    .select("slug")
    .in("slug", slugs);
  const existingSlugs = new Set((existingArticles || []).map((a) => a.slug));

  if (existingSlugs.size > 0) {
    console.log(
      `⚠ ${existingSlugs.size} article(s) already exist and will be skipped:`,
    );
    for (const s of existingSlugs) console.log(`    - ${s}`);
    console.log();
  }

  const newArticles = articles.filter((a) => !existingSlugs.has(a.slug));
  if (newArticles.length === 0) {
    console.log("✅ All articles already exist. Nothing to import.");
    return;
  }

  // Get issue + category
  const issue = await getLatestIssue();
  if (issue) {
    console.log(
      `📚 Assigning to issue: V${issue.volume}·I${issue.issue_number} — ${issue.title}`,
    );
  } else {
    console.log("⚠ No issues found — articles will have no issue_id");
  }

  const categoryId = await getOrCreateCategory("Popular Article");
  console.log(
    `🏷  Category: ${categoryId ? `Popular Article (${categoryId.slice(0, 8)})` : "none"}`,
  );

  // Upload docx
  console.log("\n📤 Uploading original docx to storage...");
  const pdfUrl = await uploadDocx();
  if (pdfUrl) console.log(`   ✓ Uploaded: ${pdfUrl.substring(0, 80)}...`);

  // Insert articles
  console.log(`\n📝 Inserting ${newArticles.length} articles...\n`);

  let success = 0;
  let failed = 0;

  for (const article of newArticles) {
    const row = {
      title: article.title,
      slug: article.slug,
      abstract: article.abstract,
      content: article.content,
      author_bio: `${article.author}\n${article.authorBio}`,
      category_id: categoryId,
      issue_id: issue?.id || null,
      status: "published",
      pdf_url: pdfUrl,
      published_at: new Date().toISOString(),
      read_time: article.readTime,
    };

    const { error } = await supabase.from("articles").insert(row);
    if (error) {
      console.log(`   ❌ Failed: ${article.title}`);
      console.log(`      Error: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ Published: ${article.title}`);
      success++;
    }
  }

  console.log(`\n🏁 Import complete: ${success} published, ${failed} failed`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
