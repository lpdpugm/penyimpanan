// api/delete.js
const REPO_OWNER = "lpdpugm";
const REPO_NAME = "penyimpanan";
const BRANCH = "main";

function encodePathForApi(p) {
  if (!p) return "";
  return p.split("/").map(encodeURIComponent).join("/");
}

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Only DELETE allowed" });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: "Missing GITHUB_TOKEN1" });
  if (!ADMIN_TOKEN) return res.status(500).json({ error: "Missing ADMIN_TOKEN" });

  const { path, token } = req.body || {};
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  if (!path) return res.status(400).json({ error: "path required" });

  const cleanPath = String(path).replace(/^\/*/, "").replace(/\/+$/,"");
  const encoded = encodePathForApi(cleanPath);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encoded}`;

  try {
    const check = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } });
    if (!check.ok) {
      const txt = await check.text();
      return res.status(check.status).json({ error: txt });
    }
    const js = await check.json();
    const payload = { message: `delete ${cleanPath}`, sha: js.sha, branch: BRANCH };

    const r = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
