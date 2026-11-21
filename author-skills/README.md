# Авторские игровые скилы

[Открыть интерактивный каталог](index.html).

Снимки исходников **9 авторских скилов** для Claude Code и GitHub:

- [Skill Nexus](skill-synergy-manager/) v0.8.0
- [Living Image Animator](living-image-animator/) v0.4.0
- [Hero Animator](hero-animator/) v0.17.1
- [Meta Game Fusion](meta-game-fusion/) v1.3.0
- [Blender Model Animation Enhancer](blender-model-animation-enhancer/) v1.9.0
- [Game Style Forge](game-style-forge/) v1.10.0
- [Voxel Atmosphere Engine](voxel-atmosphere-engine/) v0.10.0
- [Voxel Game Creator](voxel-game-creator/) v0.19.0
- [Casual Game Studio](casual-game-studio/) v1.2.1

**Исходники и инструкции доступны.** Оригинальные бинарные ресурсы **160 файлов, 8 667 225 байт** ещё не импортированы в эту ветку. Не подменять их сгенерированными заменами.

## Восстановление оригинальных ассетов

1. Экспортировать исходные TAR.GZ-архивы указанных трёх личных плагинов: `voxel-atmosphere-engine`, `casual-game-studio`, `voxel-game-creator`.
2. Запустить из корня репозитория:

```bash
python3 author-skills/import_original_assets.py \
  --archive voxel-atmosphere-engine=/path/to/voxel-atmosphere-engine.tar.gz \
  --archive casual-game-studio=/path/to/casual-game-studio.tar.gz \
  --archive voxel-game-creator=/path/to/voxel-game-creator.tar.gz
```

3. Закоммитить восстановленные бинарные файлы в эту же ветку PR №430.

Импорт сверяет точные пути, число файлов, размеры и сигнатуры оригиналов по [манифесту](original-assets.manifest.json). Команда `python3 author-skills/import_original_assets.py --check` покажет отсутствующие исходные ассеты. Исходный код доступен для проверки до переноса изображений и моделей; полная графическая проверка потребует бинарных файлов.
