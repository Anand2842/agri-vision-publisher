# Classic magazine navigation + PDF-first articles

## 1. New header layout (like theagricultureonline.com)
Three stacked rows, keeping our colours, logo and the auto-hiding behaviour:

```text
[ phone  ·  email ]                       [ Home | About | Contact | social icons ]   <- thin top bar
[ LOGO + magazine name ]  [ Search box + button ]              [ CURRENT ISSUE pill ] <- white middle row
[ HOME  EDITORIAL BOARD  CURRENT ISSUE  ARCHIVES v  SUBMISSION v  PUBLICATION v  ADVERTISE ] <- dark menu bar
```

Dropdown contents:
- Archives: list of every issue (Vol / No / Month Year), plus "All archives"
- Submission: Submit Article, Author Guidelines, Submission Guidelines, Membership
- Publication: Aim & Scope, Publication Ethics, Plagiarism Policy, Open Access, FAQ

Mobile/tablet: top bar and search collapse; a menu button opens the same items as a fold-out list (existing mobile menu reused). Sign-in / dashboard link stays in the top bar.

## 2. Clicking an article opens its PDF
- Everywhere an article is listed (home, current issue, archives, search, related), clicking the title/card opens the article's PDF in a new full browser tab, same as "View PDF".
- If an article has no PDF yet, it falls back to its article page.
- The article page itself stays (needed for Google and ISSN metadata) and shows the full-screen PDF button.

## 3. Admin: full text optional
- Remove the rule that blocks publishing without HTML full text; only the PDF is required to publish.
- Status labels become "PDF ready / PDF missing"; full text shown as "Optional".

## Technical notes
- Rewrite `SiteHeader.tsx` desktop rows; issues for the Archives dropdown come from `fetchIssues()`.
- Shared helper `articleHref(a)` returning the PDF public URL (target=_blank) or `/articles/$slug`; used by all article list components.
- In `_authenticated.admin.articles.tsx`, drop the content check near line 136 and update the readiness badges.
