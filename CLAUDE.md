# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with code in this repository.

## Quick Start

This is a **static HTML website with no build process**—all pages are hand-authored HTML files deployed directly from the `main` branch via GitHub Pages. The domain is `tdcatalyst.com` (via CNAME). **After making changes and pushing to a feature branch, always create a pull request to merge into `main`, then merge it immediately.** Changes are live only after merging to main. There is no review process—merge right away to deploy.

## Project Overview

TDcatalyst is an advisory practice with **three offerings under one domain**, each a sub-site:

- **`/` (root)** — Umbrella hub page presenting the three practices
- **`/sail/`** — Executive field sessions: adaptability advisory for senior executives, delivered on coastal/ridge walks. This is the original full site (13 pages: Method, Sessions, About, Begin, Diagnose, Field Notes, contact cards). Accent: blue (`--logo-blue`).
- **`/grow/`** — AI transformation consulting for enterprises and public sector: AI deployment portfolio management, change management & adoption, reorganization. Single-page site. Accent: gold (`--logo-gold`). Display-branded **"Grow · Deploy"** — the "Deploy" qualifier (signaling implementation vs. Sail's framing) appears on Grow's own hero eyebrow, footer tagline, `<title>`/OG, and the hub card's tag line; peer enumerations (Sail / Grow / Advise lists), action CTAs ("Enter Grow →"), and running prose keep bare "Grow". The URL slug stays `/grow/`.
- **`/advise/`** — Advisory retainer / advisory-board offering for startup founders moving upmarket into enterprise. Single-page site. Accent: red (`--logo-red`).

All pages are self-contained, semantic HTML with consistent navigation and styling. The root also holds **redirect stubs** at every pre-restructure URL (e.g. `/method.html` → `/sail/method.html`) — JS `location.replace` preserving query strings, with meta-refresh fallback and `noindex`. Do not delete these stubs; external links, QR codes, and search results depend on them.

## Architecture

### Directory Structure
```
tdcatalyst-sail.github.io/
├── index.html                       # Umbrella hub page (three practice cards)
├── *.html                           # 12 redirect stubs → /sail/*.html (do not delete)
├── sail/                            # Original 13-page site (executive field sessions)
├── grow/index.html                  # Enterprise consulting one-pager
├── advise/index.html                # Founder advisory one-pager
├── style.css                        # Single shared stylesheet (all sub-sites)
├── script.js                        # Minimal JavaScript (2 behaviors, shared)
├── images/                          # Logo, headshot, field-note images, QR code (shared)
├── CNAME                            # Domain config (tdcatalyst.com)
├── robots.txt                       # SEO config
├── sitemap.xml                      # Sitemap
├── .gitignore                       # Git ignore rules
├── .gitattributes                   # Line-ending normalization
├── _private/                        # Gitignored: backend notes + Apps Script source (NOT deployed)
└── CLAUDE.md                        # This file
```

**Path convention since the restructure:** shared assets are referenced with root-absolute paths from every page (`/style.css`, `/script.js`, `/images/...`, `/favicon.png`). Page-to-page links within `sail/` remain relative (`method.html`); cross-site links are root-absolute (`/sail/`, `/grow/`, `/advise/`, `/`).

**IMPORTANT — this repository is public in two places.** It is browsable at github.com and every tracked file is also served at tdcatalyst.com by GitHub Pages, including this one at `tdcatalyst.com/CLAUDE.md`. Anything committed here is readable by anyone, permanently, because it stays in git history even after deletion. Never commit internal notes, strategy, unshipped pricing, backend source, or credentials — put them in `_private/` (gitignored) or keep them out of the repo entirely. See "Working notes live outside this repo" below.

### HTML Pages

**Root:**
- `index.html` — Umbrella hub: hero, three practice cards (`.practice-cards`), photo band, through-line section, CTA
- `grow/index.html`, `advise/index.html` — Single-page **business conversion pages** for solo consulting: fixed-fee offers, proof sections citing Eightfold AI and Capgemini (quantified case studies pending — see HTML comments), an experimental "embodied strategic framing" component, anchor nav, and a contact form (`_subject` and `_next` are practice-specific; all route to tom@tdcatalyst.com via formsubmit.co)

**Cross-linking rules:**
- The hub (`/`) links to everything — it is the umbrella.
- **Sail ↔ Grow are an intentional diagnostic→implementation pathway** and may carry *curated, contextual* cross-links both ways: Sail frames the adaptive challenge and delivers the 90-day roadmap; Grow executes it (portfolio decisions, adoption systems, org redesign). Current curated links — Sail→Grow: the Enterprise Engagement tier card CTA and the end-of-"engagement pathway" handoff on `sail/sessions.html`. Grow→Sail carries none at present: the "Start in Sail" signpost that sat above the engagements block on `grow/index.html` was removed 2026-07-24 (its `.practice-signpost` CSS in `style.css` is retained but currently unused). Keep these as deliberate handoffs at decision points — do **not** add blanket cross-practice links to nav or scatter them through body copy.
- **Advise stays self-sufficient** — no body cross-links into or out of it. The shared footer's practice list (the small `.footer-practices` block linking the sibling sub-sites) and the "All TDcatalyst practices →" link (to `/`) are the only cross-practice links every page carries; those are the umbrella affordance and are fine everywhere.
- The nav logo on every page reads `TDcatalyst/sail` (or `/grow`, `/advise`) via `<span class="mark-practice">`, colored by the `body.brand-*` class (sail=blue, grow=gold, advise=red). **Logo link target = that page's own practice home** (`/sail/`, `/grow/`, `/advise/`); umbrella pages (root `index.html`, root `about.html`) link to `/`. The logo sits inside a `.nav-brand` cluster with a caret **practice switcher** (`.brand-switch` button → `.brand-menu` dropdown) linking to every home — TDcatalyst (`/`), Sail, Grow, Advise — with the current practice (or the hub, on umbrella pages) highlighted. The dropdown markup is identical on all 18 pages; only the logo `href` and `mark-practice` suffix vary. Toggle is an inline `onclick`; `closeBrandMenu()` in `script.js` closes it on outside-click / Escape / scroll-away. Like the rest of the nav, this brand block is copy-pasted across all pages — edit one and propagate.

**Sail sub-site (sail/), main pages:**
- `index.html` — Hero/home page with thesis, engagement outcomes, CTA
- `method.html` — The five-framework method for advisory work
- `sessions.html` — Session tiers, deliverables, and pricing structure
- `about.html` — About Thomas Delaporte and the practice
- `begin.html` — Contact form (GET param: `?sent=1` shows confirmation)
- `preliminary-diagnostic.html` — 12-question AI Transformation Stall Diagnostic. The quiz copy lives in inline JavaScript strings, not HTML; submissions POST to a Google Apps Script endpoint (source kept in `_private/`)
- `one-pager.html` — Direct-share practice summary (not linked from nav or sitemap by design)

**Field Notes Hub & Articles:**
- `field-notes.html` — Hub page listing all field note essays
- `field-note-the-seams.html` — Essay on AI adoption failure modes
- `field-note-adaptability-as-a-discipline.html` — Essay on leadership capability gap
- `field-note-the-adoption-matrix.html` — Essay on organizational mapping

**Utility Pages:**
- `contact-card.html` — Standalone contact/calling card
- `calling-card.html` — Additional contact card variant

### Styles (style.css)

**Single unified stylesheet** using CSS custom properties (variables) for the design system.

**Color Palette (defined in `:root`) — logo-exact since the 2026-07 brand reshape (v3), sampled from the artwork's stroke cores:**
- `--navy` (`#1F3A5F`), `--navy-soft`, `--navy-deep` (`#16283F`): Text, headings, field CTA panels
- `--charcoal` (`#222222`): Body text
- `--offwhite` (`#EBEFEC`), `--seamist` (`#D9E2E6`): Alternating page grounds
- `--logo-gold` (`#E8B003`): Exact logo gold — graphics only (bars, rules, terrain, buttons); Grow accent
- `--terracotta` (`#8A6302`): The SAME gold hue deepened for small text on light grounds (WCAG) — gold text/hover accents use this, never `--logo-gold`
- `--terracotta-soft` (`#E8B003`): Bright gold for text on dark grounds
- `--logo-red` (`#DB160E`), `--logo-blue` (`#0348CA`): Logo-exact; Advise / Sail accents
- `--midgray` (`#6B6B6B`): Secondary text
- `--hairline` (`#D9D3CA`): Borders

**Layout & Typography:**
- **Fonts (self-hosted in `/fonts/`, no Google Fonts CDN):** Besley (Clarendon serif, variable 400–900; headings weight 500, logo TD 700) for headings; Archivo (variable; body 17.5px) for body; IBM Plex Mono (400/500) for eyebrows, captions, coordinates, the nav Begin button (`--mono` var). Do NOT re-add Google Fonts links — `@font-face` lives at the top of style.css
- **Headings:** `h1` uses `clamp(2.2rem, 5vw, 3.6rem)` for fluid sizing; h2/h3 similarly fluid
- **Container:** `.wrap` class = max-width 1180px, centered; `.narrow` variant for tighter layout
- **Sections:** Alternate white/off-white backgrounds using `.alt` class
- **Typography Classes:**
  - `.eyebrow` — Small, uppercase metadata/labels
  - `.lead` — Larger, lighter body text
  - `.hero-sub` — Larger subheading in hero sections
- **Navigation:** Sticky, frosted-glass effect (backdrop-filter blur); collapses to hamburger on mobile
- **Responsive:** Uses `clamp()` throughout for truly fluid, no-breakpoint design

**Key Component Classes:**
- `.btn`, `.btn-primary`, `.btn-ghost` — Button styles
- `.hero`, `.hero-with-logo`, `.hero-photo-bg` — Full-width hero sections
- `.section-head` — Section title wrapper
- `.outcomes-grid`, `.outcome-item` — 4-column grid for engagement outcomes
- `.fn-featured`, `.fn-featured-img`, `.fn-featured-body` — Field notes article cards
- `.skip-link` — Accessible skip-to-content link (hidden until focused)
- `.vh` — Visually hidden: reachable by screen readers and crawlers, invisible on screen. For headings a page needs structurally but renders typographically some other way (the contact card's name block). `sail/contact-card.html` is self-contained and does not load `/style.css`, so it repeats the rule in its own `<style>` — change both or neither.

### JavaScript (script.js)

**Two minimal features:**

1. **Form Submission Banner:** Detects `?sent=1` URL parameter (set by contact form on backend). If present, shows and smooth-scrolls to a `#sent-banner` element.
   ```html
   <!-- Add to pages with contact forms -->
   <div id="sent-banner" style="display:none;">
     ✓ Your message was sent successfully.
   </div>
   ```

2. **Auto-hiding Navigation:** On scroll down, nav hides (with `nav--hidden` class); on scroll up, nav reveals. Respects a `topBuffer` (80px) to always show nav near the top. Closes mobile menu when scrolling down. Uses passive scroll listeners for performance.

### Analytics & conversion events (2026-08)

Two cookieless analytics services run on every page: **Cloudflare Web Analytics** (beacon injected by `script.js`) and **GoatCounter** (inline tag before `</body>`). Both are named on `/privacy` — if you add, remove, or change a third-party that touches the visitor, **update `privacy.html` in the same commit**. The page previously claimed "no analytics" while two were running; do not let it drift again.

On top of pageviews, `script.js` fires **named GoatCounter events** for the actions that precede a conversation. Events record the action only — never field values or identifiers.

- **Buttons** — any `.btn` / `.nav-cta` click emits `cta-<practice>-<zone>`, where practice comes from the `body.brand-*` class (`hub` when there is none) and zone is the id of the nearest enclosing `<section>` (`hero` for `#main-content`). So a CTA in Grow's `#proof` reports `cta-grow-proof` with no markup at all. **Give a section an id and its buttons name themselves** — that is the whole convention.
- **`data-gc="name"`** on an anchor or button overrides the derived name. Used where the derived name would be meaningless (the diagnostic's JS-rendered Begin button).
- **Scheduling** — any link to cal.com emits `calendar-click`.
- **Forms** — first field focused emits `<base>-start`, submit emits `<base>-submit`. Base is `contact-form` unless the form carries `data-gc-form="<base>"` (the simulation briefing form uses `simulation-report`).
- **Tool funnels** — the simulation and diagnostic call `window.tdTrack(name, title)` from their own scripts: `simulation-open / -start / -cell-flagged / -plan-first / -plan-built / -complete` (complete = the built plan crosses the model's transformation threshold, not merely scrolling), and `diagnostic-start / -complete / -contact-shared`. The diagnostic's per-question `progress` pings stay out of GoatCounter — twelve per session would drown everything else — and continue going only to the Apps Script sheet.

`window.tdTrack` queues until GoatCounter's async `count.js` lands, so early clicks are not lost.

Add `?utm_source=…&utm_medium=…&utm_campaign=…&utm_content=…` to LinkedIn and email links; GoatCounter records the campaign against these events.

### Terrain device & motion (brand v3)

- **Terrain contours** (the brand's graphic device — generated topographic lines, every fifth line heavier in the accent) are drawn by `script.js` into any `canvas.terrain` / `canvas.card-terrain` with `data-seed / data-line / data-index / data-alpha / data-index-alpha / data-fade / data-scale` attributes. Every page/artifact gets a UNIQUE seed (same rule as photography: no ground repeats). Site alphas: hub hero 0.14/0.35, interior heroes 0.09/0.20, navy panels 0.35/0.5, card bases 0.09–0.13. Wrap hero sections with class `hero--terrain`; navy CTA panels use `cta-panel cta-panel--field` + a canvas.
- **Motion:** `.reveal` elements fade up on scroll (IntersectionObserver, `html.js`-gated so no-JS still shows content); the first `canvas.terrain[data-animate]` drifts slowly on desktop. Everything respects `prefers-reduced-motion`.
- **Deck assets:** pre-rendered 1920×1080 terrain backgrounds for Google Slides live in `/images/deck/`.

### Internal tools (`/templates/`, noindex + robots-disallowed)

- `templates/contour-card-studio.html` — the contour-card generator (site terrain renderer, venue presets, ground/accent options, seed log, 2160px PNG export). Publicly reachable by URL but unlinked, noindexed, and robots-disallowed.
- **Client-facing delivery templates do not live here.** They were moved to a private repo so client documents are never publicly served. Their `.doc-body`/`.sheet`/`.ph` CSS remains in `/style.css`. Do not recreate client-facing documents in this public repo.

### The Deploy Kit is offline (2026-08-03) — do not republish without Tom's word

`/grow/deploy-kit/` was taken out of the deployed tree. The four pages were deleted, every inbound link removed (Grow footer, Field Notes section, the seams and adoption-matrix essay CTAs, the Simulation closing pointer), the four sitemap entries dropped, and `/grow/deploy-kit/` is robots-disallowed in case anything was cached.

The pages are still in git history. The last commit carrying them is `fba8ba4`:

```bash
git checkout fba8ba4 -- grow/deploy-kit
```

If it returns, the inbound links and sitemap entries have to be re-added too (see commit "Take the Deploy Kit offline" for the exact removals to reverse). The `.doc-body`/`.sheet`/`.ph` CSS the instruments used is still in `/style.css` — leave it. Do not put the kit back on the site, and do not link to it, until Tom says so.

The reasons it was withdrawn, and the bar it has to clear to return, are in the working notes. Ask Tom before rebuilding it.

### Copy rules (IMPORTANT)

**Page copy is canonical.** A styling or structural change must never rewrite copy as a side effect. Copy edits ship only with Tom's explicit sign-off; batch open questions to him rather than guessing.

**Do not alter the standing vocabulary without sign-off:** "the AI revolution" (hub h1 and title), "embodied strategic framing" (Sail), "transformation consulting" (Grow). Each is a deliberate choice, and the reasoning is in the working notes rather than here.

**Craft rules for NEW copy:** claim-first headlines, no em dashes in visible copy, vary sentence shape (the hub's executives/enterprises/founders triplet is a deliberate exception), first person on the hub only.

### Working notes live outside this repo (IMPORTANT)

**Positioning, strategy, and anything personal are not recorded here, and must not be added.** This repository is public in two places (see the note under Directory Structure), so anything written here is readable by anyone, including competitors, and stays readable in git history after deletion.

None of the following belongs in any tracked file:

- competitive analysis, positioning doctrine, or the reasoning behind copy choices
- pricing, offers, or engagement terms that are not already published on a live page
- channel, campaign, or outreach plans
- backlog state, pending sign-offs, or what is being worked on when
- Tom's schedule, availability, or personal reasoning about the business
- links to access-controlled artifacts or private documents
- anything about ventures other than this website

That material lives in a Google Doc in Tom's Drive, **"TDcatalyst — Practice Working Notes"**. Ask him for it before any marketing, copy, or positioning session, and record new doctrine there rather than here.

**Keep this file to what it is for:** how to build and change the site.

### Images (images/ directory)

- `logo-v2.jpg` — Main logo (used in heroes)
- `logo-og.jpg` — Social-share image referenced by every page's OG/Twitter meta tags (byte-identical copy of logo-v2.jpg under a cache-bustable name)
- `headshot.jpg` — Tom Delaporte headshot, 800×800 (about page)
- `field-note-seams.jpg`, `field-note-adaptability.jpg`, `field-note-adoption-matrix.jpg` — Field note card/hero images
- `pacifica-*.jpg` — Original Pacifica field photography in three formats: `.photo-band` full-bleed strips (wide frames), `.photo-figure` centered portrait figures (vertical frames, preferred over force-cropping a vertical into a band), and the method `.landscape-figures` duo. **Each frame is used exactly once site-wide — never repurpose a photo onto a second page:** ridge-trail (hub band), cypress-arch (method figure, must show the trail), rose-path (about figure), storm-coast + canopy-trail (method landscapes duo; the method page's "The landscapes" section carries all four field frames), vista (grow band), horizon (advise band), ridgecrest (one-pager hero), fog-valley (contact card), methuselah-grove (method portrait figure below the landscapes duo — the Methuselah redwood shot at its base on Skyline Boulevard; the filename is not pacifica-prefixed because the venue is not Pacifica, and the caption reads "The Methuselah grove"). The sessions page is intentionally photo-free (its landscape photography was consolidated onto the method page), as are the sail home and begin pages apart from the Mori Point thesis band. **Caption venues accurately:** the forest frames are from San Pedro Valley County Park, not "Skyline ridge", and the sessions logistics copy lists Mori Point, Pedro Point Headlands, and San Pedro Valley Park as the actual venues. Graded originals and the web-export script live outside this repo; ask Tom when a re-export is needed.
- `qr-linkedin.png` — LinkedIn QR code (contact/calling cards)

**External Images:** One Unsplash CDN image remains by design (Mori Point on the sail index thesis band only); all other photography is original. External CDN images must carry the `onerror="this.style.display='none'"` fallback to hide broken images gracefully.

## Editing Conventions

### Adding/Editing Pages

1. **Structure:** Copy the nav/head from an existing page or use this template:
   ```html
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <link rel="icon" type="image/png" href="favicon.png">
     <title>Page Title — TDcatalyst</title>
     <meta name="description" content="..." />
     <link rel="canonical" href="https://tdcatalyst.com/page.html" />
     <!-- OG + Twitter meta tags here (copy from index.html) -->
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
     <link rel="stylesheet" href="/style.css">
   </head>
   <!-- Also add <script src="/script.js"></script> before </body>. Then run
        scripts/version-assets.py to stamp the ?v=<hash> cache-buster. -->
   <body>
   <a href="#main-content" class="skip-link">Skip to content</a>
   <!-- NAV BLOCK (copy from any page) -->
   <section class="hero" id="main-content">
     <!-- Content here -->
   </section>
   ```

2. **Semantic Structure:** Use section tags with HTML comments for organization:
   ```html
   <!-- HERO -->
   <section class="hero">
     <div class="wrap narrow">
       <!-- Hero content -->
     </div>
   </section>

   <!-- MAIN CONTENT -->
   <section class="alt">
     <div class="wrap">
       <!-- Alternating background -->
     </div>
   </section>
   ```

3. **Links:** All links are relative (e.g., `href="method.html"`, `href="images/logo.jpg"`). Exception: External links like Unsplash CDNs.

4. **Accessibility:**
   - Always include `id="main-content"` on first content section after nav
   - Use skip link: `<a href="#main-content" class="skip-link">Skip to content</a>`
   - Use semantic HTML: `<section>`, `<h1>`, `<a>`, `<button>` over `<div>`
   - Include `alt` text on all images
   - Mobile nav button has proper `aria-label` and `aria-expanded`

### Styling Changes

- **Edit `style.css` only**—never create per-page CSS files
- **Always use CSS variables** for colors (e.g., `color: var(--navy)`) — never hardcode hex values
- **Add new classes** for new components; reuse existing classes like `.wrap`, `.btn`, `.eyebrow`, `.lead`
- **Use `clamp()`** for responsive sizing to avoid media queries:
  ```css
  font-size: clamp(1.7rem, 3.2vw, 2.4rem);
  padding: clamp(1rem, 2vw, 2rem);
  ```
- **Avoid changing the nav structure**—it's shared across all pages

### Content Updates

- **Edit text directly in HTML files**
- **Find sections quickly** using HTML comments: `<!-- HERO -->`, `<!-- MAIN CONTENT -->`, `<!-- FIELD NOTES -->`, etc.
- **To remove a section:** Delete the entire `<section>` block and its comment header

### Field Notes Articles

When adding a new field note essay:

1. **Create the article page** (`field-note-*.html`) with the same head/nav structure as other pages
2. **Add article metadata** to the essay:
   ```html
   <article class="article-body">
     <div class="article-meta">
       <span class="article-pillar">Essay · [Topic]</span>
       <h1>Article Title</h1>
       <span class="article-date">Month YYYY · X min read</span>
     </div>
     <!-- Article content here -->
   </article>
   ```
3. **Add link to field-notes.html hub:**
   ```html
   <a href="field-note-filename.html" class="fn-featured" style="text-decoration:none; display:grid;">
     <div class="fn-featured-img">
       <img src="https://unsplash..." alt="..." onerror="this.style.display='none'">
     </div>
     <div class="fn-featured-body">
       <div class="fn-pillar">Essay · [Topic]</div>
       <div class="fn-title">Title</div>
       <div class="fn-meta">Month YYYY · X min read</div>
       <p class="fn-excerpt">...</p>
       <span class="fn-read">Read →</span>
     </div>
   </a>
   ```

## Common Tasks

| Task | Action |
|------|--------|
| **Add/edit a page** | Create/edit `.html` file following template structure. Use `.wrap` container, semantic sections, comments for organization. |
| **Update colors** | Add/modify CSS variable in `style.css` `:root`. Use throughout with `var(--varname)`. Never hardcode hex. |
| **Update typography** | Modify font size/weight in `style.css` using `clamp()`. Remember: Fraunces for headings, Inter for body. |
| **Add a component** | Create a new CSS class in `style.css`. Use existing color/spacing variables. |
| **Update nav** | Edit the nav block in ONE page, then copy to all others (it's shared). Nav is in `<nav><div class="nav-inner">` with logo, toggle button, and `<ul class="nav-links">`. |
| **Add a form field** | Add `<input>` or `<textarea>` to `begin.html`. Form submits via `<form action="...">` (backend handles it). Add `?sent=1` to redirect URL to trigger banner. |
| **Link to a page** | Use relative path: `href="method.html"`, `href="about.html"`, `href="images/logo.jpg"`. Do NOT use absolute URLs for local files. |
| **Add an image** | Store in `images/` directory. Use relative path: `src="images/file.jpg"`. For external CDN images, use full URL with `onerror="this.style.display='none'"` fallback. |
| **Remove a section** | Find the `<!-- SECTION_NAME -->` comment, delete the entire `<section>...</section>` block and comment. |

## Git Workflow

1. **Create/checkout a feature branch** (e.g., `claude/add-new-page`):
   ```bash
   git checkout -b claude/add-new-page
   ```

2. **Make changes** to HTML, CSS, or JS files (no build needed)

   **If you edited `style.css` or `script.js`, run the cache-buster before committing:**
   ```bash
   python scripts/version-assets.py
   ```
   This stamps a content hash onto every `/style.css` and `/script.js` reference
   (`href="/style.css?v=<hash>"`) so returning visitors fetch the new asset
   immediately instead of a stale cached copy — GitHub Pages caches assets ~10 min
   and allows no custom `Cache-Control` headers, so the query hash is the fix. It
   touches all HTML files (commit them together) and is idempotent — a no-op when
   the assets are unchanged. Do **not** hand-edit the `?v=` values.

3. **Commit with a clear message:**
   ```bash
   git add .
   git commit -m "Add new landing page with updated hero section"
   ```

   **Then re-date the sitemap, as a separate commit:**
   ```bash
   python scripts/sitemap-lastmod.py
   ```
   This reads each page's real commit date out of git and stamps `<lastmod>`, so
   crawlers can tell what actually changed. It must run **after** the content
   commit or it stamps the previous commit's date; commit `sitemap.xml` on its
   own afterwards. Idempotent, and it only dates URLs already listed — pages
   excluded on purpose (one-pager, contact cards, `/templates/`) stay excluded.

4. **Push to the feature branch:**
   ```bash
   git push -u origin claude/add-new-page
   ```

5. **Create a pull request** to `main` (via GitHub UI or CLI)

6. **Merge immediately** (no review process):
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff claude/add-new-page
   git push origin main
   ```

7. **Delete the feature branch** when done (optional, GitHub can auto-delete after merge)

Changes are live on `tdcatalyst.com` within seconds of merging to `main`.

## Design System Reference

### Spacing Scale (used in CSS and classes)
- `0.5rem`, `1rem`, `1.5rem`, `2rem`, `2.5rem`, `3rem` — margins, padding, gaps
- Use `clamp()` for responsive spacing: `clamp(1rem, 2vw, 2rem)`

### Font Scale
| Element | Size | Family | Weight | Line Height |
|---------|------|--------|--------|-------------|
| h1 | `clamp(2.2rem, 5vw, 3.6rem)` | Fraunces | 400 | 1.1 |
| h2 | `clamp(1.7rem, 3.2vw, 2.4rem)` | Fraunces | 400 | 1.2 |
| h3 | `1.25rem` | Fraunces | 400 | 1.3 |
| body (p) | `17px` (1rem) | Inter | 400 | 1.6 |
| .lead | `1.15rem` | Inter | 400 | 1.6 |
| .eyebrow | Small, uppercase | Inter | 500 | — |

### Button States
- `.btn-primary` — Navy bg, white text; hover floods logo gold with navy-deep text
- `.btn-ghost` — Transparent, navy text, gold border on hover
- `.btn-gold` — Gold bg, navy-deep text (navy field panels)
- All buttons are pill-shaped (`border-radius: 999px`). `.nav-cta` uses `text-box: trim-both cap alphabetic` for geometric vertical centering — do not remove it or the `!important` paddings (they defeat `.nav-links a`'s higher-specificity `padding-bottom`)

### Navigation
- Sticky header with backdrop blur
- Hides on scroll down (adds `nav--hidden` class, transforms up)
- Reveals on scroll up
- Mobile hamburger menu with toggle button
- `.active` class marks current page link (add to current page's nav item)

## Production Checklist

Before merging to `main`:

- [ ] All links are working (relative paths correct)
- [ ] External CDN images have `onerror="this.style.display='none'"` fallback
- [ ] Page has proper title, meta description, OG image
- [ ] Every `<img>` carries intrinsic `width`/`height` (stops layout shift; CSS still controls display size)
- [ ] Every `target="_blank"` link carries `rel="noopener"`
- [ ] Page carries a JSON-LD `@graph` (Organization node + a page-appropriate type + BreadcrumbList). Every claim in it must already appear on the page — the graph restates, it does not assert anything new. `noindex` pages are exempt.
- [ ] Exactly one `<h1>` in the static markup — including on JS-rendered pages, which need a static seed so crawlers and no-JS visitors get one
- [ ] Navigation matches all other pages (copy-paste consistency)
- [ ] Semantic HTML used (section, article, nav, etc.)
- [ ] Skip link included: `<a href="#main-content" class="skip-link">`
- [ ] Main content section has `id="main-content"`
- [ ] CSS only uses variables for colors (no hardcoded hex)
- [ ] No console errors in browser DevTools
- [ ] Mobile responsive (check nav collapse, button sizing, text readability)
- [ ] Contact form (if present) correctly posts to backend and redirects with `?sent=1`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Image broken on live site** | Add `onerror="this.style.display='none'"` to img tag. For local images, verify path is relative and file exists in `images/`. |
| **Navigation looks different on one page** | Nav is copy-pasted across all pages. If one page has outdated nav, copy the nav block from `index.html` and replace it on the broken page. |
| **Styling not applying** | Check that CSS class name matches what's in `style.css`. Verify CSS custom property name is correct: `var(--varname)`. Hard refresh browser cache (Ctrl+Shift+R). |
| **Form submission not showing banner** | Ensure backend redirect includes `?sent=1` query param. Add `<div id="sent-banner" style="display:none;">Success message</div>` to page if missing. Verify `script.js` is loaded. |
| **Mobile menu not closing** | The nav toggle button should have `onclick="var o=document.getElementById('nav').classList.toggle('open');this.setAttribute('aria-expanded',o)"`. Copy from existing page if broken. |
| **Colors look wrong** | Open DevTools → Inspect element → check computed styles. Verify `:root` variables in `style.css` are correct. Colors should use `var(--colorname)`, not hex values. |

## Performance Notes

- **No build process:** HTML, CSS, JS are served as-is; zero bundling overhead
- **Passive scroll listeners:** Nav hide/reveal uses `{ passive: true }` for 60fps scroll performance
- **Backdrop blur:** Nav uses `backdrop-filter: blur(10px)` with `will-change: transform` for GPU acceleration
- **Font subsetting:** Google Fonts CDN preconnected to avoid render-blocking delays
- **Image optimization:** External images load async; broken images hidden, not replaced with fallbacks
- **No JavaScript frameworks:** Pure vanilla JS keeps bundle size minimal

## Questions or Feedback?

For Claude Code help, use `/help` or visit https://github.com/anthropics/claude-code/issues. For project-specific changes, follow the workflow above and merge to `main` to deploy immediately.
