export function routeFor(card, map) {
  const reports = [...String(card.body || '').matchAll(/^КАРТА СИЛ: CHAT FAIL #(\d+) /gm)];
  const failures = new Set(reports.map(x => x[1])).size +
    (/попытка 2 из 2/i.test(card.body || '') ? 2 : 0);
  if (failures >= 2 || /НУЖЕН CLAUDE/i.test(card.body || '')) {
    return {target:'claude',zone:'передано Claude',note:'две неудачи или передано Claude'};
  }

  if (!usableMap(map)) {
    return {target:'chat',zone:'нет данных',note:'Карта недоступна; без автоматической выдачи'};
  }
  const entry = map.prs?.find(x => x.number === card.id);
  const stat = map.metrics?.find(x => x.type === entry?.type && x.actor === 'автозадача');
  let zone = stat?.zone || 'нет данных';
  // Claude 16.11.2026: у строки «автозадача» почти везде «нет данных» — без запасного правила все карточки
  // уходили в чат и автозадачи 39 из 40 запусков простаивали. Нет своих данных → зона типа в строке
  // «неизвестно», но не выше жёлтой: только маленький пробный шаг.
  if (zone === 'нет данных') {
    const fallback = map.metrics?.find(x => x.type === entry?.type && x.actor === 'неизвестно')?.zone;
    if (fallback === 'зелёная' || fallback === 'жёлтая') zone = 'жёлтая';
  }
  if (zone === 'зелёная') return {target:'auto',zone,note:'допущено'};
  const files = card.changedFiles ?? entry?.changedFiles;
  if (zone === 'жёлтая' && Number.isInteger(files) && files >= 0 && files <= 5) {
    return {target:'auto',zone,note:'маленькими шагами: 1 PR, не более 5 файлов'};
  }
  return {target:'chat',zone,note:zone === 'жёлтая' ?
    'Превышено 5 файлов: требуется разбиение' : 'Запрет выдачи автозадачам'};
}
// Карта годится: полная, или «устарела» не больше 24 часов (сбой сбора не останавливает выдачу).
export function usableMap(map, now = Date.now()) {
  if (!map || map.schema !== 1 || !Array.isArray(map.metrics) || !map.metrics.length) return false;
  if (map.status === 'полная') return true;
  if (map.status !== 'устарела') return false;
  const since = Date.parse(map.staleSince);
  return Number.isFinite(since) && now - since <= 24 * 3600 * 1000;
}
