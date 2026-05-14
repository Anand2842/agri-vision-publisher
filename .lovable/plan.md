# Gap analysis: brand doc vs current build

Below is everything in `dangi_magazine.docx` that is **not yet** reflected in the site, grouped by priority. Copy + factual content first, payment + uploads second, polish last.

## P0 — Wrong or missing facts

### 1. About page → replace stock copy with real journal particulars
Current `/about` shows invented founding-year text and a fake 2022–2026 timeline. Replace with the doc's three blocks:

- **About Us** paragraphs (4 paragraphs, pages 3–4)
- **Vision** + **Mission** (6 mission bullets — disseminate / highlight / bridge / support / encourage / strengthen)
- **Journal Particulars** table:
  - Title: The Agriculture Popular Article Magazine
  - Frequency: Monthly · ISSN: pending · Subject: Agriculture · Language: English / Hindi · Format: Online · Starting Year: 2026
  - Publisher: **Ram Mangalam Agri – Rural Development Foundation (RADF)**
  - Chief Editor: **Dr. Dileep Kumar**
  - Address: ICAR-RRS-CAZRI, Jaisalmer 345001 · Mobile: +91 95091 64410

Drop the invented timeline.

### 2. Editorial Board → swap mock people for the real masthead
`src/lib/mock-data.ts` currently lists invented names. Replace `editorialBoard` and `reviewers` with the doc's actual roster:

- **Editor-in-Chief / Founder & Managing Editor:** Dr. Dileep Kumar (S.K.R.A.U. Bikaner; Senior Scientist, ICAR-RRS-CAZRI Jaisalmer)
- **International Editors (4):** Dr. Dilip Kumar Jha (AFU, Nepal), Dr. Chamindri Withranga (Univ. of Colombo, Sri Lanka), Dr. Punya Prasad Regmi (VC, AFU, Nepal), Talata Colombo (Sri Lanka)
- **Associate Editors:** Dr. R.S. Mehta (CAZRI-RRS Jaisalmer), Dr. Deepak Chaturvedi, Dr. Charu Sharma (KVK Jaisalmer), Dr. Manish Kanwat (CAZRI-RRS Bhuj), Dr. B.L. Manjunatha (CAZRI Jodhpur), Akansha Joshi (GBPUA&T Pantnagar), Dr. Rajiv Baliram Kale (ICAR-DOGR Pune), Dr. Nanda Kumar S, Dr. MotiLal Meena (KVK Pali), Dr. Letngam Touthang, Dr. Dasharath Prasad (KVK SKRAU)
- **Reviewers (~24):** Atul Galav, Dr. Babaloo Sharma, Dr. Gajendra Singh, Dr. Anil Patidar, Gorav Singh, Dr. Ajaya Thakan, Lalit Godara, Roshan Lal Meena, Balveer, Himanshu, Rudraksh, Rahul, Dr. Bhagwan Singh, Dr. Charu Sharma, Dr. Ramniwas (KVK Pokaran), Dr. Ramniwas (NRC Pomegranate), Dr. SC Meena, Dr. Permendra, Dr. Hardev, Dr. Rajkumar Yogi, Dr. Sheran K., Dr. Ashok Yadav, Dr. Sativeer Dangi, Dr. Leela Ram Sandhu, Dr. Arvind Jhajharia, Dr. Sonalika Mahajan, Dr. Paumpi Paul, Viklas Chandra Gautam, Dr. Nanda Kumar S
- **Add a new section: International Advisory Committee** (17 members — Dr. Pema Gyamtsho ICIMOD, Dr. Karim Maredia MSU, Dr. P. Das ICAR, Dr. Rajbir Singh ICAR, Dr. B.N. Tripathi SKUAST-Jammu, Dr. Nazir Ahmad Ganai SKUAST-Srinagar, Dr. K.D. Kokate, Dr. Arjun Kumar Shrestha AFU Nepal, Dr. Inderjeet Singh BASU Patna, Dr. P.K. Ghosh Visva-Bharati, Dr. S.K. Dwivedi DRDO, Prof. S.V. Reddy PRDIS, Dr. V.V. Sadamate, Dr. Tirtha Raj Regmi Heifer Nepal, Suresh Chandra Babu IFPRI, Shiva Sundar Shrestha NAF, Dr. Ramjee P. Ghimire MSU)

### 3. Membership → pricing is wrong
Current plans (₹500 / ₹2,500 / ₹15,000 / ₹40,000) do not match the doc. Replace with:

| Plan | Price | Validity |
|---|---|---|
| Single Article | ₹200 | 1 article |
| Annual | ₹500 | 8 articles or 12 months |
| Lifetime | ₹2,000 | 5 years |
| Institute / Library | ₹5,000 | 5 years |

Also state explicitly: **annual members publish for free**; non-member co-authors / non-member authors pay a publication fee (per doc §3).

### 4. Contact → wrong office, missing publisher block
Current `/contact` shows a fake Pusa Delhi address and `editor@agriculturepopular.com`. Replace with:

