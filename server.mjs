/** Tiny local dev server (no dependencies): serves static files and /api/generate-plan. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import handler from './api/generate-plan.js';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const PORT = process.env.PORT || 3000;

http
  .createServer(async (req, res) => {
    if (req.url === '/api/generate-plan') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      let parsed = {};
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        parsed = {};
      }
      const r = {
        setHeader: (k, v) => res.setHeader(k, v),
        status(code) {
          res.statusCode = code;
          return this;
        },
        json(obj) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        },
      };
      return handler({ method: req.method, body: parsed }, r);
    }
    const rel = req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    const file = path.resolve(rel);
    const ext = path.extname(file);
    if (!file.startsWith(process.cwd()) || !TYPES[ext] || rel.startsWith('tests') || !fs.existsSync(file)) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[ext]);
    res.end(fs.readFileSync(file));
  })
  .listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
