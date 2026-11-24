// Правило решения для уборки веток МГЛ (владелец 24.11.2026).
export function decide(b, ctx) {
  // b = {name, sha, ageDays}; ctx = {openHeads:Set, mergedHeads:Set, closedHeads:Set, protectedSafe:Set, ageDays}
  const safe = b.name.replace(/^lab\//, '').replace(/\//g, '-');
  if (ctx.openHeads.has(b.name)) return 'keep:open-pr';
  if (ctx.protectedSafe.has(safe)) return 'keep:linked';
  if (b.ageDays <= 1) return 'keep:fresh';
  if (ctx.mergedHeads.has(b.name)) return 'delete:merged';
  if (b.ageDays <= ctx.ageDays) return 'keep:recent';
  return ctx.closedHeads.has(b.name) ? 'delete:closed' : 'delete:stale';
}

