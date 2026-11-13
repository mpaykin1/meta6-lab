# Проверка ассет-пака — оценка 0/100
HARD: **109** · SOFT: **105** · бот v1.0.0
Статистика: {"files": 276, "megabytes": 0.78, "assets": 275, "entities": 14, "max_texture_side": 768, "bot_version": "1.0.0"}

## HARD
- **A6** ×1 — Нет полей ['license', 'provenance'] — происхождение и права не указаны  
  где: atlas.json  
  исправить: Добавь "license": {"type":"…","author":"ChatGPT image gen / автор","commercial":true} и "provenance": {"tool":"…","prompt_sha256":"…","date":"YYYY-MM-DD"} (правило META_GAMES_SOURCE_ALLOWLIST)
- **A7** ×1 — Нет content_flags — не указано, есть ли реальные люди, бренды, политика  
  где: atlas.json  
  исправить: Добавь "content_flags": {"real_persons": [...], "brands": [...], "political": true|false}. Реальные узнаваемые люди/политика = отдельная версия пака без них для МГ, Google Play, Steam, Playgama
- **G2** ×17 — помечен seamless, но края не совпадают (Δ=0.20)  
  где: tiles/manhattan/gold.png, tiles/manhattan/ground_fill.png, tiles/manhattan/wall.png, tiles/moon_resort/gold.png, tiles/moon_resort/ground_fill.png, tiles/moon_resort/wall.png …  
  исправить: Левый край = правый, верх = низ (сделай через offset/wrap)
- **G4** ×3 — фон должен повторяться по X, но шов Δ=0.14  
  где: backgrounds/manhattan/mid.png, backgrounds/reptile_hq/mid.png, backgrounds/studio/mid.png  
  исправить: Левый край фона = правый (бесшовный по горизонтали)
- **G9** ×13 — shoot: нет события удара (на каком кадре урон/выстрел)  
  где: characters/trump_shoot.png, enemies/journalist_attack.png, enemies/mic_drone_attack.png, enemies/document_attack.png, enemies/factcheck_robot_attack.png, enemies/lawsuit_attack.png …  
  исправить: Добавь "events": [{"frame": N, "type": "hit"|"spawn_projectile", "x":.., "y":..}]
- **G9** ×14 — нет hitbox — игра не знает, где тело для попаданий  
  где: trump, journalist, mic_drone, document, factcheck_robot, lawsuit …  
  исправить: Добавь "hitboxes": {"<персонаж>": {"x":..,"y":..,"w":..,"h":..}} (в пикселях кадра)
- **P4** ×21 — все кадры одинаковые — анимации нет  
  где: enemies/alien_auditor_attack.png, enemies/alien_auditor_damage.png, enemies/alien_auditor_defeat.png, enemies/document_attack.png, enemies/document_damage.png, enemies/document_defeat.png …  
  исправить: Нарисуй разные фазы движения
- **P5** ×39 — тело не двигается: меняется лишь 3% пикселей (сдвиг/искры)  
  где: bosses/casino_robot_attack.png, bosses/casino_robot_damage.png, bosses/casino_robot_defeat.png, bosses/casino_robot_idle.png, bosses/casino_robot_movement.png, bosses/giant_journalist_attack.png …  
  исправить: Нарисуй настоящие фазы: руки, ноги, корпус, голова меняются; волна по телу с задержкой

## SOFT
- **A8** ×7 — 7 одинаковых файлов (тайл один на все миры)  
  где: tiles/manhattan/concrete.png = tiles/moon_resort/concrete.png = tiles/rally/concrete.png, tiles/manhattan/elevator.png = tiles/moon_resort/elevator.png = tiles/rally/elevator.png, tiles/manhattan/glass.png = tiles/moon_resort/glass.png = tiles/rally/glass.png, tiles/manhattan/gold.png = tiles/moon_resort/gold.png = tiles/rally/gold.png, tiles/manhattan/hazard.png = tiles/moon_resort/hazard.png = tiles/rally/hazard.png, tiles/manhattan/ladder.png = tiles/moon_resort/ladder.png = tiles/rally/ladder.png …  
  исправить: Оставь один, остальные — ссылкой
