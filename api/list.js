// api/list.js
const REPO_OWNER = "lpdpugm";
const REPO_NAME = "penyimpanan";
const BRANCH = "main";

function encodePathForApi(p) {
  // preserve slashes but encode components
  if (!p) return "";
  return p.split("/").map(encodeURIComponent).join("/");
}

export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: "Missing GITHUB_TOKEN1" });

  const pathRaw = req.query.path ? String(req.query.path).replace(/^\/*/, "").replace(/\/*$/,"") : "";
  const apiPath = encodePathForApi(pathRaw);
  const apiUrl = apiPath
    ? `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${apiPath}?ref=${BRANCH}`
    : `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents?ref=${BRANCH}`;

  try {
    const r = await fetch(apiUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);
    const data = JSON.parse(text);

    if (!pathRaw) {
      // hide internal / top-level web files
      const hide = new Set(["api", "index.html", "login.html", "README.md", ".gitignore", "style.css", "script.js", "favicon.ico"]);
      return res.status(200).json(data.filter(item => !hide.has(item.name)));
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
