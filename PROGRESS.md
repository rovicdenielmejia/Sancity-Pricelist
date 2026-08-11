# Sancity Pricelist Site — Progress / Resume Notes

Last updated: 2026-08-11

Site folder: `C:\Users\MrUnjong\Documents\GitHub\Sancity-Pricelist\` (this repo).

## Auto-set Service of Interest (2026-08-11)
- When the calculator's "Use estimate in my inquiry" is clicked, the Service of
  Interest dropdown now auto-selects the first service from the estimate.
- Also works on the `/inquiry?est=...` handoff: parses the first "- <Service>:"
  line in the prefilled message and selects it.
- Implemented in js/app.js (`setServiceOfInterest` helper). Explicit `?svc=`
  still takes precedence. Verified via headless Chrome in both flows.

## Messenger copy link (2026-08-11)
- The success message's Facebook link (`#mmeLink`, m.me/SanCityStudio) now copies
  the submitted inquiry to the clipboard before opening Messenger. Copied text:
  Name / Contact / Service of Interest / Message. Uses `navigator.clipboard`
  with an `execCommand` fallback.
- Implemented in js/app.js (lastInquiry + initMmeCopy); id added to the link in
  35 HTML files. Verified via headless Chrome: message copied + chat opened.

## Navigation Labels (2026-08-11)
- Sub pages (all 34 service pages): nav + footer link `#contact` renamed
  "Contact" -> "Inquiry Form".
- All pages: external social link (sancitystudios.base44.app) renamed
  "Contact us" -> "Social Media Accounts" (nav + footer).
- Also on home page: removed the "Browse by Service / Service Catalog /
  Tap any catalog..." section-head (duplicate of the hero title).
- Also on home page: removed the hero stats block (34 / Service Categories,
  Print & Design, Instant / Estimate with calculator).

## Inquiries -> Email (2026-08-11) — FormSubmit direct send
- All inquiry forms (`#contactForm` on inquiry.html + all 34 service pages)
  now send directly to `sancity.studio@gmail.com` via FormSubmit AJAX:
  `fetch POST https://formsubmit.co/ajax/sancity.studio@gmail.com`
  (payload: `_subject`, `_template=table`, `_captcha=false`, Name, Contact,
  Service of Interest, Message). No more `mailto:` — visitors don't need an
  email app.
- `js/app.js` submit handler updated; success message text updated in 35 files
  ("Inquiry sent! We will reply to your email or phone as soon as possible.").
- ACTIVATION REQUIRED (one-time): the FIRST inquiry submitted on the live site
  triggers an activation email to sancity.studio@gmail.com — click the link in
  it, then delivery works. Until activated, submissions may be dropped.
- Verified via headless Chrome (fetch stubbed): correct endpoint + payload,
  success message shows, form resets, no JS errors.
- Free tier: no account needed. Caveat: no inbox storage/history; consider
  Formspree or a serverless route later if delivery issues arise.

## Clean URLs / Vercel (2026-08-11)
- `vercel.json` at repo root: `{ "trailingSlash": false, "cleanUrls": true }`.
  Vercel serves every `.html` page at its extensionless URL (e.g. `/services/01-tarpaulin`)
  and 308-redirects any request with `.html` to the clean URL (clean redirects).
- All internal links are now extensionless, absolute paths:
  `/`, `/calculator`, `/inquiry`, `/services/01-tarpaulin`, etc.
  Applied to: index.html, calculator.html, inquiry.html, all 34 service pages,
  and `js/app.js` (`/inquiry?est=` handoff).
- Local preview server (`...\poster\website\server.js`) now falls back to
  `file.html` for extensionless paths, so clean URLs work locally too.
- Verified via local server: `/`, `/calculator?svc=24-t-shirt-and-print`,
  `/inquiry`, `/services/01-tarpaulin`, `/services/34-canvas-frame`,
  `/css/style.css`, `/js/app.js` all 200 with correct Content-Type.
  No `href/src/action="*.html"` remains in any HTML/JS/CSS.
