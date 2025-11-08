// /api/upload.js
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  const { path, content, message } = req.body;
  if (!path || !content)
    return res.status(400).json({ error: "Missing file path or content" });

  const token = process.env.GITHUB_TOKEN1; // ✅ pakai GITHUB_TOKEN1
  const repo = "penyimpanan";
  const owner = "lpdpugm";

  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // cek file lama
  const getResp = await fetch(getUrl);
  const fileData = getResp.ok ? await getResp.json() : null;
  const sha = fileData?.sha;

  const uploadResp = await fetch(getUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message || `upload: ${path}`,
      content,
      sha,
      branch: "main",
    }),
  });

  const result = await uploadResp.json();
  if (!uploadResp.ok) return res.status(400).json(result);

  return res.json({ message: "✅ Upload sukses", result });
}
