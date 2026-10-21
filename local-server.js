const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((request, response) => {
  const pathname = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]);
  const filename = path.join(process.cwd(), pathname);
  fs.readFile(filename, (error, content) => {
    response.writeHead(error ? 404 : 200);
    response.end(error ? 'Not found' : content);
  });
}).listen(8080);
