export function safeReturnPath(value, origin) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/shop/';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.pathname.startsWith('/tai-khoan')) return '/shop/';
    return url.pathname + url.search + url.hash;
  } catch { return '/shop/'; }
}

// Only a public browser key may be included in the static build.
export function publicAuthConfig(env) {
  const url = env.SUPABASE_URL?.trim();
  const key = (env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return { configured: false };
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error('SUPABASE_URL must be an HTTPS project origin.');
  }
  let isPublic = key.startsWith('sb_publishable_');
  if (!isPublic && key.split('.').length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
      isPublic = payload.role === 'anon';
    } catch {}
  }
  if (!isPublic) throw new Error('Use the Supabase publishable or anon key. Secret and service-role keys cannot be published.');
  return { configured: true, url: parsed.origin, key };
}
