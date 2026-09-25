# Vaughn's Tattoos

Portfolio website for **Vaughn Raffty L.** (VLR Inks), a tattoo artist in Peoria,
Illinois. It showcases his work in four styles—Anime/Illustrative, Traditional,
Black & Gray, and Line Work—explains the booking process, and accepts
appointment requests via a Tally form.

Live: <https://www.vaughnstattoos.com>

## Stack

Flat HTML, CSS, and JavaScript. **No build, no dependencies to install.**

- **GSAP 3.13** from a CDN for all animation (ScrollTrigger, ScrollSmoother,
  SplitText, Flip, Observer, DrawSVG, CustomEase).
- **Tally** for the booking form (embedded as an iframe).
- Responsive WebP images (800w / 1600w) under `images/optimized/`.


## Structure

```
index.html      The site’s 5 pages, one after another
404.html        Copy of index.html (see note below)
style.css       All styles
js/
  core.js       Cursor, menu, magnetic buttons, smooth scrolling
  pages.js      Animation for each page
  app.js        Router, transitions, and preloader
images/
  optimized/    What the site actually serves
prototypes/     Design explorations; not part of the site
```

It is a single page with real routes: `/`, `/about`, `/styles`, `/booking`, and
`/book`. The router intercepts clicks and switches pages without reloading.


---

Design and development: [Maximiliano Arvizu](https://www.linkedin.com/in/maximiliano-f-arvizu-villarreal/)


Translated with DeepL.com (free version)
