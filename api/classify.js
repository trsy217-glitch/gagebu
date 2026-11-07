// 가게부 자동 분류: 브라우저 -> 이 함수 -> Anthropic API
// 환경변수: ANTHROPIC_API_KEY (필수), ACCESS_CODE (선택, 접속 코드), CLAUDE_MODEL (선택)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  const need = process.env.ACCESS_CODE;
  if (need && req.headers["x-access-code"] !== need) return res.status(401).json({ error: "auth" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY가 설정되지 않았어요" });

  const { prompt, image } = req.body || {};
  if (typeof prompt !== "string" || !prompt || prompt.length > 6000) return res.status(400).json({ error: "bad prompt" });

  const content = [];
  if (image) {
    if (typeof image !== "string" || image.length > 5000000) return res.status(413).json({ error: "image too large" });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } });
  }
  content.push({ type: "text", text: prompt });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
        max_tokens: 1024,
        messages: [{ role: "user", content }],
      }),
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream " + r.status });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "network" });
  }
};