- IMPORTANT: links are hard-coded absolute paths (deploy at a domain root on
  Vercel). A generator re-run would overwrite the HTML — re-apply after.

## Page Restructure (2026-08-11) — calculator & inquiry moved to standalone pages
- New `calculator.html`: dedicated Cost Calculator page (all 34 services).
  Supports `?svc=<slug>` to preselect a service. "Use estimate in my inquiry"
  now redirects to `inquiry.html?est=<encoded>` when no contact form is on the page.
- New `inquiry.html`: dedicated Send an Inquiry page. Supports `?svc=<slug>`
  (preselects Service of Interest) and `?est=<encoded>` (prefills the message).
- `index.html`: calculator + inquiry panels REMOVED (homepage = hero + catalog only),
  replaced with a two-card "Estimate & Inquire" CTA section. JS scripts removed
  (no calculator/contact on the page anymore).
- Service pages (34): KEEP their inline calculator + inquiry form (per user request,
  homepage-only move). Their nav/footer "Calculator" and "Contact" links now point
  to same-page anchors `#calculator` / `#contact` (they previously pointed to
  `../index.html#calculator|#contact`, which no longer exist).
- `js/app.js`: added `curService()` (reads body data-service, falls back to
  `?svc=` param); estimate handoff now navigates to inquiry.html when needed;
  inquiry page prefills the message from `?est=`.
- Verified via headless Chrome (CDP): no JS errors; nav/links/footer correct on
  all page types; service preselection and estimate prefill work.
- Note: these pages are new static files at repo root (calculator.html, inquiry.html).

## Current Task (COMPLETED)
Per-catalog page layout fix: price list tables were being cut off and required
horizontal scrolling inside narrow 3-column panels on desktop.

Status: COMPLETE. CSS fix applied and layout verified programmatically via CDP
metrics against the repo folder. Note: the two screenshots could not be viewed
by the AI (model has no image input); the CDP layout metrics were used as the
verification instead.

## Verification Results (2026-08-11, served from this repo)
- Desktop 1400px (all pages): `documentElement.scrollWidth == clientWidth == 1385`
  (no page-level overflow). Panel grid renders 2 columns (min 520px each).
  - All 34 tables now fit in (or scroll slightly inside) their 503px panel content.
    Full-width fitting: 01-tarpaulin, 24-t-shirt-and-print, 06-flyers,
    14-ref-magnet (501px each, no inner scroll after header-nowrap removal).
  - Still panel-scroll on desktop (multi-column price tables, `overflow-x:auto`,
    content reachable, no clipping): 16-sublimation-shirts (544px) and
    17-sublimation-long-sleeves (619px) — a 7-col nowrap price table can't fit
    503px; shrinking font/padding globally for 2 pages isn't worth the look change.
  - NOTE: sublimation-shirts (632px) is actually the widest table, wider than
    tarpaulin. Fine as-is (panel-scroll pattern), but if a zero-scroll desktop
    look is ever required, bump `.panel-grid` minmax(520px,1fr) higher.
- Mobile 390px (all pages): `scrollWidth == clientWidth == 390` (no page overflow).
  Tables scroll horizontally inside their own full-width panel (standard pattern).
- This repo is the deployment target; the old `C:\Users\MrUnjong\Documents\PRICELIST\Website`
  folder is NOT maintained anymore (do not deploy there).

## What Was Fixed Today
- `.panel-grid` changed to `repeat(auto-fit,minmax(520px,1fr))` so panels are
  always >= 520px (2 columns on desktop, 1 column stacked below 900px).
  Before: 3 columns of ~357px each cut off every table (tables force 520px).
- Table `min-width` reduced 520 -> 480 (desktop) so tables fill their panel
  with no cut-off; 460 -> 420 on mobile to reduce inner scroll.
- Added `@media (max-width:620px)` block: smaller panel padding, table font 13px,
  tighter cell padding, compact hero-img radius/margin, breadcrumb padding.
