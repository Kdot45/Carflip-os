# Khilco Holdings, LLC — website

A standalone, dependency-free static site (`index.html` + `assets/`) for the
Khilco Holdings, LLC homepage. No build step, no framework — plain HTML/CSS/JS.
Lives entirely inside `holding-site/` and does not touch CarFlip OS.

Design direction: near-black charcoal base, off-white type, one electric-lime
accent used sparingly. The page is built as an arc — **pressure → clarity →
momentum → possibility** — across four sections: Hero, Foundation, Momentum,
Future/Contact.

## Preview locally

```bash
cd holding-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Any static host works — Netlify, Vercel, GitHub Pages, or an S3 + CloudFront
bucket. Entry point is `index.html`; everything else lives under `assets/`.

## Structure

- `index.html` — markup and copy
- `assets/styles.css` — design tokens (top of file: `:root`) and all styling
- `assets/script.js` — scroll-reveal, header-on-scroll, and a subtle hero
  parallax; all guarded behind `prefers-reduced-motion`

## Before this goes live

Both contact-panel emails currently point to `kavidharris@khilco.com`
(general inquiries and partnerships/investors share the one address given
so far). If you want a separate investor-relations inbox later, split the
second `mailto:` link in `index.html`'s `#contact` panel.

## What's real vs. placeholder in the copy

- **CarFlip OS** is the one real, verifiable venture and is named directly
  in the Momentum section.
- The Operations / Consumer / Service cards are intentionally empty
  ("Reserved" / "Pipeline") — no other ventures, funding, history, or
  performance claims have been invented. Fill these in only when there's a
  real venture to name.
- The founder-note pull-quote in the Foundation section is the line you
  provided; it's presented unattributed by design (no name was given to
  sign it with). Add a name/title there if you want it signed.

## Retinting / restyling

All color, spacing, and font tokens are CSS custom properties at the top of
`assets/styles.css` (`:root`). Swap `--accent` for a different accent color
(the brief's other options were deep cobalt or warm amber) without touching
markup.
