export default async function handler(req, res) {
  const { username, password } = await req.json();
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS)
    return res.json({ token: process.env.ADMIN_TOKEN });

  res.status(401).json({ error: "Invalid credentials" });
}
