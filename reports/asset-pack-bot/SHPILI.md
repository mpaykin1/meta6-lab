# Туманные шпили — прогресс по шагам

- [x] Шаг 0: прочитаны правила и оригинал 26 ассетов (только чтение), задача зарегистрирована. SHA [6254fdad](https://github.com/mpaykin1/meta6-lab/commit/6254fdad5b9e0b7c2a6c3048466817ff81ff3988).
- [x] Шаг 1: добавлен вид htmlpack/1, Chrome screenshot harness, HP1–HP8, ловушки и 9 мутантов; версия 2.3.0. SHA [fc8e57ee](https://github.com/mpaykin1/meta6-lab/commit/fc8e57ee4b871bb6de8956566396d3c3a8eab4ec); [ASSET CHECK #43457107383](https://github.com/mpaykin1/meta6-lab/actions/runs/43457107383): 61 тест и 31/31 мутантов PASS. Результат пака: HP8 (браузерный сбой).
- [x] Шаг 2, партия 1: 26→32; враг, мачта, мост, спутник, предмет, гроза; сохранены все 26 ID. SHA [bac80681](https://github.com/mpaykin1/meta6-lab/commit/bac806819751dfe6cc32982c892179aa21a44520).
- [x] Исправление HP8 (ошибка runtime): `Frustum.intersectsObject(Group)` заменён на повторно используемый bounding sphere. SHA [845a1e11](https://github.com/mpaykin1/meta6-lab/commit/845a1e11d5a3a9ffa280adaf0b609a2720dc2ccc). Новый [прогон ASSET CHECK #43458823264](https://github.com/mpaykin1/meta6-lab/actions/runs/43458823264).
- [x] [ASSET CHECK #43458823264](https://github.com/mpaykin1/meta6-lab/actions/runs/43458823264): все 32 ассета измерены; пять новых прошли, единственный HARD HP5 — детальность storm-heart 0.0271 < эталон p10 0.0408. Подтверждение: artifact `asset-check-reports` прогона.
- [x] Исправлен HP5: шторм получил процедурную текстуру из 270 ветвящихся молний, анимируемую с одним draw call. SHA [0c100193](https://github.com/mpaykin1/meta6-lab/commit/0c100193577bbc558a42f7f321ad5158ebb3f0ca).
- [x] Замер [ASSET CHECK #43465981855](https://github.com/mpaykin1/meta6-lab/actions/runs/43465981855) выявил HP5 у `shattered-mast`: видимость 0.49452 < p10 эталона 0.49898. Увеличены живая световая аура и площадь фактурных переломов (без ослабления проверки), SHA [7c6ff1b8](https://github.com/mpaykin1/meta6-lab/commit/7c6ff1b8fb00939c394ebb7108ef14ca59e4fe52).
- [ ] Подтвердить HARD=0 новой партии в Chrome.
- [ ] Шаг 3: PR #296, зелёная проверка, merge, LAB Pages и точная строка 200 с URL.
