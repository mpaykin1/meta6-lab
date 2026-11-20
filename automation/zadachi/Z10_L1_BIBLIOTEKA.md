# Z10 — L1: БИБЛИОТЕКА СОДЕРЖИТ КОМПОНЕНТЫ ВСЕХ ЭТАЛОННЫХ ИГР

## Следующий шаг после готового пакета — 20.11.2026 09:54 UTC
Silhouette patch из 79796cf6b39d60a9f805a73bb12184f6651f3274 и 8 мутаций подготовлены, runtime main НЕ изменён. Builder4 подтвердил blob1529d6691ebf762bbfce9a6d39f31186a89ba3ab/контракт; ремонтник прочитал пакет и не создал дубль. Следующий шаг builder4 — первый ДРУГОЙ отсутствующий source_root по актуальной описи/индексу: строка описи, реальный исходник, blobSHA, ожидаемый id; originals/allowlist/generated не менять. Ремонтнику — отдельная гипотеза sourceCache: в одном Node-процессе verify PASS, изменить bytes source, повтор verify обязан FAIL; сравнить с новым процессом. Доставить точный fixture/команду/результат, не считать гипотезу доказанной. Не менять verifier/machine.mjs/готовый патч параллельно. Открытых PR21; интеграция L1 ожидает допустимого пути после разгрузки, новый PR не создавать. Codex support следующий пакет #402, не повтор L1 diagnosis. Назначения доставлены f15d697aeb5a35d761b7d2a2ba494d5e7a356dc9.

> **Многоразовая карточка задачи для обычного чата ChatGPT.** Владелец присылает только ссылку на неё: https://github.com/mpaykin1/meta6-lab/blob/main/automation/zadachi/Z10_L1_BIBLIOTEKA.md
> **Порядок:** 1) открой [GPT.md](https://github.com/mpaykin1/meta6-lab/blob/main/GPT.md) и выполни разделы 0–2 (кто ты, правила, ПУЛЬС — толкни/почини то, что сломано по пути); 2) прочитай `reports/l1/PROGRESS.md` и продолжи с «что дальше» (нет файла — создай); 3) выполни эту карточку; 4) цель карточки достигнута или упёрлась в «НУЖЕН CLAUDE» — не останавливайся, бери следующую задачу по разделу 3 GPT.md; 5) в конце — разделы 5–6 GPT.md (развитие и короткий ответ).
> Эту же ссылку можно присылать снова без изменений — работа продолжится с места остановки.

## Готово, когда
`shared/index.json` содержит компоненты всех игр описи [INVENTORY_LAB_GAMES_2026-11-10.md](../../docs/INVENTORY_LAB_GAMES_2026-11-10.md) (всё, что владелец залил в МГЛ, — эталоны библиотеки). `verify-l1-library.mjs`: каждая игра описи есть в индексе; мутации: игра выпала; лишняя несуществующая; «обман» — пустой компонент. Зелёный прогон.

## Сначала найди
[BIBLIOTEKA.md](../../BIBLIOTEKA.md), [BIBLIOTEKA_STANOK.md](../../rules/09-platforma/BIBLIOTEKA_STANOK.md), PR [#270](https://github.com/mpaykin1/meta6-lab/pull/270), [#319](https://github.com/mpaykin1/meta6-lab/pull/319), [#310](https://github.com/mpaykin1/meta6-lab/pull/310), workflow `library-machine.yml`.

## Шаги
1. Одна игра описи — один PR: выделить компоненты (камера, ввод, звук, частицы, шейдеры…) из **исходных байтов** игры, без переписывания (правило REUSE).
2. Компонент = файл в `shared/components/` + запись в index.json (игра-источник, путь, хеш).
3. Не трогать оригинал игры.

## Саморазвитие (после основной работы, обязательно одно)
Найди в двух разных играх одинаковое решение (например камеру) и отметь в index.json как «вариант одного компонента» — так библиотека становится полезнее чужим ИИ.

## Опыт (дописывает исполнитель: одна строка «что случилось → как обойти», со ссылкой)
- —

## Диспетчер 20.11.2026 08:54 UTC — подтверждённый узкий дефект
Строитель-4 выявил пропуск reference/silhouette-gold-generator/. Проверено: реальный index.html 76698 байт существует; строка 19 утверждённой описи включает источник. Изолированный Node-прогон неизменённого discover() из machine.mjs с настоящим allowlist и существующими папками вернул только пять исходных source_root и пропустил silhouette. Это подтверждение ограниченности обнаружения, не доказательство полноты всей библиотеки.
Передача: Codex meta-games принимает минимальный ремонт discover/согласованного механизма источников после проверки занятости и существующего PR. Строитель-4 пока получает хеш реального index.html и ожидаемую запись по схеме; machine.mjs не пишет. Ремонтник готовит независимую регрессию omission, не меняя machine.mjs/allowlist/protected. Не возвращаться к закрытым #270/#319. Критерий ремонта: источник действительно входит в пересборку с правильным source hash; удаление источника снова ловится. Полный L1 по 24 играм всё ещё требует отдельной сверки.

## Передача Codex meta-games — 20.11.2026 09:06 UTC
Принимаю узкий ремонт discover для источников утверждённой описи и соответствующую регрессию. Строитель-4 пока read-only source hash/контракт; ремонтник не пишет machine/verify/mutate-library до освобождения участка. Открытого канонического PR с machine.mjs среди текущих 21 не найдено; правило лимита новых PR сохраняется. Сначала подготовлю изолированный проверяемый патч без изменения оригиналов/allowlist/защиты; не объявлять его действующим main до разрешённой интеграции.

## Codex — готовый патч L1 для интеграции, 20.11.2026 09:16 UTC

Подготовлен минимальный патч трёх файлов ниже: discover() включает существующие каталоги с кодом только из нумерованных строк утверждённой описи; прежние games/ и пять источников сохраняются, дубли source_root не добавляются. Путь проверяется на выход за root и symlink. Независимый verifier получает тот же контракт через отдельный разбор описи; три новые негативные мутации ловят пропуск, согласованное стирание манифеста/индекса и подмену source_root. Оригиналы игр, allowlist, охрана и лимит копирования не меняются.

ПРОВЕРКА ИЗМЕНЕНА: ожидаемый набор library sources дополнен реальными каталогами из утверждённой описи 24 игр, так как прежняя проверка сама ожидала только games/ + пять источников и не замечала пропуск silhouette. Это кандидат к авторизованной приёмке, не разрешение обойти source-only/guard.

Проверено Node24.15.0: baseline machine со свежей независимой проверкой падает missing/extra/hardcoded games; исправленная версия ловит все 8 мутаций (5 прежних + 3 новых). Реальный неизменённый owner HTML reference/silhouette-gold-generator/index.html, Git blob 1529d6691ebf762bbfce9a6d39f31186a89ba3ab, 76698 байт: в изолированной сборке получены source_root, 1 inline asset и 65 решений; verifyLibrary PASS на трёх источниках fixture. Это НЕ полная пересборка репозитория и НЕ браузерная проверка/24 из24.

В main код НЕ установлен. Открытых PR при проверке 21, готового канонического PR machine.mjs не найдено; правило GPT.md запрещает создавать новый, пока не завершён хотя бы один старый. Не создавал дубль/новый PR, не возобновлял закрытые #270/#319. Ниже кодовый пакет для ревью/интеграции после выполнения условия очереди или явного разрешения владельца. При интеграции: строка причины/ловушки в OSHIBKI.md, применить к свежему source blob cd07611feccf9f075304a6ddaa40e3d7bfb6a662, проверить полную сборку/verify/mutations/CI и предусмотренную приёмку; не добавлять весь generated diff без проверки защищённых удалений. Требуется разрешённая проверка изменения существующего verifier. Локальный файл outputs/MG_L1_inventory_discovery.patch дублирует ровно этот patch.

Участок кода освобождён: строитель-4/ремонтник не должны писать параллельную реализацию. Следующая полезная работа — проверить пакет/точные байты источника, а не заново диагностировать discover. Отдельно при проверке source-byte мутации обнаружено, что verify-library держит sourceCache между вызовами в одном процессе; это прежнее поведение, в текущий патч не включено и не заявлено исправленным. Его нельзя использовать как подтверждение проверки изменённых source-байтов в той же сессии без отдельного воспроизведения.

<details><summary>Патч для проверки и применения</summary>

```diff
diff --git "a/work\\l1-repair\\before\\scripts\\library\\machine.mjs" "b/work\\l1-repair\\after\\scripts\\library\\machine.mjs"
index cd07611..cd64f0c 100644
--- "a/work\\l1-repair\\before\\scripts\\library\\machine.mjs"
+++ "b/work\\l1-repair\\after\\scripts\\library\\machine.mjs"
@@ -38,6 +38,24 @@ export function discover(root=ROOT){
     if(!fs.existsSync(full)||!fs.statSync(full).isDirectory())throw Error('Missing allowlisted source: '+p);
     games.push({game:'reference-'+p.replaceAll('/','--'),source_root:p});
   }
+  // The owner's numbered inventory also authorizes uploaded reference directories.
+  const inventory=path.join(root,'docs/INVENTORY_LAB_GAMES_2026-11-10.md');
+  const roots=new Set(games.map(g=>g.source_root));
+  if(fs.existsSync(inventory)){
+    const rows=fs.readFileSync(inventory,'utf8');
+    for(const row of rows.matchAll(/^\|\s*\d+\s*\|[^|\n]*\|([^|\n]+)\|/gm)){
+      for(const item of row[1].matchAll(/`([^`]+\/)`/g)){
+        const p=item[1].slice(0,-1),full=path.resolve(root,p);
+        inside(root,full);
+        if(roots.has(p)||!fs.existsSync(full))continue;
+        if(fs.lstatSync(full).isSymbolicLink())throw Error('Symlink in source: '+full);
+        if(!fs.statSync(full).isDirectory())continue;
+        if(!walk(full).some(f=>CODE_EXT.has(path.extname(f).toLowerCase())))continue;
+        games.push({game:'reference-'+p.replaceAll('/','--'),source_root:p});
+        roots.add(p);
+      }
+    }
+  }
   const ids=new Set();
   for(const g of games){if(ids.has(g.game))throw Error('Duplicate game: '+g.game);ids.add(g.game);}
   return games.sort((a,b)=>a.game.localeCompare(b.game,'en'));
