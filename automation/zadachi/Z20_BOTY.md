# Z20 — ПРОВЕРКА И УЛУЧШЕНИЕ ВСЕХ БОТОВ

## Codex QA — #412: ложный SS11 PASS исправлен, 20.11.2026 15:44 UTC
В существующей ветке lab/asset-bot-gothic-facades сохранён [828cfeb](https://github.com/mpaykin1/meta6-lab/commit/828cfebf4469876b050235b35fc577c943dcf896), parent7452045f9916a8774c15abf8c7d94a745d3c5aef, CAS/forcefalse. Исходный check_pack принимал корректную PNG fixture с удалённым gothic-city.js: HARD=[]; все15старыхтестовPASS. SS11 теперь требует существующий файл рендера. Добавлены3регрессии: missing script, comment-only deception при отсутствующем файле, directory вместо файла. RED исходного checker:3FAIL; GREEN исправленного:18/18. Исходные15тестов сохранены, compare ровно3пути: spritestack.py+4/-1, test_spritestack.py+23/-0, OSHIBKI+1/-0. OSHIBKI2026112014, полный scripts/lab/selftest-spritestack.mjs в последней колонке, ПРОВЕРКА ИЗМЕНЕНА в commit/PR.
Это реальные локальные Python3.12/Pillow13/NumPy2.5.5 PNG-тесты, не браузерная/игроваяприёмка. Исходныеbytes взяты Gitshow точногоSHA; зависимости установлены толькоwork/qa412-deps. В sandbox Python не виделPIL, одобренный запуск с темиже локальными зависимостями успешно выполнен. РендерSS13 построковыммаркерам не объявляется проверенным/исправленным.
СтарыйSHA имел16checks:11SUCCESS/3SKIP/2FAIL. ПолныйASSETCHECKjob134542229269 реально выполнял104теста/10sprite-stackмутантов, но нового missing-renderer риска не ловил. Visualjob134537974247: ink-shader-probe improvement<15%/periodicpeak; quota134537827819: довести старыеPR. ЭтистарыеCI не переносятся на828cfeb. НовыйSHA сейчас2referencechecks(SKIP/IN_PROGRESS); PRopen/ready,mergeablefalse/dirty,reviews[]. Не готов к слиянию.
Все3кодовыхпути освобождены. Диспетчеру/support — следующий конкретный шаг: устранить конфликт main в том же #412 настоящим merge без потери SS1–SS13/новых3тестов/чужихправок, затем актуальныеCI/полныйASSETCHECK/visual/предусмотренныйreview. НовыйPR/повтор18fixtures безизмененияпричины не нужен. Нельзя менять ink-порог/guard радиPASS. СамостоятельныйAPPROVED не ставился, PR не слит, FINISH свежий7/18 не менялся. Итог:1устранённыйfalsePASS до слияния,0merge/публикаций/принятыхFINISH.


## Codex QA — минимальный ремонт #412, 20.11.2026 15:45 UTC
Исходный check_pack на HEAD7452045f принимает fixture с удалённым gothic-city.js: HARD=[]; все15 прежних тестов PASS. Принимаю только automation/asset-check/kinds/spritestack.py, существующий test_spritestack.py и OSHIBKI.md в той же ветке. Исправление SS11 fail-closed на отсутствие обычного файла,3негативных сценария+прежний positive. ПРОВЕРКА ИЗМЕНЕНА: отсутствующий renderer обязан дать SS11. Остальные SS/пороги/guard не меняются; сложный runtime SS13 не заявляется исправленным. Критерий RED новой ловушки/ GREEN всех sprite-stack tests, далее актуальный CI; PR не сливаю.

## Codex QA — старт #412, 20.11.2026 15:38 UTC
Назначенный PR #412 HEAD7452045f9916a8774c15abf8c7d94a745d3c5aef открыт/non-draft, ветка lab/asset-bot-gothic-facades без новых коммитов с18.11, занятости нет. Принимаю read-only проверку sprite-stack SS11/SS13: наличие исполняемого рендера, а не только строк-маркеров. Критерий — один воспроизведённый adversarial input исходного check_pack, точный CI/дифф и конкретная передача либо минимальное исправление в том же PR после отдельного claim. В main не сливаю, собственный APPROVED не ставлю. FINISH свежий7/18. Код пока не занимаю.

> **Многоразовая карточка задачи для обычного чата ChatGPT и автозадач.** Владелец присылает только ссылку на неё: https://github.com/mpaykin1/meta6-lab/blob/main/automation/zadachi/Z20_BOTY.md
> **Порядок:** 1) открой [GPT.md](https://github.com/mpaykin1/meta6-lab/blob/main/GPT.md) и выполни разделы 0–2 (кто ты, правила, ПУЛЬС); 2) прочитай `reports/boty/PROGRESS.md` и продолжи с «что дальше» (нет файла — создай); 3) выполни эту карточку; 4) цель достигнута или упёрлась в «НУЖЕН CLAUDE» — бери следующую задачу по разделу 3 GPT.md; 5) в конце — разделы 5–6 GPT.md.
> Эту же ссылку можно присылать снова без изменений — работа продолжится с места остановки.

## Зачем
Боты решают, что принять, а что вернуть. Бот, который говорит «ПРОЙДЕНО» не проверив (пример: META BOT засчитывал успех при `viewports: []`, PR #311 → #352), опаснее, чем отсутствие бота. Проверку ботов делает ChatGPT по кругу, Claude только подписывает правки защищённого ядра — так не тратятся лимиты Claude.

## Боты (круг проверки — по одному боту за запуск, по порядку)
| # | Бот | Где код | Как проверить |
|---|---|---|---|
| 1 | META BOT (проходчик уровней) | `scripts/meta-bot/` (ЗАЩИЩЁН) | `node scripts/meta-bot/selftest.mjs`, `node scripts/meta-bot/mutate-viewports.mjs` |
| 2 | B1 (все игры открываются) | `scripts/platform/*bot-open-all*` | `mutate-bot-open-all.mjs`, `verify-bot-open-all.mjs` |
| 3 | Конфиги ботов игр | `scripts/platform/bot-config.mjs` | `mutate-bot-config.mjs` |
| 4 | Repair Bot (ремонт JSON) | `scripts/repair-bot/` | `selftest.mjs`, `selftest-safety.mjs`, `mutate-repair-safety.mjs` |
| 5 | ASSET CHECK (бот ассетов) | `automation/asset-check/` | `python -m unittest discover automation/asset-check`, `mutate_bot.py` |
| 6 | Аудитор | `scripts/auditor/` | `mutate-auditor.mjs` |
| 7 | Диспетчер / карта сил | `scripts/dispetcher/`, `scripts/karta-sil/` | `node --test scripts/dispetcher/test`, `mutate-*.mjs` |
| 8 | STATUS | `scripts/status/` | `mutate-*.mjs` |
| 9 | Проходчик-промпт | `scripts/prohodchik/` | `mutate-prompt.mjs` |
| 10 | Сторожа ZADACHI / ZANYATO / STOROZHA / KONTUR | `scripts/zadachi`, `scripts/zanyato`, `scripts/storozha` (ЗАЩИЩЁН), `scripts/kontur` (ЗАЩИЩЁН) | их `mutate-*.mjs` и `verify-*.mjs` |
Новый бот в репозитории — допиши строку в эту таблицу (правило 15 GPT.md).

## Шаги одного запуска
1. **Первое (один раз):** PR [#352](https://github.com/mpaykin1/meta6-lab/pull/352) — дождись конца прогона META BOT на его HEAD, сравни таблицу «META BOT — проходимость игр» с последним прогоном на main. Те же провалы, что на main, — не ошибка #352: напиши это комментарием в PR со ссылками на оба прогона. Новый провал — найди причину и почини (шаг 4). Когда новых провалов 0 — строка в DLYA_CLAUDE.md «#352 готов к слиянию Claude: <прогон>». #352 не сливать (ядро META BOT). Красный `storozha-reference` «только Claude» — штатная подпись, не чинить.
2. Возьми следующий бот по кругу (номер — из последней строки PROGRESS.md; после 10 — снова 1). Прогони его проверки локально и посмотри последний прогон на main.
3. **Ищи ложный успех**, а не только падения: подсунь боту пустой вход, неверный тип, неизвестное значение, отсутствующий файл, 0 игр, 0 экранов, 0 уровней. Бот обязан сказать FAIL. Сказал PASS — это ошибка.
4. **Нашёл ошибку → чинишь сам, потом сообщаешь** (правило 6 GPT.md). Каждая ошибка — строка в OSHIBKI.md и вечная ловушка `mutate-*.mjs` (минимум 3 мутации, одна — «обман»), которую подхватит KONTUR.
5. **Защищённый бот** (`scripts/meta-bot`, `scripts/storozha`, `scripts/kontur`, `.github/workflows/**`): файлы ядра не трогать. Положи готовую правку в `docs/patches/<бот>.patch`, проверку правки — в `scripts/platform/verify-<бот>-candidate.mjs` (проверяет патч в памяти), строка в DLYA_CLAUDE.md. Так сделан PR #311 — Claude применил его за один заход.
6. **Улучшение бота** (если ошибок нет): одно измеримое улучшение — новая мутация, которая раньше не ловилась, или ускорение прогона (время до/после), или понятное сообщение об ошибке вместо голого `exit 1`.
7. Строка в `reports/boty/PROGRESS.md`: `время UTC | бот N | что проверено | ошибка/улучшение | PR/SHA/прогон | что дальше (бот N+1)`.

## Запрещено
Ослаблять проверки, уменьшать пороги, удлинять таймауты, отключать бота, удалять тест (только заменять более строгим с пометкой «ПРОВЕРКА ИЗМЕНЕНА:» в PR). Новых ботов и таблиц без замены старых не создавать.

## Готово, когда
Никогда не «готово навсегда»: круг из 10 ботов проходит заново. Круг засчитан, когда у каждого бота есть строка в PROGRESS.md со ссылкой на прогон и за круг найдено и исправлено ≥ 1 ложного успеха или добавлено ≥ 1 новая ловушка.

## Опыт (дописывает исполнитель: одна строка «что случилось → как обойти», со ссылкой)
- 17.11 Claude: META BOT принимал `viewports: []` как успех без открытия игры → патч из #311 применён в #352, ловушка `scripts/meta-bot/mutate-viewports.mjs`. Проверка-кандидат, требующая старое ядро, после применения падает — её удаляют вместе с патчем.
- 17.11 Claude: в песочнице чата может не быть Chromium для `selftest.mjs` META BOT → смотри шаг «Self-test of the bot core» в прогоне Actions `meta-bot.yml`.

## Codex приёмка — старт 20.11.2026 09:42 UTC
Проверяю подготовленный #411, HEAD a66f4b150fa39bc07f6fa0cf47b32b34b6422cae: cutout bot, исходники ветки не занимаю. Критерий — точные CI и отсутствие ложного PASS в проверке реального браузерного рендера. asset-check SUCCESS, visual FAIL, reviews пуст; PR не считается готовым. Проверка не является независимым внешним APPROVED.

## Codex QA — передача на минимальное исправление, 20.11.2026 10:43 UTC
Продолжаю начатую проверку #411, HEADa66f4b150fa39bc07f6fa0cf47b32b34b6422cae неизменен, reviews пуст, новых коммитов владельца нет. Воспроизведён ложный PASS без независимого screenshot: DOM сам сообщает loaded26/gpu999/moved=yes; child_process подменён только в отрицательной fixture, это не реальный Chrome. Принимаю свободные cutout_browser.mjs, существующий test_kinds.py и OSHIBKI.md этой ветки для fail-closed исправления/трёх негативных и положительной регрессии; остальные файлы #411 не меняю. Gate/review/полная browser-приёмка остаются, PR не сливается. Критерий: RED старого проверяющего, GREEN исправленного, минимальный commit в том же PR и CI нового SHA. ПРОВЕРКА ИЗМЕНЕНА: screenshot должен существовать и содержать независимые видимые детали, DOM-счётчик недостаточен.

## Codex QA — исправление передано, 20.11.2026 10:43–10:48 UTC
В #411 сохранён [a371afd](https://github.com/mpaykin1/meta6-lab/commit/a371afdb54a9d16891d531f3bdf3a01e45e04106), parenta66f4b1, fast-forward lease без force. Воспроизведён и исправлен falsePASS: скрипт принимал отсутствующий/одноцветный screenshot при page-supplied gpuColors999. Теперь независимый PNG обязателен и его countColors>=36, прежние DOM/WebGL требования сохранены. ПРОВЕРКА ИЗМЕНЕНА явно отмечена в PR; OSHIBKI2026112007. Compare подтвердил только3исходных пути: cutout_browser.mjs +3/-1, test_kinds.py +65, OSHIBKI +2; новых путей/дублирующего PR нет.
На исходном коде4регрессии дают2FAIL (missing/blank ошибочно ok:true), на исправленном4/4PASS: missing,blank,invalid и detailed positive. Тесты используют искусственный spawnSync/PNG, это НЕ запуск реального Chrome/игры. Полный Python suite локально UNKNOWN (Pillow отсутствует), существующие тесты сохранены; полный ASSET CHECK должен подтвердить новыйSHA. Первые CI новогоSHA: reference skipped, queue in_progress, это не PASS. Прямой PR API после push: mergeable=false, PRopen/ready, reviews пуст. Старый asset-checkSUCCESS/visualFAIL относится к прежнемуSHA и не переносится на новый.
Все3пути освобождены. Диспетчеру/владельцу #411: перед слиянием устранить конфликт без потери истории/строк, затем CI актуальногоSHA, предусмотренная реальная browser/visual приёмка и допустимое review. Не повторять отрицательный fixture без изменения причины; не объявлять PR готовым/слитым. Один устранённый дефект до слияния,0merge/публикаций/принятыхFINISH. FINISH свежий7/18, не менялся.

## Codex QA — старт устранения конфликта #411, 20.11.2026 11:38 UTC
По назначению10:54 принимаю существующую ветку lab/asset-bot-cutout HEADa371afdb54a9d16891d531f3bdf3a01e45e04106: новых коммитов/активной передачи другому исполнителю нет; участок был освобождён QA10:48. Проверяю трёхсторонний diff с актуальнымmain и делаю только минимальный merge без потери обеихсторон, если конфликт локален;9существующихPR-путей, новыхне добавляю. Критерий: сохранены чужиетесты/main, готовыйcutoutfix, действующиеCIна новомSHA, если ремонтзначительный—пакетдиспетчеру. Не занимаю#402/L1, ревьюнеподменяю,PRвmainне сливаю.

## Codex QA — конфликт устранён, 20.11.2026 11:38–11:42 UTC
В #411 сохранён настоящий двухродительский [merge817ddfb](https://github.com/mpaykin1/meta6-lab/commit/817ddfb7567be2c29b67897a2b0748f1444ed010), родителиa371afdb54a9d16891d531f3bdf3a01e45e04106 и mainada89a24f0642fed1c45d2ee615a7e404973fff6. База89edc438aac04475b68944a382c4622ab8dd4eb7. Единственный конфликт—независимые append OSHIBKI: все байтыmain+3строкиcutout/falsePASS сохранены. SPEC git merge-file exit0, mergedblobdcad02e4da3e43eb01184dec04cac305b42477d4 сохраняетобе стороны. Остальные7PRблобов неизменны,включая4регрессии/cutoutguard. Полноедеревоmain сохранено, compare ровно9исходныхпутей,expected_sha/forcefalse. PRAPIHEAD817ddfb,mergeabletrue,unstable;вmainне слит.
Новый [ASSETCHECK44729689063](https://github.com/mpaykin1/meta6-lab/actions/runs/44729689063/job/136265960907) реально запущен наэтомSHA: ASSETGUARDоба шагаSUCCESS,Python/Pillow/Numpyустановлены,ffmpegIN_PROGRESS,полныетесты/мутанты/пакиещёPENDING. ЭтоНЕPASS. НаSHAтакжеguard/quota/static/odin/protect/mutate-konturSUCCESS;kontur/reference/visualещёвработе/очереди. СтарыйvisualFAILнепереноситьна817ddfb,ноновуювизуальнуюприёмкунезасчитыватьдо завершения. Локальные4PNGfixturesнеповторялись:ихblobsнеизменны,неChromeдоказательство.
Все9путейосвобождены. Следующийпроверяющий: читатьзавершённыеCI817ddfb,впервуюочередьполныйASSETCHECK(новыйклассCutoutScreenshotEvidenceвобщемdiscover),приFAILточныйпервыйдефект;приPASSпредусмотреннаяреальнаяbrowser/visualприёмкаидопустимыйнезависимыйreview. Не повторятьmergeили4syntheticтеста безновойпричины. 1устранённыйконфликт,0новыхкодовыхдефектов/mergePR/публикаций/принятыхFINISH;falsePASSиз10:43не считатьповторно. FINISH7/18.

## Codex QA — старт завершённой приёмки #411, 20.11.2026 12:43 UTC
Проверяю подготовленныйHEAD817ddfb7567be2c29b67897a2b0748f1444ed010:21checksзавершены16SUCCESS/5SKIP,включаяполныйASSETCHECK/visual/guard/quota. Reviewsпуст. Кодне занимаю,проверяюфактическоеисполнениеновыхтестов/артефакты/оставшиесяусловия,неставлюсобственныйAPPROVEDзанезависимый. Старые4fixtures/mergeнеповторяю. Критерий—проверяемыйпакеттекущегоSHAдляразрешённойприёмки,безложногоигровогоPASS.

## Codex QA — технически проверено, ожидает review, 20.11.2026 12:43 UTC
#411 HEAD817ddfb7567be2c29b67897a2b0748f1444ed010:21checkszавершены16SUCCESS/5SKIP,0FAIL. ПолныйASSETCHECKjob136265960907SUCCESS;логиподтверждают103теста,все4CutoutScreenshotEvidenceok,5cutoutмутантовKILLED,scanпаковзавершён. Artifactasset-check-reports14625334830/digest3f7d96f95bd7bdbedd05408adf24c7f2bfa1e322e7a0494dcdf63a1adacf4413привязанкэтомуSHA;метаданныесверены,содержимоеархиванеинспектировалось. Проверкаботанеподтверждаетигровуюприёмку/publishincomingпаков. Source/guardне менялись,старые4localfixtures/mergeнеповторялись.
ПроверяемыйпакеттекущегоSHAдоставленвсуществующийDLYA_CLAUDEmain0b0cb3840934f32271abde6d2987cfe560b02502для допустимогонезависимогоревьюера. ReviewsAPIпуст;финальныйPRAPIopen,HEADнеизменен,mergeableпереоцениваетсяnull/unknown—передслияниемсвежаяпроверкаобязательна. СобственныйAPPROVEDнеставился,собственныйPRнеслит. Это0merge/публикаций/принятыхFINISH,не«готоваяВорона». СтарыйконфликтOSHIBKIвDLYAавтотаблицеустарел.
Участокне занимался,кодовыефайлысвободны. #411непроверятьповторнона817ddfbбезновогоreview/SHA/причины;диспетчеруготовыйтехническийпакетпередан,следующемуQA—другойподготовленныйнезанятыйрезультатпоназначению(напримерcanonicalL1#428послесвежихCI/занятости). FINISHсвежий7/18не менялся.
