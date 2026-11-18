import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { publicAuthConfig } from './assets/ecofit-account-model.js';

const authConfig = publicAuthConfig(process.env);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('shop', 'dist/shop', { recursive: true });
await cp('gio-hang', 'dist/gio-hang', { recursive: true });
await cp('tai-khoan', 'dist/tai-khoan', { recursive: true });
await mkdir('dist/san-pham/ao-ecofit', { recursive: true });
await cp('product-page.html', 'dist/san-pham/ao-ecofit/index.html');
await mkdir('dist/chat-lieu', { recursive: true });
await cp('chat-lieu', 'dist/chat-lieu', { recursive: true });
await cp('material-page.html', 'dist/chat-lieu/index.html');
await mkdir('dist/ve-ecofit', { recursive: true });
await cp('about-page.html', 'dist/ve-ecofit/index.html');
await cp('favicon.svg', 'dist/favicon.svg');
await cp('assets', 'dist/assets', { recursive: true });
await writeFile('dist/assets/ecofit-auth-config.json', JSON.stringify(authConfig));
await build({
  entryPoints: ['assets/ecofit-account.js'],
  outfile: 'dist/assets/ecofit-account.js',
  bundle: true, format: 'esm', platform: 'browser', target: ['es2022'], minify: true,
});
await cp('ecofit-game', 'dist/ecofit-game', { recursive: true });
await cp('ecofit-game/index.html', 'dist/ecofit-game.html');
await cp('vong-quay', 'dist/vong-quay', { recursive: true });
await mkdir('dist/images', { recursive: true });
for (const file of await readdir('images')) {
  if (file.endsWith('.webp') || file === 'ecofit-logo.png' || file.startsWith('ecofit-icon-')) {
    await cp(`images/${file}`, `dist/images/${file}`);
  }
}
await cp('images/ecofit-tryon-generated', 'dist/images/ecofit-tryon-generated', { recursive: true });
await cp('images/ecofit-tryon-v2', 'dist/images/ecofit-tryon-v2', { recursive: true });
await cp('images/ecofit-tryon-v5', 'dist/images/ecofit-tryon-v5', { recursive: true });
await cp('images/ecofit-tryon-female-v1', 'dist/images/ecofit-tryon-female-v1', { recursive: true });
await cp('images/ecofit-fit-custom', 'dist/images/ecofit-fit-custom', { recursive: true });
await cp('images/game', 'dist/images/game', { recursive: true });
