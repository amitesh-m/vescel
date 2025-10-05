// Runtime: Node.js on Vercel (not Edge)
import { fetch } from 'undici'; // Node 18+ built-in via undici

const ORIGIN = 'https://wealthville.net'; // use "*" temporarily if you need

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Build upstream URL
  const base = 'https://quote-api.jup.ag/v6/quote';
  const u = new URL(req.url, 'http://x'); // dummy base for parsing
  const upstream = `${base}?${u.searchParams.toString()}`;

  try {
    // Avoid any caching layers
    const r = await fetch(upstream, {
      headers: { 'accept': 'application/json', 'user-agent': 'WealthVilleProxy/1.0' },
      // undici ignores this flag, but keeping explicit for intention
      cache: 'no-store'
    });

    const body = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
