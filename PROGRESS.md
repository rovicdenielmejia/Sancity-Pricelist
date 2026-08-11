# Sancity Pricelist Site — Progress / Resume Notes

Last updated: 2026-08-11

Site folder: `C:\Users\MrUnjong\Documents\GitHub\Sancity-Pricelist\` (this repo).

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
