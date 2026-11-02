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
- `/ecofit-game/`: Xưởng vòng đời mới, with five stations: cân, lọc, kéo, dệt and may.
- `/ecofit-game.html`: compatibility entry for the same workshop game.

The game is plain JavaScript/CSS under `ecofit-game/`, with images in `images/game/`.
