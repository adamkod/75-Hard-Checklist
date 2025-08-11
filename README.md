75 Hard Checklist - Static Web App
==================================

What you get
- Single-page web app (HTML/CSS/JS) that stores progress locally (localStorage).
- Track 75 days, mark tasks, upload progress photos, add notes, export CSV.
- Easy to host: GitHub Pages, Netlify, Vercel, or any static host.

How to use
1. Unzip the package and open index.html in your browser.
2. Or deploy the files to GitHub Pages:
   - Create a new repository and push these files.
   - In repository settings > Pages, set branch to main (or gh-pages) and folder root.
3. Use "Export CSV" to backup progress. Photos are saved as data URLs in localStorage.

Limitations & next steps
- This is client-side only; data is stored in the browser. If you want cross-device sync or accounts, a backend (e.g., Firebase) is needed.
- Could add daily reminders, progress analytics, authentication, or an official PWA manifest & service worker.

License: MIT
