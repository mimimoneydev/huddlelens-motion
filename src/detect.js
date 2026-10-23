const DEFAULTS = Object.freeze({threshold: 26, minChangedRatio: 0.018, minChangedPixels: 18, dominance: 0.12});

/** Convert differences between two RGBA frames into an anonymous horizontal direction event. */
export function detectMotionDirection(previous, current, options = {}) {
  const width = Number(options.width);
  if (!previous || !current || previous.length !== current.length || !Number.isInteger(width) || width < 2 || current.length % 4 !== 0) return null;
  const pixelCount = current.length / 4;
  if (pixelCount % width !== 0) return null;
  const settings = {...DEFAULTS, ...options};
  let left = 0; let right = 0; let changed = 0;
  for (let index = 0; index < current.length; index += 4) {
    const delta = Math.abs(current[index] - previous[index])
      + Math.abs(current[index + 1] - previous[index + 1])
      + Math.abs(current[index + 2] - previous[index + 2]);
    if (delta < settings.threshold * 3) continue;
    changed += 1;
    if (((index / 4) % width) < width / 2) left += 1; else right += 1;
  }
  if (changed < Math.max(settings.minChangedPixels, pixelCount * settings.minChangedRatio)) return null;
  if (Math.abs(left - right) / Math.max(1, changed) < settings.dominance) return null;
  return left > right ? 'left' : 'right';
}

export const motionDetectionDefaults = DEFAULTS;
