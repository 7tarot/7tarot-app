// --- Clean tracking params from URL (fbclid, gclid, utm_*) ---
(() => {
  try {
    const u = new URL(location.href);
    const p = u.searchParams;
    const keys = ['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    let changed = false;
    keys.forEach(k => { if (p.has(k)) { p.delete(k); changed = true; }});
    if (changed) {
      const newUrl = u.origin + u.pathname + (p.toString() ? '?' + p : '') + location.hash;
      history.replaceState(null, '', newUrl);
    }
  } catch {}
})();
// --------------------------------------------------------------

// (No other app code needed for the share fix; keep your existing app.js if you like)
