// Parse only completed META BOT game results; never infer success from a green emoji alone.
export function passedGamesFromLog(log) {
  if (typeof log !== 'string') throw Error('META BOT log text required');
  const games = new Map();
  let active = null;
  for (const line of log.split(/\r?\n/)) {
    const start = /▶\s+games\/([a-zA-Z0-9][a-zA-Z0-9_-]*)\s*$/.exec(line);
    if (start) {
      active = start[1];
      games.set(active, {mobile: false, desktop: false, failed: false});
      continue;
    }
    if (!active) continue;
    const outcome = /([✅❌])\s+(mobile|desktop)(?:\s*\([^)]*\))?:\s*уровней\s+(\d+),\s*пройдено\s+(\d+)/u.exec(line);
    if (!outcome) continue;
    const current = games.get(active);
    const total = Number(outcome[3]), passed = Number(outcome[4]);
    if (outcome[1] !== '✅' || !total || passed !== total) current.failed = true;
    else current[outcome[2]] = true;
  }
  return [...games].filter(([, x]) => !x.failed && x.mobile && x.desktop)
    .map(([name]) => name).sort();
}

export async function latestBotGames(api, url, headers, now = Date.now()) {
  const response = await api('/actions/workflows/meta-bot.yml/runs?per_page=30');
  const runs = response.workflow_runs;
  if (!Array.isArray(runs)) throw Error('META BOT Actions runs not returned');
  const completed = runs.find(run => run.head_branch === 'main' &&
    run.status === 'completed' && run.conclusion === 'success' &&
    now - Date.parse(run.created_at) <= 24 * 60 * 60 * 1000);
  if (!completed) return {games: [], runUrl: null, detail: 'за последние 24 часа нет подтверждённого PASS на main'};
  const jobs = await api('/actions/runs/' + completed.id + '/jobs?per_page=100');
  const job = jobs.jobs?.find(item => item.name === 'bot' && item.conclusion === 'success');
  if (!job) throw Error('Completed successful META BOT run has no successful bot job');
  const logs = await fetch(url + '/actions/jobs/' + job.id + '/logs', {headers});
  if (!logs.ok) throw Error('META BOT job logs HTTP ' + logs.status);
  const games = passedGamesFromLog(await logs.text());
  return {games, runUrl: completed.html_url, detail: games.length ?
    games.join(', ') : 'лог успешного запуска не содержит подтверждённых прохождений'};
}
