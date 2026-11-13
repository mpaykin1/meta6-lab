// GitHub-only daily noise meter + non-core scheduling fuse.
const botNames=['status-dlya-claude','investigation-snapshot','zadachi-watch','zanyato-watch','sliyanie-status','dispatcher','journal-projections','github-actions[bot]'];
const authorWorkflow={'status-dlya-claude bot':'status-dlya-claude.yml','investigation-snapshot':'investigation-snapshot.yml','zadachi-watch':'zadachi-watch.yml','zanyato-watch':'zanyato-watch.yml','sliyanie-status bot':'sliyanie-status.yml'};
const CORE=/^(?:storozha-|kontur-guard|meta-games-guard|meta-bot|report-completion-guard|lab-shared-deletion-guard|pr-autofinish|sync-from-meta6)/;
export function isBot(c) {
 const name=String(c?.commit?.author?.name||'').toLowerCase();
 const mail=String(c?.commit?.author?.email||'').toLowerCase();
 const msg=String(c?.commit?.message||'').split('\n')[0].toLowerCase();
 return name.includes('[bot]') || mail.includes('[bot]') || botNames.some(b=>name.includes(b)) || /^(?:status: refresh facts|zadachi:|zanyato:|sliyanie-status:|journal: compile|chore: refresh dispatcher queue|investigation: refresh)/.test(msg);
}
export function summarize(commits,openPRs,finish,scheduled,passedSHA=new Set()) {
 const total=commits.length,bots=commits.filter(isBot).length;
 const useful=commits.filter(c=>passedSHA.has(c.sha)).length;
 return {total,useful,bots,openPRs,finish,scheduled,benefit:total?Math.round(100*useful/total):0};
}
export function chooseFuse(commits,scheduledPaths) {
 const counts=new Map();
 for(const c of commits.filter(isBot)) {
   const author=c.commit?.author?.name||'';
   const name=authorWorkflow[author];
   if(!name || CORE.test(name) || !scheduledPaths.includes(name)) continue;
   counts.set(name,(counts.get(name)||0)+1);
 }
 return [...counts].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
}
export function needsEscalation(days) {
 if(days.length<2) return false;
 const tail=days.slice(-2);
 return tail[0].date!==tail[1].date && tail.every(d=>d.benefit<50);
}
