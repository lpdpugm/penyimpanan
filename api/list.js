export default async function handler(req, res) {
  const path = req.query.path || "";
  const githubToken = process.env.GITHUB_TOKEN1;

  const url = `https://api.github.com/repos/lpdpugm/penyimpanan/contents/${path}?ref=main`;
  const r = await fetch(url, { headers: { Authorization: `token ${githubToken}` } });

  if (!r.ok) return res.status(r.status).json(await r.json());
  const data = await r.json();

  // filter root
  const filtered = (path === "")
    ? data.filter(item => !item.name.startsWith(".")
        && item.name !== "index.html"
        && item.name !== "login.html"
        && item.name !== "style.css"
        && item.name !== "script.js"
        && item.name !== "api")
    : data;

  res.json(filtered);
}
