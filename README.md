# Lumina — landing site

Static marketing site for **Lumina**, the bucket-matched dating product.
No build step: plain HTML, CSS and vanilla JS, so there is nothing to
compile and nothing to break in CI.

| File | What it is |
| --- | --- |
| `index.html` | The whole page — every section is semantic HTML |
| `styles.css` | Dark "crazy UI" design system: aurora, grain, glass, gradient text |
| `script.js` | Reveal-on-scroll, custom cursor, canvas particle field, 3D tilt, bucket rendering, form validation |
| `404.html` | GitHub Pages 404 page |

## Local preview

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy

Push to `main`. `.github/workflows/pages.yml` publishes the repo root to
GitHub Pages on every push. The repo's **Settings → Pages → Source** must
be set to **GitHub Actions** once, before the first deploy succeeds.

## Content source of truth

Feature copy and numbers are taken from the backend repo
([`Taxonomy-dating/Service`](https://github.com/Taxonomy-dating/Service)):

- `PLAN.md` — thesis, personas, the 10 buckets, privacy contract, pricing
- `ARCHITECTURE.md` — scoring weights, RLS model, LLM bounds

Re-check those before editing numbers here. The scoring weights
(35/25/25/15), the ±5% LLM nudge bound, the 128-dimension vector, the
30-question quiz, and the ten bucket names are all specific and
verifiable — don't paraphrase them into something vaguer.