- **A9** ×12 — attack помечен loop=true — зациклится  
  где: enemies/journalist_attack.png, enemies/mic_drone_attack.png, enemies/document_attack.png, enemies/factcheck_robot_attack.png, enemies/lawsuit_attack.png, enemies/alien_auditor_attack.png …  
  исправить: loop=false для attack (+ событие конца)
- **A9** ×1 — shoot помечен loop=true — зациклится  
  где: characters/trump_shoot.png  
  исправить: loop=false для shoot (+ событие конца)
- **A9** ×1 — take_damage помечен loop=true — зациклится  
  где: characters/trump_take_damage.png  
  исправить: loop=false для take_damage (+ событие конца)
- **B3** ×1 — 276 отдельных PNG = 276 загрузок на телефоне (правило ВИДИМО И ЭКОНОМНО)  
  где: /  
  исправить: Добавь упакованные атласы packed/<группа>.png + координаты в манифест; исходники оставь
- **G2** ×14 — нет тега seamless_x  
  где: tiles/manhattan/ground_top.png, tiles/manhattan/platform_center.png, tiles/moon_resort/ground_top.png, tiles/moon_resort/platform_center.png, tiles/rally/ground_top.png, tiles/rally/platform_center.png …  
  исправить: Добавь "seamless_x": true для тайлов, которые кладут рядом
- **G5** ×7 — нет углов/склонов/краёв земли — уровни будут прямоугольными  
  где: tiles/rally, tiles/studio, tiles/manhattan, tiles/reptile_hq, tiles/moon_resort, tiles/white_house …  
  исправить: Добавь ground_left, ground_right, corner_in, corner_out, slope_up, slope_down (БЕЗ ПОВТОРОВ)
- **P2** ×3 — 35% полупрозрачных пикселей — размытый край в пиксель-арте  
  где: characters/trump_take_damage.png, props/security_gate.png, props/ufo.png  
  исправить: Альфа только 0 или 255 (без сглаживания), иначе ореол при nearest-фильтре
- **P4** ×6 — 2 повторов соседних кадров  
  где: bosses/giant_journalist_idle.png, bosses/reptile_king_idle.png, characters/trump_golden_rain.png, characters/trump_idle.png, characters/trump_victory.png, effects/speech_bubble.png  
  исправить: Замени повтор новой фазой или увеличь duration_ms
- **P5** ×4 — слабое движение: 12% пикселей меняется  
  где: characters/trump_cap_hurricane.png, characters/trump_golden_rain.png, characters/trump_shoot.png, characters/trump_victory.png  
  исправить: Добавь вторичное движение (одежда, волосы, свет, хвост догоняет)
- **P5** ×1 — тело не двигается: меняется лишь 0% пикселей (сдвиг/искры)  
  где: characters/trump_fall.png  
  исправить: Нарисуй настоящие фазы: руки, ноги, корпус, голова меняются; волна по телу с задержкой
- **P6** ×16 — спрайт упирается в край кадра в 6 кадрах — может быть обрезан  
  где: bosses/truth_machine_attack.png, bosses/truth_machine_damage.png, bosses/truth_machine_defeat.png, bosses/truth_machine_idle.png, bosses/truth_machine_movement.png, characters/trump_shoot.png …  
  исправить: Оставь 1–2 px прозрачного поля внутри кадра
- **P7** ×32 — 44% пикселей далеко от палитры пака  
  где: bosses/reptile_king_attack.png, bosses/reptile_king_damage.png, bosses/reptile_king_defeat.png, bosses/reptile_king_idle.png, bosses/reptile_king_movement.png, bosses/truth_machine_attack.png …  
  исправить: Приведи цвета к палитре пака (единый стиль)
