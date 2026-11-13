export function jumpTarget(config, viewport, button) {
  const target = config.jumpButton;
  if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) {
    throw Error('Phone bot needs an explicit visible jump target');
  }
  const point = { x: target.x * viewport.width, y: target.y * viewport.height };
  if (point.x < button.x || point.x > button.x + button.width ||
      point.y < button.y || point.y > button.y + button.height) {
    throw Error('Phone jump target misses the visible action');
  }
  return point;
}
