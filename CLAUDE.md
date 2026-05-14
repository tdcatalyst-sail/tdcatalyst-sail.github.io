# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

**After making changes and pushing to a feature branch, always create a pull request to merge into `main`.** This is a GitHub Pages site deployed from the main branch. Changes are live only after merging to main.

## Project Overview

This is a static HTML website with no build process. All pages are hand-authored HTML files. The site is hosted on GitHub Pages.

## Architecture

**Pages:** Individual `.html` files (index.html, sessions.html, about.html, etc.). Each is a complete, self-contained page with its own `<head>` and navigation.

**Styles:** Single `style.css` file using CSS custom properties (CSS variables) for the design system. The color palette is defined in `:root`:
- `--navy`, `--charcoal`: text and primary colors
- `--offwhite`, `--seamist`: backgrounds
- `--terracotta`, `--terracotta-soft`: accent/highlight color (logo yellow)
- `--logo-red`, `--logo-blue`: used in logo decoration elements

**JavaScript:** Minimal `script.js` handles two features:
1. Showing a confirmation banner when a form is submitted (detects `?sent=1` query param)
2. Auto-hiding the nav on scroll down and revealing it on scroll up

**Images:** Stored in `images/` directory. Unsplash images are loaded via CDN with `onerror="this.style.display='none'"` fallback.

## Common Tasks

- **Adding/editing a page:** Create or edit an `.html` file. Follow the existing template: navigation section, main content sections with `.wrap` container for layout, footer. Use semantic section tags.
- **Styling changes:** Add or modify rules in `style.css`. Reuse CSS variables for colors and spacing.
- **Content updates:** Edit text directly in HTML files. Look for section comments like `<!-- HERO -->` to find sections quickly.
- **Removing sections:** Delete the entire `<section>` block and its comment header.

## Design System Notes

- Typography: Fraunces (serif) for headings, Inter (sans-serif) for body text
- Layout: `.wrap` class provides max-width container (1180px), `.narrow` variant for tighter width
- Sections alternate between white and off-white backgrounds using `.alt` class
- Colors via CSS custom properties—always use variables, never hardcode hex values
- Responsive: Uses `clamp()` for fluid typography sizing

## GitHub Pages Deployment

The site deploys from the `main` branch via GitHub Pages. The CNAME file points to `tdcatalyst.com`. All HTML, CSS, and JS must be production-ready before merging to main.
