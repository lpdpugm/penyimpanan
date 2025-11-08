// api/upload.js
export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;
  const REPO_OWNER = "lpdpugm";
  const REPO_NAME = "penyimpanan";
  const BRANCH = "main";

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "Token tidak ditemukan di environment variable (GITHUB_TOKEN1)" });
  }

  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };

  // --- GET: List file/folder ---
  if (req.method === "GET") {
    const { path = "" } = req.query;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`;

    try {
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- POST: Upload file ---
  if (req.method === "POST") {
    const { path, filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: "filename dan content wajib diisi" });
    }

    const filePath = path ? `${path}/${filename}` : filename;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

    try {
      // Cek apakah file sudah ada
      const check = await fetch(url, { headers });
      const exists = check.status === 200;
      const sha = exists ? (await check.json()).sha : null;

      const payload = {
        message: exists ? `update ${filename}` : `upload ${filename}`,
        content: content,
        branch: BRANCH,
        ...(sha && { sha }),
      };

      const upload = await fetch(url, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await upload.json();
      return res.status(upload.status).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- Buat Folder Baru (opsional) ---
  if (req.method === "PUT") {
    const { path, folderName } = req.body;
    const folderPath = path ? `${path}/${folderName}/.keep` : `${folderName}/.keep`;

    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderPath}`;
      const payload = {
        message: `buat folder ${folderName}`,
        content: Buffer.from("").toString("base64"),
        branch: BRANCH,
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  res.status(405).end(`Method ${req.method} not allowed`);
}
