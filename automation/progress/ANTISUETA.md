# АНТИСУЕТА — прогресс

## Шаги
- Сделано: создана одна ветка и [PR #289](https://github.com/mpaykin1/meta6-lab/pull/289); [начальный SHA 12f791d](https://github.com/mpaykin1/meta6-lab/commit/12f791d5992033f600d2007723b715bc056a5739).
- Сделано: код трёх режимов пользы, список файлов, реальное подтверждение Actions, обязательный статус PR, защита от самоизменения; [SHA 3b8b15e](https://github.com/mpaykin1/meta6-lab/commit/3b8b15e5d0e29b0b2fff18384d4bbc7760f9d933), [17 мутаций](https://github.com/mpaykin1/meta6-lab/commit/6c0edbf11ef531af9dd3273b7ff65890c9f71a6a).
- Сделано: создан [bot-state](https://github.com/mpaykin1/meta6-lab/tree/bot-state), запись результатов перенаправлена в эту ветку [SHA 0a35a9a](https://github.com/mpaykin1/meta6-lab/commit/0a35a9a34e633855b3ce1aac745fe03f48bb0e35).
- Сделано: убраны восемь из шестнадцати расписаний без удаления workflow; [последний SHA f5b687d](https://github.com/mpaykin1/meta6-lab/commit/f5b687dbd3a521030e10fc0c0734f2bdf0c74213). Почасовой общий диспетчер — [SHA 27b06cf](https://github.com/mpaykin1/meta6-lab/commit/27b06cf12d8ef132bf4bff45834d680bdbc10d0a).
- Сделано: ежедневный шумомер, проверка доли полезных PR, отключение cron неядерного шумного бота и [7 дополнительных ловушек](https://github.com/mpaykin1/meta6-lab/commit/c1d5a627726715ec7b07f0aa56fdb0036a30d4e1); [SHA noise](https://github.com/mpaykin1/meta6-lab/commit/6388d9d0734cf94f2c7c2abbed3fdf7d).
- Сделано: запись в [ZADACHI](https://github.com/mpaykin1/meta6-lab/commit/bc987e8e09068f157c61f4e3a48ec3f7cf5314b4), [ZANYATO](https://github.com/mpaykin1/meta6-lab/commit/4fa8e47efbb0d32be48f27b82e985e5204ca2a49), [OSHIBKI](https://github.com/mpaykin1/meta6-lab/commit/8466ade3138d107efdd163a8e6280435c8df186b), [DLYA_CLAUDE](https://github.com/mpaykin1/meta6-lab/commit/895c06a1b434a10562b8f83e509ea527cb65ccbe).
- Не выполнено: обязательный зелёный Actions на текущем HEAD (локальные чистые функции и мутации проверены отдельно), зелёный PR, защита required status в main, 3-часовой замер после merge — зависит от проверки и внедрения Claude; [PR #289](https://github.com/mpaykin1/meta6-lab/pull/289).

## Замеры
- 2026-11-13 11:42 UTC: main 538 коммитов за последние 24 ч, 306 бот-коммитов (GitHub commits API); открытых PR 49 [PR GitHub](https://github.com/mpaykin1/meta6-lab/pulls?q=is%3Aopen); полезных слияний через POLZA 0 до активации; cron main 16, cron PR 8; FINISH 7/18 [FINISH.md](https://github.com/mpaykin1/meta6-lab/blob/main/rules/09-platforma/FINISH.md).
- 2026-11-13 11:21 UTC: за последние 24 часа main = 509 коммитов / 284 бот-коммитов (GitHub commits API); полезные merge по новым воротам пока 0, поскольку ворота не развернуты; 50 открытых PR [GitHub](https://github.com/mpaykin1/meta6-lab/pulls?q=is%3Aopen); расписаний 16 в main, 8 в ветке PR; FINISH 7/18 [таблица](https://github.com/mpaykin1/meta6-lab/blob/main/rules/09-platforma/FINISH.md).
  
## Уроки
- Старая ловушка диспетчера запрещает удалять retry при конфликтах. Сохранён настоящий повторный расчёт 5 раз с записью исключительно в bot-state, [SHA 53d5766](https://github.com/mpaykin1/meta6-lab/commit/53d5766c4f120728d9af990113d9bc808f3faee2).
- Новый cron при ровно восьми старых тоже превышает лимит: исправлен расчёт суммарного числа и добавлена ловушка, [SHA 2cf93aa](https://github.com/mpaykin1/meta6-lab/commit/2cf93aadfc0f2df5b9b8cfd6c7c5fba3c96b59a2), [ловушка 99f55f0](https://github.com/mpaykin1/meta6-lab/commit/99f55f0c2a124a335e92164e43c3da1e3380f8e1).
- Ворота нельзя безопасно включить собственным PR: запрет изменений ворот и лимит 10 PR сознательно блокируют первоначальную установку.
- GitHub Actions /jobs и /actions/runs имеют JSON-конверты; ошибка устранена, новые проверки сохранены [SHA f163545](https://github.com/mpaykin1/meta6-lab/commit/f1635459f6009f4108d53d9aea7c150cf6fbc973).
- Для доверенного pull_request_target пришлось публиковать отдельный status POLZA на SHA головы PR; только обязательный status в branch protection замкнёт контур.

## Уточнения
- Не повышать лимиты; не исключать PR #289 из самозащиты; ядро не менять; в main не коммитить бот-сводки.
