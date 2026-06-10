# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with code in this repository.

## Quick Start

This is a **static HTML website with no build process**—all pages are hand-authored HTML files deployed directly from the `main` branch via GitHub Pages. The domain is `tdcatalyst.com` (via CNAME). **After making changes and pushing to a feature branch, always create a pull request to merge into `main`, then merge it immediately.** Changes are live only after merging to main. There is no review process—merge right away to deploy.

## Project Overview

TDcatalyst is an advisory practice website focused on AI workforce transformation and adaptability. The site presents:
- **Core service pages:** Method, Sessions, About, Begin (contact), Diagnose (preliminary-diagnostic.html)
- **Field Notes:** Practitioner essays on AI, work, and organizational change
- **Supporting pages:** one-pager.html (direct-share summary), two calling cards (contact-card.html, calling-card.html — the latter is a redirect stub to the former)

All pages are self-contained, semantic HTML with consistent navigation and styling.

## Architecture

### Directory Structure
```
tdcatalyst-sail.github.io/
├── *.html                           # 13 page files (see below)
├── style.css                        # Single shared stylesheet
├── script.js                        # Minimal JavaScript (2 behaviors)
├── images/                          # Logo, headshot, field-note images, QR code
├── CNAME                            # Domain config (tdcatalyst.com)
├── robots.txt                       # SEO config
├── sitemap.xml                      # Sitemap
├── .gitignore                       # Git ignore rules
├── .gitattributes                   # Line-ending normalization
├── _private/                        # Gitignored: backend notes + Apps Script source (NOT deployed)
└── CLAUDE.md                        # This file
```

**IMPORTANT:** Everything tracked in this repo is publicly served at tdcatalyst.com by GitHub Pages. Never commit internal notes, backend source, or credentials — put them in `_private/` (gitignored).

### HTML Pages (13 total)

**Main Pages:**
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

**Color Palette (defined in `:root`):**
- `--navy` (`#1F3A5F`), `--navy-soft`: Primary text and headings
- `--charcoal` (`#222222`): Body text
- `--offwhite` (`#EBEFEC`), `--seamist`: Page backgrounds
- `--terracotta` (`#C8950A`), `--terracotta-soft`: Accent/highlight (logo gold)
- `--midgray` (`#6B6B6B`): Secondary text
- `--logo-red` (`#C44536`), `--logo-blue` (`#4A7C9E`): Logo decoration
- `--hairline` (`#D9D3CA`): Borders

**Layout & Typography:**
- **Fonts:** Fraunces (serif, weights 300/400/500) for headings; Inter (sans-serif, weights 300–600) for body
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

### Images (images/ directory)

- `logo-v2.jpg` — Main logo (used in heroes)
- `logo-og.jpg` — Social-share image referenced by every page's OG/Twitter meta tags (byte-identical copy of logo-v2.jpg under a cache-bustable name)
- `headshot.jpg` — Thomas Delaporte headshot, 800×800 (about page)
- `field-note-seams.jpg`, `field-note-adaptability.jpg`, `field-note-adoption-matrix.jpg` — Field note card/hero images
- `qr-linkedin.png` — LinkedIn QR code (contact/calling cards)

**External Images:** Unsplash CDN images are loaded with `onerror="this.style.display='none'"` fallback to hide broken images gracefully.

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
     <link rel="stylesheet" href="style.css">
   </head>
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

3. **Commit with a clear message:**
   ```bash
   git add .
   git commit -m "Add new landing page with updated hero section"
   ```

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
- `.btn-primary` — Navy bg, white text, terracotta border on hover
- `.btn-ghost` — Transparent, navy text, terracotta underline on hover
- Both use `transition: border-color 0.2s` for smooth interaction

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