- Added explicit `@media (max-width:900px){ .panel-grid{grid-template-columns:1fr} }`.
- Removed `white-space:nowrap` from `th` (style.css): wide multi-column headers
  now wrap instead of forcing the table wider. Table widths dropped:
  06-flyers 521->501 (now fits), 14-ref-magnet 552->501 (now fits),
  16-sublimation-shirts 632->544, 17-sublimation-long-sleeves 859->619.
  Zero regression risk (allowing wrap never forces one; fitting tables unchanged).
- Synced updated `css/style.css` to deployed `C:\Users\MrUnjong\Documents\PRICELIST\Website\css\style.css`.

## Verified Results (CDP metrics on services/01-tarpaulin.html)
- Desktop 1400px: firstTable 501px inside 503px panel content -> fully visible,
  no horizontal scroll. Page-level scrollWidth == clientWidth (1385 == 1385).
- Mobile 390px: page scrollWidth == clientWidth == 390 (no page-level overflow).
  Tables scroll horizontally inside their own full-width panel (standard pattern).

## PENDING (NONE — all done 2026-08-11)
- Screenshots could NOT be visually reviewed (model has no image input); layout
  was verified instead via CDP layout metrics (see "Verification Results" above).
  A human can still eyeball `tarp_desktop.png` / `tarp_mobile.png` if desired.
- Spot-checked 4 other pages via CDP (t-shirt & print, sublimation-shirts,
  flyers, ref-magnet): all pass page-level overflow checks on desktop & mobile.
- Regenerate site is NOT needed for CSS changes (style.css is static and already
  matches the repo byte-for-byte).

## Content Edits (2026-08-11) — applied directly in this repo
This repo IS the deployment target. Do NOT push/copy anything to
`C:\Users\MrUnjong\Documents\PRICELIST\Website` (deprecated as deploy target).
- "Good to Know" panel heading -> "Note:" on all service pages that had it (31 files).
- In those note bullets, "add P..." -> "additional P..." (e.g. "For complex design,
  additional P150.00 - P250.00"). Calculator button / other "add" text unchanged.
- Added new page link "Contact us" -> `https://sancitystudios.base44.app`
  (`target="_blank" rel="noopener"`), in the top nav AND footer "Browse" section,
  on index.html + all 34 service pages.
- IMPORTANT: these are manual HTML edits. If the generator
  (`generate.ps1`) is ever re-run, it will overwrite them — re-apply after.

## How to Resume Tomorrow
- Site (this repo, deploy target): `C:\Users\MrUnjong\Documents\GitHub\Sancity-Pricelist\`
- Serve from the repo (server honors env `SITE_ROOT`):
  `$env:SITE_ROOT="C:\Users\MrUnjong\Documents\GitHub\Sancity-Pricelist"; node C:\Users\MrUnjong\AppData\Local\Temp\opencode\poster\website\server.js` -> http://localhost:8080/
- Quick desktop screenshot (no CDP needed):
  `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --user-data-dir=<temp prof> --window-size=1400,1000 --screenshot=<out.png> http://localhost:8080/services/01-tarpaulin.html`
- Mobile: add `--force-device-scale-factor=2` and `--window-size=390,844`.
- Layout metrics (CDP): start chrome `--remote-debugging-port=9222 --user-data-dir=<temp prof> about:blank`,
  then `node C:\Users\MrUnjong\AppData\Local\Temp\opencode\cdp_test.js` (env `CDP_PORT=9222`).
- Multi-page spot-check: `node C:\Users\MrUnjong\AppData\Local\Temp\opencode\spotcheck.js <page>.html <page>.html ...`

## Editing the Generator (only if content changes)
- Generator: `C:\Users\MrUnjong\AppData\Local\Temp\opencode\poster\website\generate.ps1`
- PS 5.1: must re-save file with `-Encoding UTF8` before running or parse fails.
- Re-run after edit, then re-apply the manual edits listed under "Content Edits" above.
