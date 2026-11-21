/** META GAME FUSION visual graph compositor: Rete.js 2 + Lit, no source-code eval. */
import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { LitPlugin, Presets as LitPresets } from '@retejs/lit-plugin';
import { NarrativePreview } from './ink-player.js';
import './style.css';

const GRAPH_SCHEMA = 'meta-game-fusion.graph.v1';
const CATALOG_SCHEMA = 'meta-game-fusion.rete-catalog.v1';
const TYPES = new Set(['start', 'scene', 'mechanic', 'dialogue', 'branch', 'ending', 'resource']);
const PORTS = {
  start: { input: [], output: ['flow'] },
  scene: { input: ['flow', 'asset'], output: ['flow'] },
  mechanic: { input: ['flow', 'asset'], output: ['flow'] },
  dialogue: { input: ['flow'], output: ['flow'] },
  branch: { input: ['flow'], output: ['yes', 'no'] },
  ending: { input: ['flow'], output: [] },
  resource: { input: [], output: ['asset'] }
};
const LABELS = { start: '✦ Начало', scene: '◈ Сцена', mechanic: '⚙ Механика', dialogue: '✎ Диалог Ink', branch: '◇ Развилка', ending: '◆ Финал', resource: '▣ Ассет' };
const ICONS = { mechanic: '⚙', model: '⬡', texture: '▦', animation: '◌', shader: '✧', audio: '♫', 'sprite-atlas': '▤', video: '◉' };
const $ = (id) => document.getElementById(id);
const storySocket = new ClassicPreset.Socket('Сюжетный поток');
const assetSocket = new ClassicPreset.Socket('Ресурс');
let editor, area, selectedId = null, busy = false, documentCount = 0, catalog = [], stories = [], player, nodeCount = 0, persistTimer = null;
const docsById = new Map();
let storageKey = 'meta-game-fusion:graph:v0.6';

