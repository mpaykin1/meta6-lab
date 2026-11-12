# ТРИ СТОРОЖА — продолжение после #238
Исходный PR #238 уже слит: https://github.com/mpaykin1/meta6-lab/commit/9546bef2d74794f6ecc717a2f4095682fd2e137f .
Ветка продолжения: `lab/storozha-nedelya`. PR #277: https://github.com/mpaykin1/meta6-lab/pull/277 . не сливать самостоятельно.

- Шаг 3: код подготовлен — отдельный updater через update-branch/expected_head_sha, 30 минут, action_required approval при доступных правах; конфликтный detector сохранён. [Коммит шага 3](https://github.com/mpaykin1/meta6-lab/commit/59764577ef9a31028534f2266d3ec5edba8b685b). Live не подтверждён: нужен AUTOFINISH_UPDATE_TOKEN (тот же контракт, что #248), затем принятие Claude.
- Шаг 4: код квоты/итога сохранён; повторное закрытие проверяет дату через staleDecision (не закрывает при неизвестной дате), запись запрещена вне meta6-lab. [Коммит шага 4](https://github.com/mpaykin1/meta6-lab/commit/99143c36771661065137dfe304b3601398986539). Обязательность checks в настройках пока не подтверждена.
- Шаг 5: код готов — previous_filename проверяется как удаление старого пути; применяется реестр защищённых оригиналов; workflow/бот/тесты сохраняют запрет; closed очищает запись очереди. Новая папка проходит прежний узкий контракт. [Коммит шага 5](https://github.com/mpaykin1/meta6-lab/commit/90c3124b450a8b6a4a28211c78781aa73bed61ab).
- Шаг 6: [красный прогон 43237378766](https://github.com/mpaykin1/meta6-lab/actions/runs/43237378766) реально отклонил переименование и отсутствие head lease (оба отдельных шага failure). Код восстановлен следующим коммитом. [Первый зелёный прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/43237279531) на 90c3124; добавлены ещё 4 поведенческие мутации maintenance, окончательный CI пока не подтверждён. Прежний красный лимит: https://github.com/mpaykin1/meta6-lab/actions/runs/43001145809 .
- Шаг 7: готово — существующий раздел НЕДЕЛЯ БЕЗ CLAUDE содержит все запрошенные ограничения; повторно не добавлять.

Регистрация: https://github.com/mpaykin1/meta6-lab/commit/6d272840d071105abb6d92cc17b251b34d7f90d0 .
Проверки защищённых путей и квоты не обходить; зелёный весь PR до фактического результата не заявлять.

Мутация: https://github.com/mpaykin1/meta6-lab/commit/6b522658d60018347b807d9b93197b10160d7efc .
Следующий шаг: проверить окончательный CI, обязательные protected/quota не обходить.
