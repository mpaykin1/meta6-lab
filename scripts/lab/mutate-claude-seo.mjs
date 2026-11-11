import fs from 'node:fs';
import { inspect } from './check-claude-seo.mjs';

const original = fs.readFileSync('claude-games/games/twilight-isles/index.html', 'utf8');
const page = 'games/twilight-isles/';
if (inspect(original, page).length) throw Error('Mutation fixture is not valid');
const cases = [
  ['bad title', original.replace(/<title>[^<]*<\/title>/i,
    '<title>' + 'A'.repeat(70) + '</title>')],
  ['invalid JSON-LD', original.replace(/<script type="application\/ld\+json">/,
    '<script type="application/ld+json">{BROKEN')],
  ['deceptive second canonical', original.replace('</head>',
    '<link rel="canonical" href="https://example.invalid/fake/"></head>')]
];
for (const [name, html] of cases) {
  if (!inspect(html, page).length) throw Error('Mutation escaped SEO validator: ' + name);
  console.log('CAUGHT', name);
}
