// api/upload.js
const REPO_OWNER = "lpdpugm";
const REPO_NAME = "penyimpanan";
const BRANCH = "main";

function encodePathForApi(p) {
  if (!p) return "";
  return p.split("/").map(encodeURIComponent).join("/");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!GITHUB_TOKEN) return res.status(500).json({ error: "Missing GITHUB_TOKEN1" });
  if (!ADMIN_TOKEN) return res.status(500).json({ error: "Missing ADMIN_TOKEN" });

  const body = req.body || {};
  const { path = "", filename, content, token } = body;

  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  if (!filename || !content) return res.status(400).json({ error: "filename and content required" });

  const cleanPath = String(path).replace(/^\/*/, "").replace(/\/+$/,"");
  const filePath = cleanPath ? `${cleanPath}/${filename}` : filename;
  const encoded = encodePathForApi(filePath);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encoded}`;

  const headers = { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" };

  try {
    // check existing file to get sha (for update)
    const check = await fetch(url, { headers });
    let sha;
    if (check.ok) {
      const js = await check.json();
      sha = js.sha;
    }

    const payload = {
      message: sha ? `update ${filename}` : `upload ${filename}`,
      content, // already base64
      branch: BRANCH,
      ...(sha && { sha }),
    };

    const r = await fetch(url, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
