7TAROT — Restore Tip Jar + Matrix Rain + In‑App Browser Tip (drag & drop)

What this adds
- Tip Jar section (PayPal button wired to your donation link)
- Matrix rain background
- Top tip bar inside Facebook/Instagram in‑app with an **Open in Browser** button and **Copy Link** fallback
- URL cleaner that removes fbclid/utm_*

How to use
1) Unzip.
2) GitHub → your repo → Add file → Upload files → drag **index.html** and **app.js** to the repo root (overwrite).
3) Commit → Netlify redeploys.
4) Refresh on your phone.

Note: iOS in‑app browsers can’t auto‑open Safari directly; the button tries native Share first, then opens a new tab and shows instructions. The Copy button is a guaranteed fallback.
