# Khilco Holdings, LLC — website

A single, dependency-free static page (`index.html`, styles inline) for the
Khilco Holdings, LLC investor-facing site. No build step required.

## Preview locally

```bash
cd holding-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Any static host works — drag-and-drop the `holding-site` folder into
Netlify or Vercel, or serve it from GitHub Pages / an S3 + CloudFront
bucket. There's no build command; the entry point is `index.html`.

## Before this goes live, replace the placeholders

Search the file for bracketed text and the dashed "Reserved for portfolio
venture" cards, and replace with real information:

- **Contact email** — the `[ add your contact email ]` line and the
  `invest@khilcoholdings.com` investor address (currently a placeholder).
- **Registered office address.**
- **Portfolio ventures** — CarFlip OS is filled in as the one real,
  verifiable venture. The Operations / Consumer / Service cards are empty
  placeholders; either fill them in with real ventures or remove the cards.
- **Stats row** in the hero (venture count, active ventures, raise year) —
  update as those numbers change.
- Any claims about funding stage, use of funds, or financials should be
  reviewed against what you're actually prepared to represent to investors
  — this is marketing copy, not a substitute for your deck, financials, or
  legal disclosures.
