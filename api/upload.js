// api/upload.js
// Backend for listing, uploading, creating folder, deleting files/folders
export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;
  const REPO_OWNER = "lpdpugm";
  const REPO_NAME = "penyimpanan";
  const BRANCH = "main";

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "Missing GITHUB_TOKEN1 in environment variables" });
  }

  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };

  // ---------- GET: list contents ----------
  if (req.method === "GET") {
    const { path = "" } = req.query;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`;
    try {
      const r = await fetch(apiUrl, { headers });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).json({ error: text });
      return res.status(200).send(text); // already JSON
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------- POST: upload file ----------
  // body: { path (optional folder), filename, content (base64) }
  if (req.method === "POST") {
    const { path = "", filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: "filename and content required" });

    const filePath = path ? `${path}/${filename}` : filename;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
    try {
      // check existing
      const check = await fetch(url, { headers });
      const exists = check.status === 200;
      const sha = exists ? (await check.json()).sha : undefined;

      const payload = {
        message: exists ? `update ${filename}` : `upload ${filename}`,
        content,
        branch: BRANCH,
        ...(sha && { sha }),
      };

      const upload = await fetch(url, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await upload.json();
      if (!upload.ok) return res.status(upload.status).json(result);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------- PUT: create folder ----------
  // body: { path (optional), folderName }
  if (req.method === "PUT") {
    const { path = "", folderName } = req.body;
    if (!folderName) return res.status(400).json({ error: "folderName required" });

    // create a .keep file so folder exists
    const folderPath = path ? `${path}/${folderName}/.keep` : `${folderName}/.keep`;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderPath}`;

    const payload = {
      message: `create folder ${folderName}`,
      content: Buffer.from("").toString("base64"),
      branch: BRANCH,
    };

    try {
      const r = await fetch(url, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------- DELETE: delete file ----------
  // body: { path }  (path is full path to file e.g. folder/file.pdf)
  if (req.method === "DELETE") {
    const { path } = req.body;
    if (!path) return res.status(400).json({ error: "path required" });

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    try {
      // need sha to delete
      const check = await fetch(url, { headers });
      if (!check.ok) {
        const txt = await check.text();
        return res.status(check.status).json({ error: txt });
      }
      const data = await check.json();
      const sha = data.sha;
      const payload = {
        message: `delete ${path}`,
        sha,
        branch: BRANCH,
      };
      const r = await fetch(url, {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await r.json();
      if (!r.ok) return res.status(r.status).json(resData);
      return res.status(200).json(resData);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} not allowed`);
}
