# Oluwadara Akinyemi · portfolio site

Plain HTML, CSS and JavaScript. No build step. Open `index.html` in a browser to preview.

## Quick edits
- **Book a call link**: open `script.js` and replace the `BOOKING_URL` on line 2 with your Calendly or Cal.com link.
- **Testimonials**: in `index.html`, find the `testimonials` section, copy the commented-out `<figure class="quote">` block once per quote, fill it in, and delete the word `hidden` from the `<section ... id="testimonials" hidden>` line.
- **Images**: all illustrations in `assets/` were generated with Higgsfield. Your photo is `assets/oluwadara.jpg` (from GitHub).
- **Social share image**: `assets/share.jpg`. After you publish, change the two `assets/share.jpg` lines near the top of `index.html` to the full address (e.g. `https://your-name.netlify.app/assets/share.jpg`) so LinkedIn and WhatsApp previews show it.

## Publishing
The site lives in a GitHub repository that is linked to the Netlify project `darlex24`. Every push to the `main` branch publishes automatically to https://darlex24.netlify.app within a minute or two. Keep the repository public: on Netlify's free plan, deploys from a private repository are blocked when a commit comes from anyone other than the account owner. `netlify.toml` tells Netlify there is no build step and to publish this folder as is. No more dragging folders.

## The HQ hero and music
- The hero drawing is `assets/hq.svg`, a coded illustration (no image credits used). The name on the rooftop sign is real text in `index.html` (class `neon`).
- Background music is made live in the browser by `script.js` (no audio file). It only starts when a visitor taps the speaker button, because browsers block autoplaying sound.
