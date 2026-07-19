# Design QA

## Comparison target

- Source visual truth: `/var/folders/w0/qjq31wbn7bs7n_tb9wbfbs5w0000gn/T/codex-clipboard-7c51573a-c771-4637-9056-334c07e29500.png`
- Implementation screenshot: `/Users/fengwei/Documents/04-personal/99-blog/my-blog/hugo/temp/design-qa-final-article.png`
- Topic overview screenshot: `/Users/fengwei/Documents/04-personal/99-blog/my-blog/hugo/temp/design-qa-final-topic.png`
- Route: `http://localhost:1313/2024/11/from-programmer-to-architect/`
- Viewport: 1488 × 1056 desktop; responsive states also checked at 1056 × 900, 760 × 900, and 390 × 844.
- State: architecture series article, page top, series tree expanded, first article selected, article TOC visible.

## Full-view comparison evidence

- The source and implementation were opened together at the same 1488 × 1056 viewport.
- Both use the same three-column reading frame: 224px series navigation, 670px article, and 160px article TOC with 26px gutters.
- Header, vertical dividers, progress meter, breadcrumb, article heading, active series item, and active TOC item align with the source composition.
- Implementation uses the real 14-post architecture series and real article copy; the source mock contains illustrative 24-post copy, so article names, progress value, and section depth intentionally differ.

## Focused region comparison evidence

- A separate crop was not required: both artifacts are native 1488 × 1056 captures and the sidebar hierarchy, article typography, progress bar, and right TOC are legible in the full-view comparison.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Typography: source-like system sans stack, 36px desktop article title, 14px/1.82 article body, compact sidebar and TOC type; mobile title reduces to 30px.
- Spacing/layout: three columns align to the header; article begins immediately after the compact progress/breadcrumb header; no horizontal overflow at tested breakpoints.
- Colors/tokens: existing warm cream background, dark text, muted blue-gray labels, green active states, and pale green selection background match the source direction.
- Image quality: this reading screen contains no decorative raster assets or icons requiring replacement; article images retain the existing lightbox behavior.
- Copy/content: real Hugo post titles and real topic count are preserved instead of copying placeholder content from the mock.

## Interaction and responsive checks

- Clicking `1.2 如何设计 API？` in the series tree navigates to `/2023/10/how-to-design-the-api/` and moves `aria-current="page"` to that item.
- Clicking the article TOC item `API 网关` updates the URL hash and active TOC highlight.
- At 1056px, the series tree remains visible, the right TOC becomes an inline disclosure, and no horizontal overflow occurs.
- At 760px and 390px, the series tree becomes a collapsed `专栏目录` disclosure; opening it reveals the full hierarchy.
- At 390 × 844, navigation, article title, progress bar, and inline TOC fit without horizontal overflow.
- Browser console contained no page warnings or errors during the final desktop capture.

## Comparison history

1. Initial implementation — `/Users/fengwei/Documents/04-personal/99-blog/my-blog/hugo/temp/design-qa-before.png`
   - P1: the left series column occupied space but its closed `<details>` hid all content.
   - P1: the main header remained 880px while the reading grid expanded to 1284px, breaking the source alignment.
   - P2: title, body type, top spacing, and article density were substantially looser than the mock.
   - Fixes: opened the desktop series disclosure, added breakpoint-aware collapse behavior, changed the grid to 224/670/160, aligned the header, reduced title/body sizing, and removed the extra series `ARTICLE` kicker.
2. First post-fix implementation — `/Users/fengwei/Documents/04-personal/99-blog/my-blog/hugo/temp/design-qa-after-1.png`
   - P2: header remained 20px too tall and the topic landing page still looked like a separate card-based design.
   - P2: chapters followed Unicode label order rather than reading order, and the TOC lacked the source active state.
   - Fixes: reduced header height, rebuilt the topic overview in the same reading grid, derived numbered hierarchy from `series_order`, shortened the topic description, and added functional TOC scroll highlighting.
3. Final comparison — `/Users/fengwei/Documents/04-personal/99-blog/my-blog/hugo/temp/design-qa-final-article.png`
   - Earlier P1/P2 findings are visibly resolved. Remaining copy/count differences are expected real-content differences, not design drift.

## Final result

passed