diff --git "a/work\\l1-repair\\before\\scripts\\library\\verify-library.mjs" "b/work\\l1-repair\\after\\scripts\\library\\verify-library.mjs"
index 7322b83..c00960f 100644
--- "a/work\\l1-repair\\before\\scripts\\library\\verify-library.mjs"
+++ "b/work\\l1-repair\\after\\scripts\\library\\verify-library.mjs"
@@ -44,6 +44,25 @@ function expectedGames(root){
   }
   if(!canonical.length)fail('empty allowlist');
   for(const source_root of canonical)found.push({game:'reference-'+source_root.replaceAll('/','--'),source_root});
+  const inventoryFile=path.join(root,'docs/INVENTORY_LAB_GAMES_2026-11-10.md');
+  const seen=new Set(found.map(g=>g.source_root));
+  if(fs.existsSync(inventoryFile)){
+    for(const line of fs.readFileSync(inventoryFile,'utf8').split('\n')){
+      const cells=line.split('|').map(x=>x.trim());
+      if(!/^\d+$/.test(cells[1]||''))continue;
+      for(const token of (cells[3]||'').matchAll(/`([^`]+)`/g)){
+        if(!token[1].endsWith('/'))continue;
+        const source_root=token[1].slice(0,-1),full=safe(root,source_root);
+        if(seen.has(source_root)||!fs.existsSync(full))continue;
+        if(fs.lstatSync(full).isSymbolicLink())fail('symlink '+source_root);
+        if(!fs.statSync(full).isDirectory())continue;
+        const code=/\.(?:[cm]?js|ts|html?|css|glsl|vert|frag)$/i;
+        if(!independentWalk(full).some(file=>code.test(file)))continue;
+        found.push({game:'reference-'+source_root.replaceAll('/','--'),source_root});
+        seen.add(source_root);
+      }
+    }
+  }
   return found.sort((a,b)=>a.game.localeCompare(b.game,'en'));
 }
 const sourceCache=new Map();
diff --git "a/work\\l1-repair\\before\\scripts\\library\\mutate-library.mjs" "b/work\\l1-repair\\after\\scripts\\library\\mutate-library.mjs"
index b4531b7..68b9502 100644
--- "a/work\\l1-repair\\before\\scripts\\library\\mutate-library.mjs"
+++ "b/work\\l1-repair\\after\\scripts\\library\\mutate-library.mjs"
@@ -6,7 +6,40 @@ import {makeFixture,verifyLibrary} from './verify-library.mjs';
 const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
 const write=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
 const mutateByte=file=>{const x=fs.readFileSync(file);x[x.length-1]^=1;fs.writeFileSync(file,x);};
+function inventoryFixture(){
+  const root=makeFixture(),source=path.join(root,'reference/inventory-example');
+  fs.mkdirSync(source,{recursive:true});
+  fs.writeFileSync(path.join(source,'index.html'),
+    '<style>canvas{color:gold}</style><script>function jump(){return 3;}</script>');
+  fs.writeFileSync(path.join(source,'hero.png'),Buffer.from([137,80,78,71,13,10,26,10,1,7,9]));
+  fs.mkdirSync(path.join(root,'docs'),{recursive:true});
+  fs.writeFileSync(path.join(root,'docs/INVENTORY_LAB_GAMES_2026-11-10.md'),
+    '| 19 | Owner reference | `reference/inventory-example/` | yes | no |\n'+
+    '| 20 | Alias | `reference/inventory-example/` | yes | no |\n');
+  return root;
+}
 const scenarios=[
+  ['inventory-source-omitted',root=>{
+    const file=path.join(root,'shared/library/index.json'),index=read(file);
+    index.games=index.games.filter(g=>g.source_root!=='reference/inventory-example');
+    write(file,index);
+  }],
+  ['deception-inventory-source-and-evidence-erased',root=>{
+    const file=path.join(root,'shared/library/index.json'),index=read(file);
+    const entry=index.games.find(g=>g.source_root==='reference/inventory-example');
+    if(!entry)throw Error('Inventory fixture was not discovered');
+    index.games=index.games.filter(g=>g.game!==entry.game);
+    index.entries=index.entries.filter(e=>e.game!==entry.game);
+    fs.rmSync(path.join(root,entry.manifest));
+    write(file,index);
+  }],
+  ['deception-inventory-manifest-points-to-other-source',root=>{
+    const index=read(path.join(root,'shared/library/index.json'));
+    const entry=index.games.find(g=>g.source_root==='reference/inventory-example');
+    const file=path.join(root,entry.manifest),manifest=read(file);
+    manifest.source_root='games/base';
+    write(file,manifest);
+  }],
   ['copy-one-byte-changed',root=>{
     const asset=read(path.join(root,'shared/library/base.json')).assets.find(x=>x.storage==='copy');
     if(!asset)throw Error('Fixture missing copied asset');
@@ -49,7 +82,7 @@ const scenarios=[
 ];
 let passed=0;
 for(const [name,damage] of scenarios){
-  const root=makeFixture();
+  const root=inventoryFixture();
   try{
     buildLibrary(root);
     verifyLibrary(root,{live:false});
```
</details>

## MG-ремонтник — воспроизведение sourceCache, 20.11.2026

В текущем `scripts/library/verify-library.mjs` функция `lineBuffer()` хранит `bytes` и `starts` в модульном `sourceCache` по абсолютному имени файла и не проверяет повторно содержимое. Изолированный Node 22.16.0 сценарий с тем же телом `lineBuffer`: файл `source.html` со строкой `const hero=1;`, `expected=sha256(lineBuffer(file,[2,2]))`, первый вызов PASS; заменить на `const hero=2;` (та же длина), повторить `sha256(lineBuffer(file,[2,2]))===expected` в том же процессе — **FALSE_PASS**; свежий Node-процесс, читающий вторую строку и сравнивающий с прежним SHA — **FAIL_EXPECTED**. Это подтверждает дефект кэша исходных байтов, но не является полным запуском `verifyLibrary()` или CI. Команда для точного интеграционного воспроизведения: `const root=makeFixture(); buildLibrary(root); verifyLibrary(root,{live:false});` затем изменить только байты inline-источника в `games/base/index.html` без пересборки и вызвать `verifyLibrary(root,{live:false})` в том же процессе; ожидается исключение `source code/table range SHA-256 mismatch`. Сначала проверить, что изменённая строка соответствует `lines` манифеста. Критерий исправления: второй вызов FAIL, первый PASS, свежий процесс FAIL; не менять guard/allowlist и не ослаблять хеши. Не менять verifier параллельно с Codex L1; патч пока не внесён.

## Подтверждение/передача — диспетчер20.11.2026 10:54 UTC
Второйпропуск builder4: source reference/sumerechny-arkhipelag/index.html, blobfb185e02eb32a56a66ea1e4c0d878caa98015787 независимо подтверждёнGitHub; ожидаемыйid ещёпроверитьгенератором. Builder4 следующийодиншаг — изолированныйsmoke готовогоinventory-discovery patch наэтойреальнойHTML/строкеописи, output source_root/id/manifest/числокомпонентов. Source/originals/allowlist/runtimeне менять, новыйPRне создаватьпри21open.
Ремонтник37411e1 воспроизвёл lineBuffer microcase, честноНЕполныйverify. Codexтеперьнезависимо выполнилполный неизменённый verifyLibrary: makeFixture/buildLibrary/verifyPASS, в games/base/index.html заменить return true на return null безrebuild (таже длина), второй verifyLibrary(root,{live:false}) втомжепроцессе FALSE_PASS. Fixture work/l1-repair/cache-repro.mjs;этоrepro,неисправление. Ремонтникуследующийодиншаг — минимальныйcandidatecache-fix и3negativeрегрессии в существующейZ10 какисполняемыйpatch, безновогоPR; machine/discoveryпатчнетрогать,занятостьпроверитьдоизменения. Runtimeпоканеисправлен, полноценныйCI/браузернеподтверждены.

## MG-ремонтник — кандидат исправления sourceCache (20.11.2026)

Текущий runtime main остаётся без исправления; ниже **исполняемый patch-кандидат** для разрешённой интеграции в существующий канонический PR. Изменяется только граница `verifyLibrary`; `machine.mjs`, discovery, hash-проверки и guard не меняются. Перед применением сверить актуальный SHA и занятость verifier.

```diff
diff --git a/scripts/library/verify-library.mjs b/scripts/library/verify-library.mjs
--- a/scripts/library/verify-library.mjs
+++ b/scripts/library/verify-library.mjs
@@
 export function verifyLibrary(root=ROOT,{live=true}={}){
+  // A verification pass must observe current source bytes, even in the same process.
+  sourceCache.clear();
   const directory=path.join(root,'shared/library'),index=read(path.join(directory,'index.json'));
```

Три негативных сценария в одном Node-процессе, каждый с **новой** `makeFixture()`, `buildLibrary(root)`, исходным `verifyLibrary(root,{live:false})` и последующим `verifyLibrary(root,{live:false})` без rebuild. Вставить как отдельный тест, не изменяя baseline:

```js
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildLibrary} from './machine.mjs';
import {makeFixture,verifyLibrary} from './verify-library.mjs';

const cases=[
  ['same-length-edit',s=>s.replace('return true','return null')],
  ['different-line-edit',s=>s.replace('display:block','display:table')],
  ['stale-hash-deception',s=>s.replace('moveHero','moveHera')]
];
for(const [name,change] of cases){
  const root=makeFixture();
  try{
    buildLibrary(root);
    verifyLibrary(root,{live:false});
    const source=path.join(root,'games/base/index.html');
    const before=fs.readFileSync(source,'utf8');
    const after=change(before);
    assert.notEqual(after,before,name+': fixture unchanged');
    fs.writeFileSync(source,after);
    assert.throws(
      ()=>verifyLibrary(root,{live:false}),
      /source code\/table range SHA-256 mismatch/,
      name+': stale source was accepted'
    );
  }finally{fs.rmSync(root,{recursive:true,force:true});}
}
console.log('SOURCE_CACHE_INVALIDATION_PASS 3/3');
```

В третьем сценарии «старый хеш» — намеренно оставленный прежним `sha256` в манифесте после изменения исходника. Если изменение затронет диапазон, не включённый в manifest, тест обязан сначала установить реальный `lines` нужного `source_path`, иначе это не проверка кэша. Ожидаемый результат: три отказа на изменённом источнике, исходные PASS, затем полный CI на новом HEAD. **Не запускалось в этом сеансе**: доступен GitHub Contents, но нет сетевого checkout репозитория; патч ещё не интегрирован и не является исправленным FINISH L1.

## Интеграция L1 — передача Codex meta-games, 20.11.2026 11:54 UTC
СвежийполныйRESTсписок20open: #357closed/mergedfalse10:54:28Z, его незакрывалCodex. Старыйблокер21openсняткакнеактуальный. Следующийsupport:проверитьсвежуюзанятость/всеPRнаmachine/verify/mutate;есликаноническогонетипорогсохранился—ОДИНканоническийL1PRизсвежегоmainдляготовогоinventory-discovery79796cf+cachecandidateade9e3. Доclaimиинтеграциирuntimeнеисправлен. Нельзяприменятьголый@@какготовыйpatch,сначалаякоря/контекст;8discovery+3cacheслучая,обареальныхsource(silhouette,sumerechny),baselineтесты/хеши/guardсохранить,OSHIBKI/ПРОВЕРКАИЗМЕНЕНА,CIновогоSHA. Еслиочередьсновавыросла—новыйточныйснимок,необход.
Builder4независимоотsupport—SHA256/bytecountреальногоsumerechnyindex.html,GitblobSHA1header/UTF8долженfb185e02eb32a56a66ea1e4c0d878caa98015787;неизменятьsource. Его10:54smokeне выполнен,неприписыватьPASS. Ремонтник—превратитьсвойsnippetвприменимыйdiffсправильнымконтекстом/диапазонамивтойжекарточкеипривязать3мутациикmanifestlines,непараллелитьruntimeправкуsupport. sourceCacheclearпокакандидатбезтестов,неисправленныйmain. Доставка общегомаршрута336924b0c192d3ca77783793429d1458bcb2ffe1.

## Codex support — старт канонической интеграции L1, 20.11.2026 12:07 UTC
Принимаю переданные discovery79796cf и cachecandidateade9e3. Свежийmain7869b4e05c941e8106092da4905245bc1d00d8f0,20openPR,поиск всех changed-files с пагинацией не нашёл открытого canonicalPR machine/verify/mutate. Builder4idle/read-only, cachecandidate передан, активнойчужойruntimeправкинет. Занимаю scripts/library/machine.mjs,verify-library.mjs,mutate-library.mjs,OSHIBKI.md дляОДНОГОпроверенногоL1PR;source/originals/allowlist/generatedне меняю. Критерий:сохранённыеbaselineпроверки,8discovery+3cacheсценария,реальныйsmokeобоихисточников,точныйSHA/CI. ПередсозданиемPRещёразпроверюочередь;FINISHне меняю.

## Codex support — канонический L1 PR создан, участок освобождён 20.11.2026 12:07–12:13 UTC
Два подготовленных пакета интегрированы в ОДИН [PR #428](https://github.com/mpaykin1/meta6-lab/pull/428), HEADb4bf57c207891bd9c42edf5f6965295ad68cf1ac, ветка lab/l1-inventory-source-cache-20261120, parentmain7869b4e05c941e8106092da4905245bc1d00d8f0. Доcreateподтверждено20open;полныйchanged-filesscanвсех20PR(втомчисле211/233путя#288/#287спагинацией)не нашёлcanonicalmachine/verify/mutate. Послеcreateснова21,новыйдубльне создавать. CAS/forcefalse,4файла+102/-0,всебазовыетестовыестрокисохранены,guards/originals/allowlist/generatedне менялись. OSHIBKI2026112011/12,ПРОВЕРКАИЗМЕНЕНАвPR/commit. Точныйконтекстcacheclearпроверен,голый@@не применялся.
Проверки:8/8discovery/прежнихмутаций+3/3cacheмутацийпойманы. Убратьcacheclearнаизменённомverifier—REDsame-lengthFALSEPASS;вернуть—GREEN. Последняяправкамутационнойfixtureсохранилавсеbaselineстроки,повтор11сценариевпрошёлпосленеё. РеальныенеизменённыеHTML: silhouette76698bytes,Git1529d6691ebf762bbfce9a6d39f31186a89ba3ab,SHA256710b1ccbd3254003c4877558cdf44e032c0885afe623a02b9b623c3c2b0b3690—1inlineasset/65solutions;sumerechny194538bytes,Gitfb185e02eb32a56a66ea1e4c0d878caa98015787,SHA256981ea9d984122e495bb41a2e1b4433214c22af2c8bdcf70037afa71bc6b98fdb—14inlineassets/142solutions. Обаожидаемыхsource_root/id/manifestсгенерированы,независимыйverifyPASSна4-sourcefixture.
ЭтоНЕполнаяпроверкавсех24/репозитория/браузерногоимпорта. [CIновогоSHA](https://github.com/mpaykin1/meta6-lab/commit/b4bf57c207891bd9c42edf5f6965295ad68cf1ac/checks)запущен,включая2library-machine,permanent-mutations/static/guard;покавсеIN_PROGRESS/SKIP,неPASS. ПрямойAPIHEADb4bf57c,mergeabletrue/unstable,PRopenready,не слит. FINISH7/18не менялся.
Builder4:следующийшагтолькоэтотcanonical#428,проверитьзавершённыйlibrary-machine/полноту24наактуальномSHA,непересоздаватьpatch/PRиповторныйпоискзакрытых#270/#319. Ремонтник:готовыйcandidateade9e3учтён,передправкойпроверятьновыйHEAD;разрешенанезависимаярегрессия,непараллельнаяправка3файлов. QAчерездиспетчерапослезавершениятекущего#411можетпроверятьэтотподготовленныйрезультат. Все4путиосвобождены;0merge/публикаций/принятыхFINISH. Старыйлокальныйdiscovery-onlypatchтеперьистория,canonicalPR#428.

## Диспетчер12:54 — конкретныеCIпричины#428
HEADb4bf57c,полныйpushLibraryMachinejob136280299862SUCCESS:extract/verify/8+3мутации;sumerechnyвполномрепозитории28assets/285solutions(HTML-onlyfixture14/142неполныйкаталог),silhouette1/65. PRjob136280354387FAILименнонаCheckcommittedcatalog/source-only(stepAPI);егоцелыйлогдваждынедоступенконнектором,точныйsource-onlyтекстотGPTпоканезависимонепрочитан. Не смешиватьpushSUCCESS/PRFAIL.
KONTURjob136280532628:concrete trap path отсутствуетвпоследнейколонкеOSHIBKI. Полныйкодguardпрочитанreadonly:нуженscripts/[...](mutate-|verify-|selftest),filename-onlymutate-library.mjsв2026112011/12недостаточен. Supportследующий :06—точные2journalстрокисполнымscripts/library/mutate-library.mjs/verify-library.mjs,неguardfix. ЗатемзаконныйderivedcatalogпутьвтомжеPR,еслиобъём/праваблокируют—готовыйпакетClaude,неудалятьOSHIBKI/тестыдляsource-only. B1job136280513122—desktopunderwater-worldконсольnet::ERR_CONNECTION_CLOSED,mobileOPEN,безbase/resourceURLнеприписыватьL1.
Builder4read-onlyсопоставление24строкописи/manifestпоуспешномуполномуjob;ремонтникread-onlyконкретныйB1resource/baseклассификация. QAследующий#428источник/хеш/потребительбезпараллельнойправкиsupport;gateFAILнепубликация. Canonicalодин,#428,21open—новыйне создавать.

## Codex support — старт K3/catalog #428,20.11.2026 13:02 UTC
Принимаю переданныйминимальныйK3дефектOSHIBKI2026112011/12наHEADb4bf57c207891bd9c42edf5f6965295ad68cf1ac. Builder4idle/read-only,новыхкодовыхкоммитовнет. Занимаютолько2добавленныхjournalстроки;sourcecode/11мутацийне меняю. ПроверяюзаконныйпутьполученияточногопроизводногокаталогавтомжеcanonicalPR,безsource-onlyисключения/удалениятестов/guardизменений. Еслиобъём/механизмтребуетClaude—точныйпакет,необход. QAможетreadonlyпроверятьисточник/потребителя,непараллелитьOSHIBKI/каталогдоосвобождения.

## Codex support — K3 исправлен, catalog migration передан Claude,20.11.2026 13:02 UTC
В#428сохранёнefaaea3d4aaab234ae7619291388b08f863b0219:только2новыеjournalстрокиуточненыполнымиscripts/library/mutate-library.mjs/verify-library.mjs. НастоящийcheckDiffguard:старыеK3FAIL,новыеK3ошибкинет. НовыеCIэтогоSHA:kontur/permanent/browser-open-all/visual/static/guard/reference/protectSUCCESS;осталисьlibrary-machineиquotaFAIL. СтарыйB1desktopERR_CONNECTION_CLOSEDненаблюдаетсявновомпрогоне,причинанеустановлена/игранеправилась.
Полныйисходныйрепозиторийполученпослеразрешённогоread-onlynetworkclone,доэтогоsandboxgitls-remoteconnectionfailed. Дляbyteidentityиспользованы2966точныхGitblob(264899215bytes),node_modulesисключёнкаквсамомэкстракторе;WindowsCRLFрабочегочекaутаНЕиспользован. ИсточникsumerechnyсноваGitblobfb185e02. Полныеextract/verify/8+3мутацииизэтогоснимкаPASS;28sourceRoot,копии49222409/50000000bytes.
Generateddiff141файл(129add/2modified/10delete),15644958новыхбайтов;index7256014bytes/Git4feb55f737bc3e12b20bbb79a0f552a01bcde851. Действующийlab-shared-deletion-guardне допускает10удаленийпрежнихsharedкопий;оставитьихкакнеучтённыесейчаснельзяиз-заindependentverifier/бюджета. ЭтоНЕразрешениенаguardbypass. Ниодинgeneratedфайлне отправленвPR. Точныйпакетмиграциис10путями/командамивDLYA_CLAUDEmain7f2ff0008f2b85dc2f6c54452facfdbaa8c23e77;нуженразрешённыйпутьсохраненияпринятыхкопий/каталогаврамкахбюджетаибезослабленияпроверок.
Локальныйдополнительныйносительoutputs/MG_L1_catalog_candidate.zip:4326495bytes,SHA256d75d0c95ddfd4feb77b971ba57ece7a7a54ed053e0509ece3dda5c0e5eca7972(131новый/изменённыйфайл+manifest10предлагаемыхудалений),неавтоприменён. ВоспроизведениевGitHub:чистыйcheckoutefaaea3безCRLF,node scripts/library/extract-all.mjs,verify-library.mjs,mutate-library.mjs;проверитьпланниже.
Всеruntime/OSHIBKIучасткиосвобождены,generatedвPRнезанимались. Builder4/QA:проверятьактуальныйefaaea3/source/consumer,неназыватьL1зелёным;кодовые11мутацийнеспорятсcataloggate. ДоразрешённоймиграцииcatalogнеповторятьнеизменныйFAIL/неоткрыватьновыйL1PR. НовыйcapabilityCodex:work/l1-fullсGitобъектами+work/l1-exactbyte-exactисточникидоступныследующимпроверкам;рабочиеCRLFбайтыl1-fullнеиспользоватьдляхешей. 0merge/публикаций/принятыхFINISH,FINISH7/18.

<details><summary>Точный производный план141путей, не применён</summary>

| Статус | Путь | Новые байты | Git blob SHA |
|---|---|---|---|
| added | `shared/library/assets/reference-abyss-glow/assets/maw_front_v1/maw_front_atlas.png` | 26946 | c769191701d41681fa505d44eb79c73ecafb45fe |
| added | `shared/library/assets/reference-abyss-glow/assets/maw_front_v1/maw_front_light8.png` | 48418 | b09f78ed23e9fe81b4b9910c8383d1083bdde3f3 |
| added | `shared/library/assets/reference-abyss-glow/play/assets/lantern-ray/inverted_bells_biome.png` | 94357 | ce3d57ff1678f17b487446e09847c45e9cd5ef38 |
| added | `shared/library/assets/reference-abyss-glow/play/assets/lantern-ray/lantern_ray_front.png` | 3033 | 166cafc5a993927d03608e627f4f916f49053161 |
| added | `shared/library/assets/reference-abyss-glow/play/assets/lantern-ray/lantern_ray_side4.png` | 9048 | 7fc55208dce0025409dad17a1ee4213e0db7e804 |
| added | `shared/library/assets/reference-abyss-glow/sketches/lantern-ray/inverted_bells_biome_source.png` | 94344 | 47bae2683c09ac6ab69aa3151c75f292fc855226 |
| added | `shared/library/assets/reference-abyss-glow/sketches/lantern-ray/lantern_ray_front.png` | 6731 | 931108127c5d37d37d78c31fc21eb2a2801d2b4d |
| added | `shared/library/assets/reference-abyss-glow/sketches/lantern-ray/lantern_ray_inverted_bells_sheet.png` | 137625 | f2d4a3bfed6b74522bb626f7b25428f1168b0bf3 |
| added | `shared/library/assets/reference-abyss-glow/sketches/lantern-ray/lantern_ray_motion_sheet.png` | 43336 | e81806bb024c3182841769b52d549544eb42df4f |
| added | `shared/library/assets/reference-abyss-glow/sketches/lantern-ray/lantern_ray_parts.png` | 8643 | bc8c19cd65704c8385c0324bd16ba23ba52810af |
| added | `shared/library/assets/reference-abyss-glow/sketches/maw_front_layers.png` | 11971 | 6df4383e12bb6269355fefdebc934a92efba7a7f |
| added | `shared/library/assets/reference-abyss-glow/sketches/maw_side_layers.png` | 5585 | 11cd2c2eb0711bf902c0c502360cc8b1b5dc7726 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/assets/abyss_0_n.png` | 560452 | cbb00ddf4cd1f0fc115fcc3a3092a59744fac780 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/assets/abyss_0.png` | 216705 | 5a647e5e70b07bdea6f1f88fdd858233dfdcdecb |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/assets/bake_fish_n.png` | 66080 | 920a5c9b23d8247cfd4b86b9508280eeef084109 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/assets/bake_fish.png` | 10343 | a5fdb66e7e78a3cc43038662d369f483619f2e85 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/assets/manifest.json` | 180497 | 488627e59409dfab620347d3f51ab3cf795e1221 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/angler.json` | 179036 | 22c536017f26c4a0e10da1ca175d92654916e6cd |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/eel.json` | 56529 | 6cf962148a1bd6542eb04eaa81629522be91d403 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/glow_fish_amber.json` | 24477 | 96596ef0156afbdb59d9d1406eaeeba6c3d02bc9 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/jellyfish_teal.json` | 107640 | 616aa0bb245511fc210657acf214476ef948cc7f |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/kelp_tall.json` | 97231 | adfdf209e90d3a0440fab6295886bb046f6f8104 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/kraken_tentacle.json` | 147917 | a9156d58e3120aff381b8bf2a45ad2e8ad1b6318 |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/models/whale_skeleton.json` | 781820 | 1c3800a78b17e11cb86ca6110083fe538e7a573d |
| added | `shared/library/assets/reference-reference--abyss-glow-2026-11-09/reference.json` | 2155 | 8257a96f3a710efb7beb12b79093246b03612a5a |
| added | `shared/library/assets/reference-references--sunken-city/reference.json` | 910 | 8b8d37c4d969f0c59b34ccc4c67fd014eb45caed |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/audio/defeat.wav` | 31796 | 6312c778ac75e192f1fb01460b452442c1a2213a |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/audio/impact-a.wav` | 18126 | 9d81b8343cce42ee35092ab653b6f9eae1a806e4 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/audio/impact-b.wav` | 17244 | 770cdd4f2927e08537d5a9df0d4a9d3932ff7baf |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/audio/whoosh.wav` | 16362 | 60b26e80bb7493b7f213be4818e82d1417067ed7 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/library.json` | 585 | 98c03f319f3ac189bb1653a3c1e8cf947c7022f3 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/angler.glb` | 134236 | 94f3b18f02d85f6a51ec158c855c1e0babd38abb |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/eel.glb` | 42360 | 4b72ae60e02ac6a7c647fa9002f6422237b2d41b |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/jellyfish_teal.glb` | 80684 | a70795eaee862a73ee0fce7b134b61a6be856325 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/jellyfish_violet.glb` | 80724 | c38910b1ecce747048683f531d16bff592184ae3 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/kraken_tentacle.glb` | 110892 | 55d09340f84a18d4119046240e3cd9c9e210663e |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/creatures/scout_drone.glb` | 59460 | 9c55dc2762a494c755b59eea1fc68c57125d0752 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/models/model-index.json` | 31818 | d47fe3f9d796543860e996221e22a67bd60fedf5 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/index.json` | 68774 | 20e7f68f6c03d9147b2ea5df7118a8b4357a2423 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/anim.json` | 4728 | 9d74bae38c81aa1dd5bc1dc90aac6dbb775a456d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/biome.json` | 6828 | a78514f5921020c0b7a145e321503599c4523115 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/block.json` | 3864 | 13066c3f7f01d601c373d56380c084a98a882e9c |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/body.json` | 4495 | 23b59c7f76c34019d3e1c395ab0b75fd4d6275be |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/brain.json` | 6222 | f304b2885d81a6dc3e5aa494735d99d2f1d34341 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/character.json` | 1202 | 8e812c4a5eb3272a0f9e5be300729c025a6b3acf |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/enemy.json` | 9516 | 3458150d61920ab03a92ec83620090d7d0d10223 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/event.json` | 4816 | 7868167ef48fd0e85b8e77a41a0d0628da0e789e |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/fire.json` | 1116 | 9e997a7b785de05d0a42d05875f1bd95c85dee1d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/flora.json` | 2249 | 840d38d320bf9cc4629c6d61b155429ee93e08be |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/npc.json` | 2412 | bfac9f74d7bc35065346458d9ad24e51151650d6 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/projectile.json` | 5230 | 43b1261396d58fa1d912f5fedfa6ef1543a10743 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/relic.json` | 4240 | 6f4c9ce00138c467ac63c0b3426d3e3468491e6b |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/ricochet.json` | 3349 | bb58616e03ccf9f42a3824bf443f77659cfbde62 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/sound.json` | 2911 | c2656c552444fd48392e45374c662ece55c3ab0c |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/weapon.json` | 14213 | d75ffa83f8fb04e6363a28ffc66f8b3314416652 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/registry/sources/weather.json` | 1959 | 60bb8724157b86566e650160d2072a8eb7f87b5d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/shaders.json` | 30786 | 1c1e245d12be8fb5b2832552dfb7f91399c63145 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites.json` | 27781 | af899085a16f80c73f6e0e67220132f0d4d49b31 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/heroes/fisher.png` | 1208 | 393b94b054cf003cbf577470a4a3e5bccf9ffbe6 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/heroes/hero.png` | 1070 | 1301b3204cedf8cbea1bd6145f95d051ba88ae3d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/heroes/keeper_old.png` | 1173 | d99ae143bc247e68df38b3fd5d934db6d34a1a4e |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/heroes/keeper.png` | 1072 | 18d126d928cd05cdf5d0a1dddab13d121e261be6 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/ui/coin.png` | 404 | d74877a868c9516744e069c224e9caa5b8871cae |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/ui/hearts.png` | 444 | 0dc50be9cc0d6306b5a2b30921b2c543f7134109 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/axe.png` | 402 | 3cd446134ac43491034f43ac37dad88693822f75 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/bomb.png` | 423 | a6abe9d39c7c64d73b507bfe4e7b801fbdd3672a |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/boomerang.png` | 367 | afdef1e955ae80fad900bbaeac14754daea09c10 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/bow_drawn.png` | 518 | 53d5461ec08dd29b08bc9ce742766cd29a1175de |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/bow.png` | 464 | 767518aba478261c7326015b392fa82c4f95d99b |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/dagger.png` | 325 | fa9e0c688d5d8b9412d4924dbc825a42c5b82342 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/fists.png` | 301 | 29f3c6bc67de3f993d9ec99f4a9fef9cee4a451e |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/flail.png` | 403 | f06b794d3d8db84ebd3c42eeb0e3e100c1b9dda1 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/flamesword.png` | 386 | f4bf5f00f7dada0ad6e04c6c5a0116caed874995 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/hammer.png` | 474 | 44b2e64b755a3801a583273491cdf83b28ce5c73 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/katana.png` | 320 | 6ac8917206170214de1d260060aa5c9766cbce36 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/laser.png` | 459 | a9b28790af0be4e6e66ea6d93de18a8708460787 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/pistol.png` | 410 | 6a7718ede06cc194ef58fe6bb166816c5ae2d2c3 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/saw.png` | 528 | 7bbeb727c85c6f24e13aa226e0a52170d5df13c9 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/scythe.png` | 494 | 80adc62c9a0be94d3c4f6a5239fbd39aeb9c2667 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/shotgun.png` | 357 | be8891b8691723b2008ff965abc97c2477fb5276 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/sling.png` | 428 | adf78dc2a9e412a84132095266fadcaf66fd98c0 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/smg.png` | 415 | c0aa8f6313ae208ab3618180dc0fcf5da2e05669 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/spear.png` | 348 | 3d42be6b6ad04c4f9dc8d32129b90e4b0d5919eb |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/stick.png` | 216 | 6d7880692e9ef51db2d0e1b8fbc275c365e8c069 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/sword.png` | 363 | 4f94a0926883ed9d6cb635dace64f187ff90e9c0 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/tesla.png` | 405 | 6eaea4c990a7b7bd733cc527377761769e5a8a4d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/sprites/weapons/xbow.png` | 502 | 35b0a6c7c0e1d281cf20ec773d9923480a096607 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/atlas.png` | 4768 | 3d86887bc3350b3fd475c24de74c5e0b9fb0c704 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/bark.png` | 232 | 0a707c47b34838b54c15c47831cca76aef64858d |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/brick.png` | 314 | e4aaedc47bd2b9c24e45f94d9476188d130327d1 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/dirt.png` | 333 | 0e02197bd4caf8c96c796fcdf5f6d2747f13de87 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/frost_brick.png` | 304 | 847f0a84ce2d7baccca0a0e2a8c9ac3adcec946e |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/frozen_dirt.png` | 394 | a475e283b800cc085d0584aecbe66684cd8d4967 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/grass_side.png` | 421 | 8eaa353994f5559ab6fb1eef4b81b545a488f7be |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/grass.png` | 332 | 5d55815c66f922f2bac945679f302d775a136dda |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/ice.png` | 412 | b422e7107b8f2ad369ca42d20b4df22fbc1d5bba |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/leaves.png` | 436 | 0a4a8933225df15c20a86d5971da907715e04a80 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/log_top.png` | 253 | 7c183ecad74926d3cff617a9e94f85d8838e2c90 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/packed_snow.png` | 244 | 83e93aaf4f62fd28f6d58a2885fc6e48aaddea51 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/pine_needles.png` | 482 | d7f0262a19575198d5ca60643474b64892abb733 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/sand.png` | 361 | 26dc50c4bdd58899c455f9b4fed4b054a39659f9 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/snow_side.png` | 424 | cd42220bcd54fa3786fd90fef09da03b45f6bf26 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/snow.png` | 335 | 6bc5fae6b1d26017ef62514d8ee5beb233e48ea3 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/stone.png` | 399 | 8b72c8064319c6ca81d3c3ed51c5dfeb39506581 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/water.png` | 340 | f18078c7dbe140a7dbba55d71127722c7d5b3d46 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/tiles/wood.png` | 294 | f34e5d17e67521c02bd7d6005a4eea89f1af0f36 |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/water.png` | 602 | 6bb25fdcc4c84a8bb8aeb34e237754dc775d600f |
| added | `shared/library/assets/reference-shared--components--pod-i-nad/textures/weapons.png` | 8685 | d70099503e7f639c364750eeb4ed0bfb33d8bae1 |
| deleted | `shared/library/assets/reference-three-worlds-game/evidence/play/00.png` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/evidence/play/02.png` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/evidence/play/04.png` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/evidence/stage7-depth.png` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/angler.glb` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/eel.glb` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/jellyfish_teal.glb` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/jellyfish_violet.glb` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/kraken_tentacle.glb` | — | — |
| deleted | `shared/library/assets/reference-three-worlds-game/models/scout_drone.glb` | — | — |
| added | `shared/library/assets/wild-train-prologue/bot.json` | 409 | 9ce284bdcfb452497835bf978388694e5a4bd282 |
| added | `shared/library/assets/wild-train-prologue/cover.jpg` | 376201 | ca1a69c6ecd0a1ac2ca32b8064b650f51d6ee508 |
| added | `shared/library/assets/wild-train-prologue/sfx/cycle_whoosh_01.mp3` | 4223 | 9ae9edb76c7a732eb1d0273d83ffb8a2bebbefd4 |
| added | `shared/library/assets/wild-train-prologue/sfx/hurt_01.mp3` | 4223 | cfbdd02aebe56ba7357c9756850cf61a65c233df |
| added | `shared/library/assets/wild-train-prologue/sfx/music.mp3` | 357817 | b0d358bfb10dc89a5a59b5eca5a21c880f860968 |
| added | `shared/library/assets/wild-train-prologue/sfx/step_sand_01.mp3` | 2342 | 80b8b0588d0c06268f9d39e699bc5fc31afc20b3 |
| added | `shared/library/assets/wild-train-prologue/sfx/step_sand_02.mp3` | 2551 | a36b3ac1686b565c6e461616efbf2ae65bece8d8 |
| added | `shared/library/assets/wild-train-prologue/sfx/ui_click_01.mp3` | 1297 | 947c7cb3d065fa0fb63bdc7266c01b6c788dd0e8 |
| added | `shared/library/assets/wild-train-prologue/sfx/ui_level_up_01.mp3` | 2760 | c6da465374e806e48f320042b2c8c56e12edfeff |
| added | `shared/library/assets/wild-train-prologue/sfx/ui_reward_01.mp3` | 2969 | e29c2862538c3c8b071d7fd7a503a30c9946aea7 |
| modified | `shared/library/index.json` | 7256014 | 4feb55f737bc3e12b20bbb79a0f552a01bcde851 |
| added | `shared/library/reference-abyss-glow.json` | 462958 | e9034ceef616afca4d28b76054bbbe356fbc0738 |
| added | `shared/library/reference-reference--abyss-glow-2026-11-09.json` | 167088 | 51ec9eddf76815450f8fe13dcf8b416b36547226 |
| added | `shared/library/reference-reference--broken-city-2026-11-09.json` | 568922 | 588514b7484591210a9ce13ff86fbd794e582fc2 |
| added | `shared/library/reference-reference--silhouette-gold-generator.json` | 28333 | 1861fe282674ecb250b17a90d81e4ec2d9957065 |
| added | `shared/library/reference-reference--sumerechny-arkhipelag.json` | 131468 | 0d41507422ec5efa86d3823d4e7bd4f6dd1d9c78 |
| added | `shared/library/reference-reference--sumerek-golden.json` | 495322 | 12bff7145f43fbaaa6d8e58b04ce6036e89f43ac |
| added | `shared/library/reference-reference--sunken-city.json` | 37621 | d5e6313b3952e80ec95ca77502686a7a350c7375 |
| added | `shared/library/reference-reference--twilight-isles-2026-11-09.json` | 534720 | 0b9d6363acf52cb1cf51f18e5ce85102ce437669 |
| added | `shared/library/reference-references--sunken-city.json` | 205879 | 8acf66c7eef7b3912ff7e2b19dd22ddabefd4165 |
| added | `shared/library/reference-shared--components--pod-i-nad.json` | 89937 | f86c277abd1f650c96d5777766acef08a4516891 |
| modified | `shared/library/reference-three-worlds-game.json` | 740843 | 3493ab6c8112ce713ab27d961093824a2b9d6cf6 |
| added | `shared/library/wild-train-prologue.json` | 383210 | 188c7896fda38996a310f58e046e4007a57e4ec1 |

</details>

## Codex QA — старт read-only source/consumer #428,20.11.2026 13:44 UTC
ПроверяюназначенныйHEADefaaea3d4aaab234ae7619291388b08f863b0219:актуальныйPRopen,кодsupportосвободил. Catalogmigrationуже7f2ff00переданClaude,егоFAILнеповторяю/необхожу. Одинограниченныйreadonlyшаг:опись24→реальныеисточники/generatedmanifestsиодинреальныйconsumersearchLibraryсbytehashизисходногоGitblobснимка. Источники/код/OSHIBKI/каталогне занимаюине меняю,приёмкуL1по28rootsнеставлю. Результат—конкретныенепокрытые/покрытыестроки,проверяемыйconsumerконтракт,непубликация.

## Codex QA — источник/consumer проверены, L1 только19/24 mapping,20.11.2026 13:44 UTC
HEADefaaea3неизменен. ИзточногоGitblobснимкаиранеесгенерированногокаталога28rootsпострочносопоставленаопись24:1–19имеютфизическийисходникиmanifest,алиасынеудваиваются;20–24не имеютпроверенногопокрытия. Этокандидатвwork/l1-exact,НЕопубликованный/закоммиченныйкаталог. НельзяобъявлятьL1готовымпо28roots/LIBRARYVERIFIED.
Путидлявосстановления:20#206/#207 reference/king-of-ash/index.html;21#189 reference/endless-valleys-golden-knight/index.html;22#137 meta-games/references/demonic-hand/index.html;23#201 reference-uploads/foggy-awakening-scene-1/Сцена 1 — Туманное пробуждение.zip(толькоZIP). PRAPIвсех5историческихномеровclosed/mergedfalse,filesспискипрочитаны,всепоказанныепутиотсутствуютвefaaea3snapshot. 24reference/train-in-the-fogотсутствует,описьуказываетcatalogmetadataбезисходныхGLB;невыдумыватьэталон/неподменятьдругимпоездом. Этоуточняетпервичныйвыводbuilder4,неразрешаетавтоматическоепереоткрытиезакрытыхPR.
Реальныйсуществующийconsumernode scripts/library/search.mjs --game=reference-reference--silhouette-gold-generator --kind=solution --limit=1вернулtotal65. ЭлементaddEllipsoid,id04c096e0f4f2b2c981c975ad,sourceindex.html:465–467,154bytes;независимыйSHA25614dbcee6e95c2f86160dd8d1ed0fbfa1f41cbfbc23ee81a93a87eab8dbbfa665совпалсрезультатомAPI. Work/qa428-acceptance.mjsпроверяетmapping+consumer,неповторяетextract/11мутаций. ЭтоНЕL3браузер/игроваяотрисовка.
Пакет19/24+точныеPR/sourceпутидоставленDLYA_CLAUDEmain665332ce54aa0abbc3ba488ca658056514ec410b. Диспетчеру:следующийпакетполноты—разрешённыйbyte-for-byteпереносисточников20–23/проверкаактуальностииправ,для24поискреальныхGLB,сусловиямиочереди/безновогодубля. Catalogmigration10shareddeletionsужеимеетотдельногорешателя;неповторялся. СвежиеCIefaaea3:library-machine+quotaFAIL,неприёмка. Код/OSHIBKI/каталогне занимались,всеучасткисвободны. 0исправлений/merge/публикаций/принятыхFINISH,FINISH7/18.
