
7TAROT — Drag & Drop Storefront (with Raffle)

Files:
- index.html
- app.js
- assets/raffle-placeholder.png  (small image you can replace any time)

How to publish:
1) GitHub → your repo → Add file → Upload files
2) Drag index.html, app.js, and the assets folder into the repo root
3) Commit — Netlify redeploys — hard refresh your site

Raffle config (optional):
Open app.js and edit the RAFFLE block at the very top:
  url:   your Raffall link
  title: your raffle title
  endsAt: 'YYYY-MM-DDTHH:MM:SS+01:00' (or leave blank to show 'Ends soon')
  image: path to your image (e.g., assets/raffle-placeholder.png)
