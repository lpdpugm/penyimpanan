export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { path, name, content, token } = await req.json();
  if (token !== process.env.ADMIN_TOKEN)
    return res.status(401).json({ error: "Unauthorized" });

  if (!name || !content)
    return res.status(400).json({ error: "Filename and content required" });

  const url = `https://api.github.com/repos/lpdpugm/penyimpanan/contents/${path ? path + "/" : ""}${name}`;
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN1}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Upload ${name}`,
      content: Buffer.from(content).toString("base64"),
    }),
  });

  res.json(await r.json());
}
