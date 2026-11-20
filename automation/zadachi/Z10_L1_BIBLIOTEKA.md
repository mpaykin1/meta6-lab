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
