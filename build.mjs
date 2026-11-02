import { cp, mkdir, readdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await mkdir('dist/san-pham/ao-ecofit', { recursive: true });
await cp('product-page.html', 'dist/san-pham/ao-ecofit/index.html');
await mkdir('dist/chat-lieu', { recursive: true });
await cp('material-page.html', 'dist/chat-lieu/index.html');
await mkdir('dist/ve-ecofit', { recursive: true });
await cp('about-page.html', 'dist/ve-ecofit/index.html');
await cp('favicon.svg', 'dist/favicon.svg');
await cp('assets', 'dist/assets', { recursive: true });
await cp('ecofit-game', 'dist/ecofit-game', { recursive: true });
await cp('ecofit-game/index.html', 'dist/ecofit-game.html');
await mkdir('dist/images', { recursive: true });
for (const file of await readdir('images')) {
  if (file.endsWith('.webp') || file === 'ecofit-logo.png') {
    await cp(`images/${file}`, `dist/images/${file}`);
  }
}
await cp('images/ecofit-tryon-generated', 'dist/images/ecofit-tryon-generated', { recursive: true });
await cp('images/ecofit-tryon-v2', 'dist/images/ecofit-tryon-v2', { recursive: true });
await cp('images/ecofit-tryon-v5', 'dist/images/ecofit-tryon-v5', { recursive: true });
await cp('images/ecofit-tryon-female-v1', 'dist/images/ecofit-tryon-female-v1', { recursive: true });
await cp('images/game', 'dist/images/game', { recursive: true });