function toast(message, good = false) {
  const el = $('status'); el.textContent = message; el.className = good ? 'good' : 'error';
}
function makeNode(type, title, component = null, id = null, condition = '') {
  const node = new ClassicPreset.Node(`${LABELS[type]} · ${title}`.slice(0, 90));
  if (id) node.id = id;
  node.mgf = { type, title: String(title).slice(0, 150), component_id: component?.id || '',
               source_sha256: component?.source_sha256 || '', condition: condition || '',
               story_id: component?.story_id || '', story_sha256: component?.story_sha256 || '' };
  if (type === 'scene' || type === 'mechanic' || type === 'dialogue' || type === 'branch' || type === 'ending') {
    node.addInput('flow', new ClassicPreset.Input(storySocket, 'Событие', true));
  }
  if (type === 'scene' || type === 'mechanic') {
    node.addInput('asset', new ClassicPreset.Input(assetSocket, 'Ресурс', true));
  }
  if (type === 'start' || type === 'scene' || type === 'mechanic' || type === 'dialogue') {
    node.addOutput('flow', new ClassicPreset.Output(storySocket, 'Дальше'));
  }
  if (type === 'branch') {
    node.addOutput('yes', new ClassicPreset.Output(storySocket, 'Если да'));
    node.addOutput('no', new ClassicPreset.Output(storySocket, 'Если нет'));
  }
  if (type === 'resource') node.addOutput('asset', new ClassicPreset.Output(assetSocket, 'Ресурс'));
  return node;
}
function validConnection(c, messages = false) {
  const s = editor.getNode(c.source), t = editor.getNode(c.target);
  if (!s || !t || c.source === c.target) return false;
  if (!s.outputs[c.sourceOutput] || !t.inputs[c.targetInput]) return false;
  const inputType = t.inputs[c.targetInput].socket.name;
  if (inputType !== s.outputs[c.sourceOutput].socket.name) return false;
  if (editor.getConnections().some(x => x.source === c.source && x.target === c.target
      && x.sourceOutput === c.sourceOutput && x.targetInput === c.targetInput)) return false;
  if (c.targetInput !== 'flow') return true;
  const adjacency = new Map();
  for (const x of editor.getConnections()) {
    if (x.targetInput !== 'flow') continue;
    adjacency.set(x.source, [...(adjacency.get(x.source) || []), x.target]);
  }
  const todo = [c.target], seen = new Set();
  while (todo.length) {
    const n = todo.pop();
    if (n === c.source) {
      if (messages) toast('Нельзя создавать циклы в сюжете');
      return false;
    }
    if (!seen.has(n)) { seen.add(n); todo.push(...(adjacency.get(n) || [])); }
  }
  return true;
}
function positions(node) {
  const p = area.nodeViews.get(node.id)?.position;
  if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return { x: Math.round(p.x), y: Math.round(p.y) };
  return { x: 0, y: 0 };
}
function exportGraph() {
  return {
    schema: GRAPH_SCHEMA,
    title: $('projectTitle').value.trim().slice(0, 200) || 'Без названия',
    nodes: editor.getNodes().map(n => ({
      id: n.id, type: n.mgf.type, title: n.mgf.title, position: positions(n),
      ...(n.mgf.component_id ? { component_id: n.mgf.component_id,
        source_sha256: n.mgf.source_sha256 } : {}),
      ...(n.mgf.type === 'branch' ? { condition: n.mgf.condition } : {}),
      ...(n.mgf.type === 'dialogue' ? { story_id: n.mgf.story_id, story_sha256: n.mgf.story_sha256 } : {})
    })),
    connections: editor.getConnections().map(c => ({
      id: c.id, source: c.source, sourceOutput: c.sourceOutput,
      target: c.target, targetInput: c.targetInput
    }))
  };
}
function updateStats() {
  if (!editor) return;
  $('stats').textContent = `${editor.getNodes().length} узлов · ${editor.getConnections().length} связей`;
}
function persist() {
  updateStats();
  if (busy || !editor) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(exportGraph())); }
    catch (e) { toast('Не удалось сохранить черновик в браузере'); }
  }, 200);
}
function newPosition() {
  const t = area.area.transform || { x: 0, y: 0, k: 1 };
  const k = t.k || 1;
  return {
    x: Math.round(($('rete').clientWidth * 0.52 - t.x) / k + (nodeCount % 3) * 30),
    y: Math.round(($('rete').clientHeight * 0.48 - t.y) / k + (nodeCount % 4) * 38),
  };
}
async function addNode(type, component = null, location = null, explicitId = null, title = null, condition = '', chosenStory = null) {
  if (!TYPES.has(type)) throw new Error('Неизвестный тип узла');
  if (editor.getNodes().length >= 400) throw new Error('Достигнут предел 400 узлов');
  const newTitle = title || (component ? component.title : ({start:'Начало истории',scene:'Новая локация',dialogue:'Диалог с выбором',branch:'Выбор игрока',ending:'Финал главы'})[type]);
  const inkRecord = chosenStory || (type === 'dialogue' ? stories[0] : null);
  const payload = type === 'dialogue' ? {story_id: inkRecord?.id || '', story_sha256: inkRecord?.source_sha256 || ''} : component;
  const node = makeNode(type, newTitle, payload, explicitId, condition || (type === 'branch' ? 'flag:found_key' : ''));
  await editor.addNode(node);
  await area.translate(node.id, location || newPosition());
  nodeCount++;
  selectedId = node.id;
  refreshInspector();
  persist();
  return node;
}
function refreshedLabel(node) {
  node.label = `${LABELS[node.mgf.type]} · ${node.mgf.title}`.slice(0, 90);
  area.update('node', node.id);
  refreshInspector();
  persist();
}
function optElement(label, value) {
  const option = document.createElement('option'); option.textContent = label; option.value = value; return option;
}
function addInfoLine(box, label, value) {
  const line = document.createElement('div');
  const bold = document.createElement('b'); bold.textContent = label + ': ';
  const content = document.createElement('em'); content.textContent = String(value);
  line.append(bold, content); box.append(line);
}
function refreshInspector() {
  const nodes = editor?.getNodes() || [];
  const selector = $('nodeSelector'); selector.replaceChildren(optElement('— Нет выделения —', ''));
  for (const n of nodes) selector.appendChild(optElement(n.mgf.title, n.id));
  if (!nodes.some(n => n.id === selectedId)) selectedId = nodes[0]?.id ?? null;
  selector.value = selectedId || '';
  const n = selectedId ? editor.getNode(selectedId) : null;
  $('nodeTitle').disabled = !n; $('nodeTitle').value = n?.mgf.title || '';
  $('removeBtn').disabled = !n;
  $('conditionBox').hidden = n?.mgf.type !== 'branch';
  $('condition').value = n?.mgf.condition || '';
  $('storyBox').hidden = n?.mgf.type !== 'dialogue';
  $('storySelect').replaceChildren(...stories.map(s=>optElement(s.title+(s.approved_for_reuse?'':' ⚠'),s.id)));
  $('storySelect').value = n?.mgf.story_id || '';
  const info = $('nodeInfo'); info.replaceChildren();
  if (!n) { info.textContent = 'Добавьте первый узел, чтобы начать работу.'; return; }
  addInfoLine(info, 'Тип', n.mgf.type);
  if (n.mgf.type === 'dialogue') {
    const story = stories.find(s=>s.id===n.mgf.story_id);
    addInfoLine(info,'Сценарий',story?.title || 'Не выбран');
    addInfoLine(info,'Источник',story?.source_game || 'Не указан');
    addInfoLine(info,'Права',story?.approved_for_reuse ? 'Подтверждены' : 'Нужно проверить');
    addInfoLine(info,'Экспорт переменных',story?Object.values(story.exports||{}).join(', ') : '—');
  } else if (n.mgf.component_id) {
    const doc = docsById.get(n.mgf.component_id);
    if (!doc) addInfoLine(info, 'Источник', 'Отсутствует в библиотеке');
    else {
      addInfoLine(info, 'Игра', doc.game);
      addInfoLine(info, 'Файл', doc.file);
      addInfoLine(info, 'Лицензия', doc.license);
      addInfoLine(info, 'ScanCode', doc.license_scan_status || 'Не сканировано');
      addInfoLine(info, 'Обнаружено', (doc.license_scan_expressions||[]).join(', ') || '—');
      addInfoLine(info, 'Право повторного использования', doc.approved_for_reuse ? 'Подтверждено в каталоге' : 'Требует подтверждения');
      addInfoLine(info, 'Совместимость', doc.compatibility || 'не проверена');
    }
  } else addInfoLine(info, 'Назначение', 'Сюжетный каркас');
}
function showCatalog() {
  const query = $('search').value.toLocaleLowerCase('ru').trim();
  const kind = $('kindFilter').value;
  const matching = catalog.filter(c => (kind === 'all' || c.kind === kind)
    && (!query || [c.title, c.game, c.file, ...(c.tags || [])].join(' ').toLocaleLowerCase('ru').includes(query)));
  $('catalogCount').textContent = `${matching.length} из ${catalog.length}`;
  const list = $('catalogList'); list.replaceChildren();
  if (!matching.length) {
    const hint = document.createElement('div'); hint.className = 'hint';
    hint.textContent = catalog.length ? 'По запросу ничего не найдено.' : 'Каталог пуст. Сначала индексируйте исходные игры.';
    list.append(hint); return;
  }
  for (const c of matching.slice(0, 140)) {
    const item = document.createElement('button'); item.className = 'entry'; item.title = `Добавить ${c.title}`;
    const icon = document.createElement('span');icon.className='entry-icon'; icon.textContent = ICONS[c.kind] || '◈';
    const copy = document.createElement('span');copy.className='entry-copy';
    const title = document.createElement('strong');title.textContent = c.title;
    const small = document.createElement('small');small.textContent = `${c.game} · ${c.kind}`;
    copy.append(title,small);
    const status = document.createElement('span');status.className = `entry-state ${c.approved_for_reuse ? 'approved' : ''}`;
    status.textContent = c.approved_for_reuse ? '✓' : (c.relevance > .12 ? '✦' : '⚠'); status.title = c.approved_for_reuse ? 'Разрешено' : 'Нужно проверить права';
    item.append(icon, copy, status);
    item.addEventListener('click', async () => {
      try { await addNode(c.kind === 'mechanic' ? 'mechanic' : 'resource', c); toast(`Добавлено: ${c.title}`, true); }
      catch (err) { toast(err.message); }
    });
    list.append(item);
  }
  if (matching.length > 140) {
    const more=document.createElement('div');more.className='hint';more.textContent='Показаны первые 140 записей. Уточните поиск.';list.append(more);
  }
}
async function importGraph(data) {
  if (!data || data.schema !== GRAPH_SCHEMA || !Array.isArray(data.nodes) || !Array.isArray(data.connections)
      || data.nodes.length > 400 || data.connections.length > 1200) throw new Error('Некорректный формат графа');
  const ids = new Set();
  for (const n of data.nodes) {
    if (!n || typeof n.id !== 'string' || !/^[\w:.@-]{1,128}$/.test(n.id) || ids.has(n.id)
        || !TYPES.has(n.type) || typeof n.title !== 'string' || !n.title.trim() || n.title.length > 150
        || !n.position || !Number.isFinite(n.position.x) || !Number.isFinite(n.position.y)
        || Math.abs(n.position.x) >= 1e6 || Math.abs(n.position.y) >= 1e6) throw new Error('Некорректные узлы графа');
    if (n.type === 'dialogue') {
      const story = stories.find(s=>s.id===n.story_id);
      if (!story || story.source_sha256 !== n.story_sha256) throw new Error('Неизвестный или изменённый сценарий');
    }
    if (['mechanic','resource'].includes(n.type)) {
      const c = docsById.get(n.component_id);
      if (!c || c.source_sha256 !== n.source_sha256 || (n.type === 'mechanic' && c.kind !== 'mechanic')
          || (n.type === 'resource' && c.kind === 'mechanic')) throw new Error('Неизвестный или изменённый компонент');
    }
    ids.add(n.id);
  }
  for (const c of data.connections) {
    if (!c || !ids.has(c.source) || !ids.has(c.target) || !/^[\w:.@-]{1,128}$/.test(c.id || ''))
      throw new Error('Недопустимая связь');
    const source = data.nodes.find(n => n.id === c.source), target = data.nodes.find(n => n.id === c.target);
    if (!PORTS[source.type].output.includes(c.sourceOutput) || !PORTS[target.type].input.includes(c.targetInput)
        || ((c.sourceOutput === 'asset') !== (c.targetInput === 'asset'))) throw new Error('Несовместимые порты');
  }
  const wasBusy = busy; busy = true;
  try {
    await editor.clear();
    for (const n of data.nodes) {
      const doc = docsById.get(n.component_id);
      await addNode(n.type, doc, {x:n.position.x,y:n.position.y}, n.id, n.title, n.condition, n.type==='dialogue'?stories.find(s=>s.id===n.story_id):null);
    }
    for (const c of data.connections) {
      const source = editor.getNode(c.source), target = editor.getNode(c.target);
      const connection = new ClassicPreset.Connection(source,c.sourceOutput,target,c.targetInput);
      connection.id = c.id;
      if (!await editor.addConnection(connection)) throw new Error('Связь отклонена: цикл или дубликат');
    }
    $('projectTitle').value = String(data.title || 'Без названия').slice(0, 200);
    selectedId = data.nodes[0]?.id || null;
    refreshInspector();
    if (editor.getNodes().length) await AreaExtensions.zoomAt(area, editor.getNodes());
    toast(`Схема загружена · ${data.nodes.length} узлов`,true);
  } finally { busy = wasBusy; persist(); }
}
function checkGraph() {
  const graph = exportGraph();
  const nodes = new Map(graph.nodes.map(n => [n.id,n]));
  const flow = graph.connections.filter(c => c.targetInput === 'flow');
  const errors = [];
  if (graph.nodes.filter(n => n.type === 'start').length !== 1) errors.push('нужно ровно одно начало');
  if (!graph.nodes.some(n => n.type === 'ending')) errors.push('нужен хотя бы один финал');
  for (const n of graph.nodes) {
    if (n.type === 'branch' && (!/^(flag|item):[A-Za-z0-9_.:-]{1,80}$/.test(n.condition || '')
      || !['yes','no'].every(p => flow.some(c => c.source === n.id && c.sourceOutput === p)))) errors.push(`развилка «${n.title}» не завершена`);
    if (n.type === 'dialogue') {
      const story=stories.find(s=>s.id===n.story_id);
      if(!story || story.source_sha256!==n.story_sha256 || !story.approved_for_reuse)
        errors.push(`недоступный/неодобренный сценарий: ${n.title}`);
    }
    if (['resource','mechanic'].includes(n.type)) {
      const c = docsById.get(n.component_id);
      if (!c?.approved_for_reuse) errors.push(`нет подтверждённых прав: ${n.title}`);
    }
    if (n.type === 'resource' && !graph.connections.some(c => c.source === n.id && c.sourceOutput === 'asset'))
      errors.push(`ассет не подключён: ${n.title}`);
  }
  const start = graph.nodes.find(n => n.type === 'start');
  const ends = new Set(graph.nodes.filter(n => n.type === 'ending').map(n => n.id));
  if (start) {
    const reach = (sources, edges, reverse = false) => {
      const found = new Set(), stack = [...sources];
      while (stack.length) { const id=stack.pop(); if (found.has(id)) continue; found.add(id);
        for (const c of edges) if ((reverse ? c.target : c.source) === id) stack.push(reverse ? c.source : c.target);
      }
      return found;
    };
    const reached=reach([start.id],flow), canFinish=reach([...ends],flow,true);
    for (const n of graph.nodes.filter(n => n.type !== 'resource')) {
      if (!reached.has(n.id) || !canFinish.has(n.id)) {errors.push(`нет полного пути через «${n.title}»`);break;}
    }
  }
  const text = errors.length ? 'Проверка: '+errors.slice(0,3).join('; ')+(errors.length>3 ? ` (+${errors.length-3})` : '')
    : 'Схема связана. Для исполнения понадобятся адаптеры игровых механик и проверка прав.';
  $('readiness').textContent = text; toast(errors.length ? 'Граф содержит незавершённые связи' : 'Схема пригодна для экспорта как план', !errors.length);
  return !errors.length;
}
function downloadGraph() {
  const graph = exportGraph();
  const blob = new Blob([JSON.stringify(graph,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='fusion-story-graph.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url),500);
  toast('Сохранён JSON-граф. Для сборки запустите validate в скилле.',true);
}

async function main() {
  editor = new NodeEditor();
  area = new AreaPlugin($('rete'));
  const connections = new ConnectionPlugin();
  const renderer = new LitPlugin();
  renderer.addPreset(LitPresets.classic.setup());
  connections.addPreset(ConnectionPresets.classic.setup());
  editor.use(area); area.use(connections); area.use(renderer);
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), { accumulating: AreaExtensions.accumulateOnCtrl() });
  AreaExtensions.simpleNodesOrder(area);
  editor.addPipe(ctx => {
    if (ctx.type === 'connectioncreate' && !validConnection(ctx.data, true)) {
      toast('Связь отклонена: порты несовместимы, цикл или дубликат');
      return undefined;
    }
    if (['nodecreated','noderemoved','connectioncreated','connectionremoved','cleared'].includes(ctx.type)) {
      queueMicrotask(() => { refreshInspector(); persist(); });
    }
    return ctx;
  });
  area.addPipe(ctx => {
    if (ctx.type === 'nodepicked') {
      selectedId = ctx.data?.id || ctx.data?.node?.id || selectedId;
      queueMicrotask(refreshInspector);
    }
    if (ctx.type === 'nodetranslated') queueMicrotask(persist);
    return ctx;
  });
  try {
    const response=await fetch('./catalog.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Нет каталога');
    const data = await response.json();
    if (data.schema !== CATALOG_SCHEMA || !Array.isArray(data.components)) throw new Error('Схема каталога не поддерживается');
    catalog=data.components.slice(0,20000);for(const c of catalog) if(typeof c.id==='string') docsById.set(c.id,c);
  } catch(e) { toast(`Каталог не загружен: ${e.message}`); }
  storageKey = 'meta-game-fusion:v0.6:' + catalog.slice(0,10).map(x=>x.id).join(':').slice(0,250);
  try{
    const res=await fetch('./stories/manifest.json',{cache:'no-store'});
    if(!res.ok)throw new Error('Компилированные Ink-сценарии отсутствуют');
    const manifest=await res.json();
    if(manifest.schema!=='meta-game-fusion.ink-manifest.v1'||!Array.isArray(manifest.stories))throw new Error('Неизвестный формат Ink');
    stories=manifest.stories.slice(0,100);
  }catch(e){toast('Ink пока не загружен: '+e.message)}
  player=new NarrativePreview($('inkPlayer'), m=>toast(m,true));
  $('playBtn').addEventListener('click',async()=>{
    if(!checkGraph())return;
    try{await player.start(exportGraph(),stories)}catch(e){player.error(e)}
  });
  showCatalog();
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click',async () => {
    const type=button.dataset.add;
    if(type==='start' && editor.getNodes().some(n=>n.mgf.type==='start')){toast('Начало истории уже существует');return;}
    try{await addNode(type);toast(`${LABELS[type]} добавлен`,true)}catch(e){toast(e.message)}
  }));
  $('search').addEventListener('input',showCatalog);
  $('kindFilter').addEventListener('change',showCatalog);
  $('nodeSelector').addEventListener('change', e=>{selectedId=e.target.value;refreshInspector()});
  $('nodeTitle').addEventListener('change',e=>{const n=editor.getNode(selectedId);if(!n)return;n.mgf.title=String(e.target.value).trim().slice(0,150)||n.mgf.title;refreshedLabel(n)});
  $('storySelect').addEventListener('change',e=>{
    const n=editor.getNode(selectedId);if(!n||n.mgf.type!=='dialogue')return;
    const story=stories.find(s=>s.id===e.target.value);if(!story)return;
    n.mgf.story_id=story.id;n.mgf.story_sha256=story.source_sha256;persist();refreshInspector();
  });
  $('condition').addEventListener('change',e=>{const n=editor.getNode(selectedId);if(!n || n.mgf.type!=='branch')return;n.mgf.condition=e.target.value.trim().slice(0,100);persist()});
  $('removeBtn').addEventListener('click', async()=>{if(!selectedId)return;for(const c of editor.getConnections().filter(x=>x.source===selectedId||x.target===selectedId)){await editor.removeConnection(c.id);}await editor.removeNode(selectedId);selectedId=null;refreshInspector();persist()});
  $('projectTitle').addEventListener('input',persist);
  $('checkBtn').addEventListener('click',checkGraph);
  $('exportBtn').addEventListener('click',downloadGraph);
  $('fitBtn').addEventListener('click',()=>AreaExtensions.zoomAt(area,editor.getNodes()));
  $('importBtn').addEventListener('click',()=>$('fileInput').click());
  $('fileInput').addEventListener('change',async e=>{
    const f=e.target.files?.[0];if(!f)return;
    try{if(f.size>8_000_000)throw new Error('Слишком большой JSON');await importGraph(JSON.parse(await f.text()));}
    catch(err){toast(`Импорт не выполнен: ${err.message}`)}
    e.target.value='';
  });
  let data=null;
  try { const saved=localStorage.getItem(storageKey);if(saved)data=JSON.parse(saved); }
  catch(e) { /* private-mode storage may be blocked */ }
  if(!data){
    try{const response=await fetch('./graph.json');if(response.ok)data=await response.json();}
    catch(e){/* safe fallback */}
  }
  if(!data) data={schema:GRAPH_SCHEMA,title:'Новая история',nodes:[],connections:[]};
  try{await importGraph(data)}catch(e){toast('Не удалось открыть черновик: '+e.message);await importGraph({schema:GRAPH_SCHEMA,title:'Новая история',nodes:[],connections:[]})}
  updateStats();
}
main().catch(err => { console.error('Rete workbench startup failure',err);toast('Редактор не запустился: '+err.message); });
