// api/auth.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_TOKEN) return res.status(500).json({ error: "Admin credentials not configured" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ token: ADMIN_TOKEN });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
}
