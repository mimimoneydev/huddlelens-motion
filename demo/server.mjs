import {createReadStream, existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, join, normalize, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url))); const port = Number(process.env.PORT) || 4174;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = pathname === '/' ? 'demo/index.html' : pathname.slice(1);
  const file = normalize(join(root, relative));
  if (!file.startsWith(root) || !existsSync(file)) {res.writeHead(404); res.end('Not found'); return;}
  res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store','Permissions-Policy':'camera=(self)'});
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`huddlelens-motion demo: http://localhost:${port}`));
