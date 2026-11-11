import fs from 'node:fs';
import path from 'node:path';

const directory = process.argv[2];
if (!directory || !fs.statSync(directory).isDirectory()) {
  throw new Error('Expected preview directory');
}
const robotTag = /<meta\b[^>]*\bname\s*=\s*(?:"robots"|'robots'|robots)[^>]*>/gi;
let count = 0;
function mark(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      mark(filename);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(filename, 'utf8');
    if (!/<head\b[^>]*>/i.test(html)) continue;
    const marked = html.replace(robotTag, '').replace(/<head\b[^>]*>/i,
      '$&<meta name="robots" content="noindex,nofollow">');
    if (!marked.includes('<meta name="robots" content="noindex,nofollow">')) {
      throw new Error('Preview noindex failed: ' + filename);
    }
    fs.writeFileSync(filename, marked);
    count++;
  }
}
mark(directory);
console.log('Preview noindex pages:', count);
