7TAROT — Messenger Share Fix (Combined)

What this does:
- Adds correct Open Graph + Twitter tags so Messenger/FB/X show a preview (title + image).
- Auto-cleans fbclid/utm parameters after load so the URL looks tidy.

How to use:
1) Unzip.
2) GitHub → your repo → Add file → Upload files → drag these to the repo root (overwrite your current files if you want a quick test):
   - index.html
   - assets/og-image.png
   - app.js
3) Commit → Netlify redeploys → then visit the Facebook Sharing Debugger and click "Scrape Again":
   https://developers.facebook.com/tools/debug/?q=https://super-semifreddo-edae3b.netlify.app

After the preview shows correctly, you can merge the <meta> block into your own page layout if needed and keep assets/og-image.png.