- Dr. Dileep Kumar Dangi · Senior Scientist (Agriculture Extension) · ICAR-RRS-CAZRI, Jaisalmer 345001
- Phone: 9509164410 · Email: **dkdkdangi@gmail.com**
- Hours: Mon–Sat 08:00–20:00 IST
- Add a **Publisher** block under the form: Ram Mangalam Agri – Rural Development Foundation (R.A.D.F.), Ajmer Road, Hirapura, Jaipur, India · +91 9509164410 · dkdkdangi@gmail.com
- Add an **Advertise** block (verbatim from doc page 17): "Agro-based industrial and other allied sectors can advertise in The Agriculture Popular Article Magazine" + same email/phone.

### 5. Submission Guidelines → rewrite to doc's 7 sections
Replace the generic 4 sections with the doc's structure:
1. Editorial & Review Process
2. Membership Requirements (annual membership required for all authors; member ID + certificate issued)
3. Publication Fees (annual members free; non-member co-authors/authors pay)
4. Submission Requirements (Word .doc/.docx only · 2–4 pages · introduction + conclusion · monthly deadline)
5. Formatting (Title TNR 14pt bold · Author details TNR 12pt · Corresp. email TNR 12pt bold · Headings TNR 14pt bold · Subheadings 12pt bold · Body 12pt · SI units · IUB/IUPAC abbreviations)
6. Originality & Plagiarism
7. Publication & Access (PDF emailed + downloadable from site; submit to dkdkdangi@gmail.com or via "Submit Article Online")

### 6. Footer / Header brand strip
Footer currently links to fake `editor@agriculturepopular.com`. Update across header utility bar + footer to **dkdkdangi@gmail.com** and **+91 9509164410**.

## P1 — Functional gaps

### 7. Submit form → doc requires .doc/.docx upload
Current `/submit` only accepts pasted text. The doc explicitly says "Articles must be submitted in Microsoft Word format (.doc/.docx). Submissions without the prescribed format will be rejected."

- Create a Supabase Storage bucket `manuscripts` (private; RLS so only owner + admins/moderators can read).
- Add a file input to `/submit`, upload to `manuscripts/<user_id>/<submission_id>.docx`, store the path on `submissions.notes` or add a `manuscript_path text` column.
- Restrict accept=".doc,.docx" + 10 MB cap.

### 8. Payments → 4 Razorpay plans + bank/NEFT + PhonePe QR
Doc shows "Pay Now — Secured by Razorpay" buttons on each membership card and a manual bank/NEFT block:

- A/c Holder: Dileep Kumar · A/c No. 32971942417 · SBI · IFSC SBIN0003877 · Branch SBI Main Jaisalmer
- PhonePe QR (scan & pay) on +91 9509164410

Two paths — pick one before building:

- **Path A (recommended):** wire Razorpay properly via a server function that creates an order (needs `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` secrets) and a webhook at `/api/public/webhooks/razorpay` to mark `payments` rows paid.
- **Path B (no integration yet):** ship a static "Bank transfer / PhonePe QR / Razorpay coming soon" panel on `/membership` that mirrors the doc verbatim, and collect the transaction screenshot through the contact form. Faster, no secrets needed.

### 9. Seed real Volume 1 Issue 1 (Jan 2026)
DB is empty. Doc lists the actual launch issue articles (pages 18–37):

1. Dynamics of E-Learning — D. Kumar, R.S. Mehta, Shiran K., S.C. Meena (CAZRI Jaisalmer)
2. Importance of MIS for Managing Agriculture in Thar Desert
3. Conceptual Framework of Information Kiosk in Western Rajasthan
4. Agriculture Knowledge Information System (AKIS) for Western Rajasthan
5. Contract Farming for Remunerative Prices of Jeera, Isabgoal & Pomegranate in Western Rajasthan
6. ICT in arid-zone agriculture (Thar Desert)

Insert: 1 row in `issues` (volume 1, issue 1, "January 2026"), 6 rows in `articles` linked to that issue, 1 author profile (`profiles` row for Dr. Dileep Kumar). Categories already covered by current taxonomy.

## P2 — Polish

- **Homepage:** show "Volume 1 · Issue 1 · January 2026" pulled from DB instead of hardcoded copy; small publisher line "Published by Ram Mangalam Agri – Rural Development Foundation".
- **Logo placement:** doc page 14 also references the **RADF publisher logo** (separate from the magazine seal). If the user has it, add it to the footer's publisher block; if not, use the magazine seal there too.
- **ISSN line:** doc has it blank. Keep ISSN out of the UI until it is assigned.
- **Mobile no:** unify everywhere to `+91 9509164410` (header utility bar currently shows `+91-9928123930`).

## Suggested execution order (one PR per group)

```text
1. Content + brand sweep        (P0 #1, #2, #3, #4, #5, #6)
2. Submit upload + manuscripts  (P1 #7 + storage migration)
3. Seed Volume 1 Issue 1        (P1 #9 — migration with 6 articles)
4. Payments                     (P1 #8 — choose Path A or B)
5. Homepage polish              (P2)
```

## Decisions needed before I build

1. **Payments now or later?** Path A (Razorpay live) requires the user's `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`. Path B ships static bank/QR/Razorpay-soon copy.
2. **Editorial Board photos:** the doc has portrait JPEGs for ~12 people. Embed them, or keep current initials-only cards?
3. **Seed Volume 1 articles:** insert just titles + abstracts now, or wait until full PDFs are uploaded?
