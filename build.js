// Vercel 빌드 때 실행: src/ 를 public/ 으로 복사하면서 __ORIGIN__ 을 실제 주소로 바꿉니다.
const fs = require("fs"), path = require("path");
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
const origin = host ? "https://" + host : "";
const out = path.join(__dirname, "public");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(path.join(__dirname, "src"))) {
  const from = path.join(__dirname, "src", f), to = path.join(out, f);
  if (f.endsWith(".html")) fs.writeFileSync(to, fs.readFileSync(from, "utf8").replace(/__ORIGIN__/g, origin));
  else fs.copyFileSync(from, to);
}
console.log("built, origin =", origin || "(relative)");
