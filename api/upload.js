export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { path, content } = req.body;
  if (!path || !content) return res.status(400).json({ message: 'Invalid request' });

  try {
    const githubToken = process.env.GITHUB_TOKEN1; // simpan di Vercel Environment Variable
    const owner = 'lpdpugm';
    const repo = 'penyimpanan';
    const branch = 'main';

    // Cek apakah file sudah ada
    const check = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `token ${githubToken}` },
    });
    const existing = check.status === 200 ? await check.json() : null;

    // Upload atau update file
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: existing ? `Update ${path}` : `Add ${path}`,
        content,
        sha: existing?.sha,
        branch,
      })
    });

    if (!response.ok) throw new Error(`GitHub upload failed: ${response.status}`);
    return res.status(200).json({ message: 'File berhasil diunggah ke GitHub.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}
