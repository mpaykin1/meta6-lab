export function routeFor(card, map) {
  const reports = [...String(card.body || '').matchAll(/^КАРТА СИЛ: CHAT FAIL #(\d+) /gm)];
  const failures = new Set(reports.map(x => x[1])).size +
    (/попытка 2 из 2/i.test(card.body || '') ? 2 : 0);
  if (failures >= 2 || /НУЖЕН CLAUDE/i.test(card.body || '')) {
    return {target:'claude',zone:'передано Claude',note:'две неудачи или передано Claude'};
  }

  if (!map || map.schema !== 1 || map.status !== 'полная') {
    return {target:'chat',zone:'нет данных',note:'Карта недоступна; без автоматической выдачи'};
  }
  const entry = map.prs?.find(x => x.number === card.id);
  const stat = map.metrics?.find(x => x.type === entry?.type && x.actor === 'автозадача');
  const zone = stat?.zone || 'нет данных';
  if (zone === 'зелёная') return {target:'auto',zone,note:'допущено'};
  if (zone === 'жёлтая' && (entry?.changedFiles ?? Infinity) <= 5) {
    return {target:'auto',zone,note:'маленькими шагами: 1 PR, не более 5 файлов'};
  }
  return {target:'chat',zone,note:zone === 'жёлтая' ?
    'Превышено 5 файлов: требуется разбиение' : 'Запрет выдачи автозадачам'};
}