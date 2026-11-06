// Frame-rate-driven visual budget shared by mobile and desktop; never detects the bot.
export function installAdaptiveQuality({ perf, bloom, dofH, dofV }) {
  const defaults = { bloom: bloom.enabled, h: dofH.enabled, v: dofV.enabled };
  let tier = 0, slowSamples = 0, fastSamples = 0;
  perf.minScale = 0.5;
  return function adaptToMeasuredFps(fps) {
    if (!Number.isFinite(fps) || fps <= 0) return;
    if (fps < 30) {
      slowSamples++;
      fastSamples = 0;
      if (slowSamples >= 1) { tier = Math.min(2, tier + 1); slowSamples = 0; }
    } else if (fps > 50) {
      fastSamples++;
      slowSamples = 0;
      if (fastSamples >= 3) { tier = Math.max(0, tier - 1); fastSamples = 0; }
    } else {
      slowSamples = 0;
      fastSamples = 0;
    }
    // Keep the complete cinematic post stack when hardware sustains normal FPS.
    // The existing render loop continues to own all dimensions and pixel ratios.
    dofH.enabled = tier === 0 && defaults.h;
    dofV.enabled = tier === 0 && defaults.v;
    bloom.enabled = tier < 2 && defaults.bloom;
    perf.minScale = tier === 2 ? 0.32 : tier === 1 ? 0.44 : 0.5;
  };
}
