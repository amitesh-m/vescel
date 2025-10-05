// /api/jup.js  — Vercel Edge Function
export const config = { runtime: 'edge' };

const ORIGIN = 'https://wealthville.net'; // use "*" temporarily if you need

export default async function handler(req) {
  const url = new URL(req.url);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ORIGIN,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Forward query to Jupiter
  const upstream = 'https://quote-api.jup.ag/v6/quote' + url.search;

  try {
    const r = await fetch(upstream, {
      // avoid caching and help some network setups
      cache: 'no-store',
      headers: {
        'accept': 'application/json',
        'user-agent': 'WealthVilleProxy/1.0 (+wealthville.net)'
      }
    });

    const text = await r.text(); // pass-through raw body
    return new Response(text, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': ORIGIN,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'max-age=15'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': ORIGIN
      }
    });
  }
}
