# Ecofit storefront

Production source for [ecofitvietnam.com](https://ecofitvietnam.com), including the product page and the Ecofit workshop game.

## Local development and deployment

Run these commands from this directory (`recovered-site`):

```sh
npm install
npm run dev
npm run test:logic
npm run build
npm run preview
npm run deploy
```

`build.mjs` creates the static `dist/` output for Vercel. The storefront keeps its existing page bundle and Ecofit presentation layers under `assets/`.

## Routes

- `/`: Ecofit storefront.
- `/san-pham/ao-ecofit/`: product and cart.
- `/chat-lieu/`: Bamboo Prime material story.
- `/ve-ecofit/`: Ecofit brand story and contact links.
- `/ecofit-game/`: Xưởng vòng đời mới, with five stations: cân, lọc, kéo, dệt and may.
- `/ecofit-game.html`: compatibility entry for the same workshop game.

The game is plain JavaScript/CSS under `ecofit-game/`, with images in `images/game/`.

## Material and brand pages

`material-page.html` and `about-page.html` share `assets/ecofit-content.css` and `assets/ecofit-content.js`. They use the supplied numbered background images as full scene backgrounds, with separate shirt/fabric assets layered above them.

The content layer has one-time intersection reveals, scroll-linked parallax, a reading progress indicator, and a keyboard-accessible material image explorer. Motion is reduced on mobile, stops when the page is hidden, and respects `prefers-reduced-motion`. It adds no animation library or continuous render loop.

Motion references: [Chrome motion guidance](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion) and [MDN reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
