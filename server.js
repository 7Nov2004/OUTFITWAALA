// ========================================================
// OutfitWaala - Local Fast Development Server
// ========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse URL & remove query params
  let parsedUrl = req.url.split('?')[0];
  if (parsedUrl === '/') {
    parsedUrl = '/index.html';
  } else if (parsedUrl === '/admin' || parsedUrl === '/admin/') {
    parsedUrl = '/admin/login.html';
  }

  // Safe file path resolution
  const safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h1 style="color: #e11d48;">404 - Page Nahi Mila</h1>
          <p>Aap jis page ko dhoondh rahe hain wo maujood nahi hai.</p>
          <a href="/" style="color: #2563eb; font-weight: bold;">← Homepage Par Jayein</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log('👑  OUTFITWAALA - LUXURY STORE SERVER LIVE HAI!  👑');
  console.log('✨  DEVELOPED BY: AJ STUDIO BY AAYUSH JAIWAL     ✨');
  console.log('======================================================');
  console.log(`\n🛍️  Customer Website : http://localhost:${PORT}`);
  console.log(`👔  Dukandar Studio  : http://localhost:${PORT}/admin/login.html`);
  console.log(`📦  Admin Dashboard  : http://localhost:${PORT}/admin/dashboard.html`);
  console.log('\n🔑  Admin Login ID   : admin');
  console.log('🔑  Admin Password   : admin123');
  console.log('\n👉  Server band karne ke liye: Ctrl + C dabayein');
  console.log('======================================================\n');

  // Auto-open browser in Windows
  const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${startCmd} http://localhost:${PORT}`);
});
