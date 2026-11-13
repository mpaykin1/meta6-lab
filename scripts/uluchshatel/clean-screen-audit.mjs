/**
 * Rule 1, ЧИСТЫЙ ЭКРАН. A pure auditor for temporal DOM snapshots.
 * Does not modify any game. Browser probes must supply real snapshots.
 */
export function auditCleanScreen({ frames, viewport, transientMaxMs = 6000 }) {
  if (!Array.isArray(frames) || frames.length < 2) {
    throw new Error('Need at least two live snapshots');
  }
  if (!viewport || !(viewport.width > 0) || !(viewport.height > 0)) {
    throw new Error('Need actual viewport dimensions');
  }
  const issues = [];
  const textFirstSeen = new Map();
  let previous = -Infinity;

  for (const frame of frames) {
    if (!Number.isFinite(frame.timeMs) || frame.timeMs <= previous) {
      throw new Error('Snapshot timestamps must strictly increase');
    }
    if (!Array.isArray(frame.nodes)) throw new Error('Snapshot nodes are required');
    previous = frame.timeMs;
    const seenIds = new Set();
    for (const node of frame.nodes) {
      if (!node || typeof node.id !== 'string' || node.id.length === 0) {
        throw new Error('Each observed DOM node needs stable identity');
      }
      if (seenIds.has(node.id)) throw new Error('Duplicate DOM identity: ' + node.id);
      seenIds.add(node.id);
      if (node.visible !== true) continue;

      const text = typeof node.text === 'string' ? node.text.trim() : '';
      const isButton = String(node.tag || '').toLowerCase() === 'button' || node.role === 'button';
      const aria = typeof node.ariaLabel === 'string' ? node.ariaLabel.trim() : '';

      if (isButton && !aria) {
        issues.push({ kind: 'button-missing-aria', id: node.id, timeMs: frame.timeMs });
      }
      // Unicode symbols / icons are allowed; words on buttons are not.
      if (isButton && text && !/^[\p{Symbol}\p{Other_Symbol}\p{Punctuation}\s]+$/u.test(text)) {
        issues.push({ kind: 'text-on-button', id: node.id, timeMs: frame.timeMs });
      }
      if (node.isMenuToggle) {
        const rect = node.rect;
        if (!rect || !(rect.x >= viewport.width * 0.7) ||
            !(rect.y >= 0 && rect.y <= viewport.height * 0.25)) {
          issues.push({ kind: 'menu-not-top-right', id: node.id, timeMs: frame.timeMs });
        }
      }
      if (node.withinMenu) {
        if (!node.menuOpen) {
          issues.push({ kind: 'closed-menu-visible', id: node.id, timeMs: frame.timeMs });
        }
        continue;
      }
      if (isButton || !text) continue;
      // Do not trust CSS classes, animation names or declared timeouts.
      // A transient message is valid only when it disappears in later snapshots.
      if (!textFirstSeen.has(node.id)) textFirstSeen.set(node.id, frame.timeMs);
    }
  }

  for (const [id, start] of textFirstSeen) {
    const after = frames.filter(frame => frame.timeMs > start + transientMaxMs);
    if (after.length === 0) {
      issues.push({ kind: 'transient-not-observed-to-fade', id, timeMs: start });
      continue;
    }
    if (after.some(frame => frame.nodes.some(node => node.id === id && node.visible === true &&
      !node.withinMenu && typeof node.text === 'string' && node.text.trim() !== ''))) {
      issues.push({ kind: 'persistent-hud-text', id, timeMs: start });
    }
  }
  return { ok: issues.length === 0, issues };
}
