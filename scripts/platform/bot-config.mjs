import fs from 'node:fs';
import path from 'node:path';

// Supported screens from scripts/meta-bot/CONTRACT.md. Missing viewports uses core defaults.
const SUPPORTED_SCREENS = new Set(['mobile', 'desktop']);

export function validateBotConfig(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return ['bot.json must be an object'];
  }
  if (!Object.hasOwn(value, 'viewports')) return [];
  if (!Array.isArray(value.viewports) || value.viewports.length === 0) {
    return ['viewports must be a non-empty array'];
  }
  const errors = [];
  for (const name of value.viewports) {
    if (typeof name !== 'string' || !SUPPORTED_SCREENS.has(name)) {
      errors.push('unsupported viewport: ' + JSON.stringify(name));
    }
  }
  return errors;
}

export function checkGameBotConfigs(repoRoot) {
  const games = path.join(repoRoot, 'games');
  const checked = [];
  const errors = [];
  for (const entry of fs.readdirSync(games, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const file = path.join(games, entry.name, 'bot.json');
    if (!fs.existsSync(file)) continue;
    const label = 'games/' + entry.name + '/bot.json';
    checked.push(label);
    try {
      const stat = fs.lstatSync(file);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('configuration must be a regular file');
      for (const error of validateBotConfig(JSON.parse(fs.readFileSync(file, 'utf8')))) {
        errors.push(label + ': ' + error);
      }
    } catch (error) {
      errors.push(label + ': ' + error.message);
    }
  }
  return { checked, errors };
}
