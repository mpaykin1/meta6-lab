// Claude 18.11.2026: ловушка для gh-list.mjs (PR #423) — повторный/пустой курсор GraphQL
// должен валить сторожа, а не обрабатывать одни и те же PR по кругу.
import {openPulls} from './gh-list.mjs';

const node = n => ({number: n, url: 'u' + n, createdAt: '2026-11-18T00:00:00Z', isDraft: false, mergeable: 'MERGEABLE',
  headRefName: 'b' + n, headRefOid: 's' + n, headRepository: {nameWithOwner: 'x/y'},
  commits: {nodes: [{commit: {committedDate: '2026-11-18T00:00:00Z'}}]}});

function stub(pages) {
  let i = 0; stub.calls = () => i;
  globalThis.fetch = async () => {
    const p = pages[Math.min(i++, pages.length - 1)];
    return {ok: true, status: 200, json: async () => ({data: {repository: {pullRequests: p}}})};
  };
}

const cases = [
  ['repeated-cursor', [{pageInfo: {hasNextPage: true, endCursor: 'A'}, nodes: [node(1)]},
    {pageInfo: {hasNextPage: true, endCursor: 'A'}, nodes: [node(1)]}]],
  ['cycle-cursor', [{pageInfo: {hasNextPage: true, endCursor: 'A'}, nodes: [node(1)]},
    {pageInfo: {hasNextPage: true, endCursor: 'B'}, nodes: [node(2)]},
    {pageInfo: {hasNextPage: true, endCursor: 'A'}, nodes: [node(1)]}]],
  ['null-cursor', [{pageInfo: {hasNextPage: true, endCursor: null}, nodes: [node(1)]}]],
  ['empty-cursor', [{pageInfo: {hasNextPage: true, endCursor: ''}, nodes: [node(1)]}]],
];
let caught = 0;
for (const [name, pages] of cases) {
  stub(pages);
  try { await openPulls('x/y', 't'); console.error('MISSED ' + name); process.exit(1); }
  catch (e) { if (!/cursor/i.test(e.message) || stub.calls() > pages.length) { console.error('WRONG ' + name + ' ' + e.message + ' calls=' + stub.calls()); process.exit(1); } caught++; console.log('CAUGHT ' + name); }
}
stub([{pageInfo: {hasNextPage: true, endCursor: 'A'}, nodes: [node(1)]}, {pageInfo: {hasNextPage: false, endCursor: 'B'}, nodes: [node(2)]}]);
const ok = await openPulls('x/y', 't');
if (ok.length !== 2) { console.error('CLEAN two pages must return 2 PRs, got ' + ok.length); process.exit(1); }
console.log('GH_LIST MUTATIONS PASS (' + caught + ' catches; clean 0)');
