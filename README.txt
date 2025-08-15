7TAROT — Messenger Display Fix (drag & drop)

Purpose: Fixes "everything looks too big" in Facebook/Instagram in-app browser by:
- Stopping text auto-zoom (text-size-adjust: 100%)
- Using a clean viewport meta
- Showing an "Open in Browser" tip inside FB/IG in-app
- Keeping your OG/Twitter meta for nice link previews
- Keeping the URL cleaner for fbclid/utm_*

How to use:
1) Unzip.
2) GitHub → your repo → Add file → Upload files → drag these to your repo root (overwrite if asked):
   - index.html
   - app.js
   - assets/og-image.png
   - assets/raffle-placeholder.png
3) Commit → Netlify redeploys.
4) Share the clean link: https://super-semifreddo-edae3b.netlify.app/
5) If Messenger still shows an old preview, go to the Facebook Sharing Debugger and "Scrape Again".
