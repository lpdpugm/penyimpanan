export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const { path, sha, token } = await req.json();
  if (token !== process.env.ADMIN_TOKEN)
    return res.status(401).json({ error: "Unauthorized" });

  const url = `https://api.github.com/repos/lpdpugm/penyimpanan/contents/${path}`;
  const r = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN1}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: `Delete ${path}`, sha }),
  });

  res.json(await r.json());
}
