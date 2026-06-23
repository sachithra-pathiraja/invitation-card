const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicDir = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".properties": "text/plain; charset=utf-8",
  ".avif": "image/avif",
  ".png": "image/png",
};

function isSafePath(filePath) {
  const normalizedPath = path.normalize(filePath);
  return normalizedPath === publicDir || normalizedPath.startsWith(`${publicDir}${path.sep}`);
}

function sendFile(response, filePath) {
  const extension = path.extname(filePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = decodeURIComponent(url.pathname)
    .replace(/^\/invitation-card\/?/, "")
    .replace(/^\/+/, "");

  if (!cleanPath || cleanPath === "index.html" || !path.extname(cleanPath)) {
    sendFile(response, path.join(publicDir, "index.html"));
    return;
  }

  const filePath = path.join(publicDir, cleanPath);

  if (!isSafePath(filePath)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  sendFile(response, filePath);
});

server.listen(port, host, () => {
  console.log(`Invitation card running on ${host}:${port}`);
  console.log(`Try http://localhost:${port}/invitation-card/Guest`);
});
