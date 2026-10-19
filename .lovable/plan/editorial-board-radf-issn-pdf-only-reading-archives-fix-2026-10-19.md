# Editorial board, RADF ISSN, PDF-only reading, archives fix

Yes, the new document is enough to fill in the Editorial Board.

## 1. Editorial Board (from the uploaded sheet)
| Member | Role on site | Designation / Dept | Institution & address | Email |
|---|---|---|---|---|
| Dr. Dileep Kumar | Editor-in-Chief | Senior Scientist, Agricultural Extension | ICAR-CAZRI RRS, Jodhpur Road, Jaisalmer 345001, Rajasthan | dileep.dangi@icar.org.in |
| Dr. R. S. Mehta | Editor | Principal Scientist & Head, Agronomy | ICAR-CAZRI RRS, Jaisalmer 345001 | Radhey.Mehta@icar.gov.in |
| Dr. Nandakumar S | Editor (sheet said "Editor-in-chief"; changed since Dr. Dileep Kumar is the only EIC) | Scientist, Genetics & Plant Breeding | ICAR-CAZRI RRS, Jaisalmer 345001 | nks.gen@icar.org.in |
| Dr. M. L. Meena | Associate Editor | Senior Scientist & Head / SMS (Agril. Extension) | CAZRI Krishi Vigyan Kendra, Pali-Marwar 306401, Rajasthan | ml.meena@rpcau.ac.in |
| Dr. Manish Kanwat | Editorial Board Member | Principal Scientist (Agril. Extension) & Head | ICAR-CAZRI Regional Research Station, Bhuj 370105, Kachchh, Gujarat | email missing in sheet |

- Saved into the site content (live) and defaults; existing photos reused; profile links left empty (sheet says NA).
- Board page shows these 5 as the Editorial Board; older incomplete editors removed from the board list.
- Open item: Dr. Manish Kanwat's institutional email is blank in the sheet — needed from client (shown without email until supplied). Dr. Meena's email domain (RPCAU) differs from his KVK address — flag for client to confirm.

## 2. ISSN in the name of RADF
- Publisher everywhere stays "Rammangalam Agri Rural Development Foundation (RADF)" (already done). The ISSN line on About/footer/certificates will read "E-ISSN: Awaiting assignment — registered to RADF".
- Note: the sheet's "Publisher: Dr. Dileep Kumar, ICAR-CAZRI" conflicts with this; site follows RADF as instructed.

## 3. Article page: PDF only
- Remove the "Read online" tab and the on-page text body toggle; the article page shows title, authors, abstract/metadata and a "View PDF" button that opens the PDF in a new full browser tab, plus "Download PDF".
- Same "View PDF" (new tab) on Current Issue and Archives table of contents; "Read" links removed there.
- Articles without a PDF show "PDF coming soon" (no reading text).
- Caution: ISSN India asked for readable full text online; keeping the text hidden is the client's choice — the full text stays stored for search engines/metadata only if wanted (will keep it hidden, not deleted).

## 4. Archives starting with "September"
- Database has a test issue ("test", Vol 2 Issue 2) with no publish date, added today. It breaks the date list and ordering.
- Fix: delete that test issue; sort archives newest-first by real publish date; build month filter only from issues that have a date; hide issues without a date from the public archive.
- Verify /archives shows January 2026 / Vol 1 Issue 1 correctly.

## Technical notes
- Board: update site_content editorial_board.editors items + site-content-defaults.ts.
- articles.$slug.tsx: drop view state/tabs/object embed; `<a target="_blank" href={pdfHref}>`.
- archives.tsx / data.ts: filter null published_at, sort desc; remove test issue row via data query.
