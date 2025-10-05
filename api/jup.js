export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://wealthville.net'); // or "*"
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const base = 'https://quote-api.jup.ag/v6/quote';
  const u = new URL(req.url, 'http://x'); // dummy base to parse
  const upstream = `${base}?${u.searchParams.toString()}`;

  try {
    const r = await fetch(upstream);
    const text = await r.text();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
