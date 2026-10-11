# SONA 2026 × SDG 2030 — Congressional Executive Dashboard

Interactive briefing for the Speaker of the House, built from the SONA 2026 summary. Static HTML/CSS/JS, no build step or dependencies.

- `index.html` — interactive site (SDG explorer, findings filter, congressional action map, accountability lens, Youth Agenda cross-check)
- `presentation.html` — one-screen 16:9 dashboard (prints to a single page)
- `SONA2026_SDG_Dashboard.pdf` / `.png` — exports of the presentation view
- `assets/` — `data.js` (all content), `app.js`, `style.css`

## Deploy (GitHub Pages)
Settings → Pages → Source: **GitHub Actions**. The workflow in `.github/workflows/pages.yml` then publishes on every push to `main`.
Preview locally: `python3 -m http.server` and open http://localhost:8000.

All figures are statements made in the address (unverified). SDG progress is rated "Insufficient Data" because the summary has no baselines or targets; PSA / UN SDG Database / VNR data are not yet incorporated.
