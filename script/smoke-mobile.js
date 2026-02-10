// scripts/smoke-mobile.js
import http from "http";

const url = process.env.SMOKE_URL || "http://localhost:3000";

http.get(url, (res) => {
  const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 400;
  if (!ok) {
    console.error(`Smoke failed: ${url} -> ${res.statusCode}`);
    process.exit(1);
  }
  console.log(`Smoke passed: ${url} -> ${res.statusCode}`);
  process.exit(0);
}).on("error", (err) => {
  console.error(`Smoke error: ${err.message}`);
  process.exit(1);
});
