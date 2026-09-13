import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const port = Number(process.env.PORT || 4173);
try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error("First build the app: npm install && npm run build");
  process.exit(1);
}
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};
const server = http.createServer(async (req, res) => {
  try {
    let name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (name === "/") name = "/index.html";
    const path = resolve(root, "." + name);
    if (!path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} is already in use. Try opening http://localhost:${port}`
      : error.message,
  );
  process.exit(1);
});
server.listen(port, "0.0.0.0", () => {
  console.log(`Alf Baa is ready: http://localhost:${port}`);
  for (const addresses of Object.values(networkInterfaces()))
    for (const address of addresses || [])
      if (address.family === "IPv4" && !address.internal)
        console.log(
          `Phone on the same Wi-Fi: http://${address.address}:${port}`,
        );
  console.log("Keep this window open while playing. Press Ctrl+C to stop.");
});
