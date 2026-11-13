# Продолжение очереди без тормозов

Перед повтором прочитать ZADACHI.md, OSHIBKI.md и актуальный AGENTS.md. Один workflow — один PR.
Состояния PR проверять в GitHub, уже merged/closed пропускать. Новые PR при LIVE > 5 запрещены.
Обычный merge main сохраняет историю; non-fast-forward push означает чужой новый HEAD: fetch и просмотр,
затем merge. Force-push, фиктивные подписи Claude и повторная публикация shallow-history патча запрещены.

Повтор ошибки с мутациями: OSHIBKI №8 и №9, [старый провал M4/M1](https://github.com/mpaykin1/meta6-lab/actions/runs/42646755024),
повтор [link-guard af27bf42](https://github.com/mpaykin1/meta6-lab/commit/af27bf42be3422e1ba24df3504b287e1fac88303).
Перед объединением считать точное число целей каждой мутации. Указывать функцию и контекст операции,
а не первое совпадение общего return/find. Baseline обязан быть зелёным. Ненулевой код из-за отсутствующей
зависимости, прав Windows, синтаксиса fixture или HTTP403 не доказывает обнаружение нужной поломки.
Старые тестовые строки сохранять; новые сценарии добавлять отдельными модулями с реальным запуском.

Повтор HTTP403: [старый случай](https://github.com/mpaykin1/meta6-lab/actions/runs/43238789559),
[повтор auditor](https://github.com/mpaykin1/meta6-lab/actions/runs/43413357215).
Не перезапускать всё подряд: прочитать конкретный job, различать лимит API и отказ политики.
PR выполняет все интеграционные тесты с fixtures; полная live-ревизия репозитория и запись Issue —
только trusted schedule/main/dispatch. Ядро сторожа не править, quota не ослаблять.
Каждый шаг сохранять в общей таблице ZADACHI.md со ссылкой на SHA/PR/Actions.
