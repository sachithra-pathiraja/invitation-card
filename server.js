const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 5500;
const host = "127.0.0.1";
const publicDir = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".properties": "text/plain; charset=utf-8",
};

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
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/invitation-card\/?/, "");

  if (!cleanPath || cleanPath === "index.html" || !path.extname(cleanPath)) {
    sendFile(response, path.join(publicDir, "index.html"));
    return;
  }

  sendFile(response, path.join(publicDir, cleanPath));
});

server.listen(port, host, () => {
  console.log(`Invitation card running at http://${host}:${port}/invitation-card/Guest`);
});
