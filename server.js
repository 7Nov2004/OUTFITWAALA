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
  const rawUrl = req.url.split('?')[0].trim();
  const lowerUrl = rawUrl.toLowerCase();

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // 1. Instant 302 redirect for any admin entry
  if (
    (lowerUrl === '/admin' || lowerUrl === '/admin/' || lowerUrl.startsWith('/admin?') || lowerUrl === '/login') &&
    !lowerUrl.includes('login.html')
  ) {
    res.writeHead(302, { 'Location': '/admin/login.html' });
    return res.end();
  }

  // 2. Route aliases
  let parsedUrl = rawUrl;
  if (lowerUrl === '' || lowerUrl === '/') {
    parsedUrl = '/index.html';
  } else if (lowerUrl === '/admin/dashboard' || lowerUrl === '/dashboard') {
    parsedUrl = '/admin/dashboard.html';
  } else if (lowerUrl === '/products') {
    parsedUrl = '/products.html';
  } else if (lowerUrl === '/cart') {
    parsedUrl = '/cart.html';
  } else if (lowerUrl === '/contact') {
    parsedUrl = '/contact.html';
  }

  // 3. Safe file path resolution
  const safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  // If path is a directory (e.g. /admin/), serve login.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    if (fs.existsSync(path.join(filePath, 'login.html'))) {
      filePath = path.join(filePath, 'login.html');
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // If file doesn't exist, try appending .html
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif, system-ui; text-align: center; padding: 70px 20px; background: #faf7f2; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="font-size: 3.5rem; margin-bottom: 10px;">👑</div>
          <h1 style="color: #0f172a; font-size: 2.2rem; font-weight: 800; margin-bottom: 8px;">OutfitWaala Navigation</h1>
          <p style="color: #64748b; font-size: 1rem; margin-bottom: 25px;">Aapne jo URL kholi (<code>${req.url}</code>) wo yahan uplabdh nahi hai.</p>
          <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;">
            <a href="/" style="background: #0f172a; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95rem;">🛍️ Customer Homepage</a>
            <a href="/admin/login.html" style="background: #ea580c; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95rem;">🔐 Dukandar / Admin Login</a>
          </div>
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
