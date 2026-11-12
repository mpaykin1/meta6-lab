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
    '<link rel="canonical" href="https://example.invalid/fake/"></head>')],
  ['direct Playgama ad link', original.replace('</body>',
    '<a href="https://playgama.ai/play/fake">Играть</a></body>')],
  ['protocol relative Playgama link', original.replace('</body>',
    '<a href="//playgama.ai/play/fake">Играть</a></body>')],
  ['deceptive line wrapped ad link', original.replace('</body>',
    '<a href="https://playgama.ai/\nplay/fake">Играть</a></body>')]
];
cases.push(
  ['missing game landing', original.replace('</body>',
    '<a href="../../games/not-published/">Details</a></body>')],
  ['missing local XML file', original.replace('</body>',
    '<a href="../../missing-sitemap.xml">Sitemap</a></body>')],
  ['encoded missing landing page', original.replace('</body>',
    '<a href="../../games/%6eot-a-real-game/">Details</a></body>')]
);
// Three image-regression traps, including URL-encoded missing files and a
// plausible first-party social cover which has no corresponding repository file.
cases.push(
  ['missing local image', original.replace('</body>',
    '<img src="../../covers/not-published.webp" alt="Screenshot"></body>')],
  ['encoded missing local image', original.replace('</body>',
    '<img src="../../covers/%6eot-published.webp" alt="Screenshot"></body>')],
  ['deceptive first-party OG cover', original.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    '$1https://mpaykin1.github.io/meta6-lab/claude-games/covers/not-published.svg$2')]
);
// Mutate a valid game graph, not a broken JSON string, to test semantic validation.
const mutateGame = change => {
  const match = original.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw Error('Missing JSON-LD fixture');
  const schema = JSON.parse(match[1]);
  const game = schema['@graph'].find(node => node['@type'] === 'VideoGame');
  if (!game) throw Error('Missing VideoGame fixture');
  change(game, schema);
  return original.replace(match[1], JSON.stringify(schema));
};
cases.push(
  ['missing VideoGame name', mutateGame(game => { game.name = ''; })],
  ['foreign VideoGame canonical', mutateGame(game => {
    game.url = 'https://example.invalid/game/';
  })],
  ['missing PlayAction target file', mutateGame(game => {
    game.potentialAction.target =
      'https://mpaykin1.github.io/meta6-lab/games/nonexistent-play-target/';
  })],
  ['deceptive extra valid-looking VideoGame', mutateGame((game, schema) => {
    schema['@graph'].push({ ...game, name: 'Fake game', url: 'https://example.invalid/' });
  })]
);
// A compliant HTML parser accepts reordered, single-quoted and multi-token rel attributes.
cases.push(
  ['reordered Playgama preconnect', original.replace('</head>',
    '<link href="https://static.playgama.com/" rel="preconnect"></head>')],
  ['multi-token Playgama preconnect', original.replace('</head>',
    '<link rel="dns-prefetch preconnect" href="https://static.playgama.com"></head>')],
  ['deceptive protocol-relative preconnect', original.replace('</head>',
    "<link data-safe='yes' href='//static.playgama.com/path' rel='preconnect'></head>")]
);
for (const [name, html] of cases) {
  if (!inspect(html, page).length) throw Error('Mutation escaped SEO validator: ' + name);
  console.log('CAUGHT', name);
}
