import {normalizeDirection} from './scorer.js';

/** Attach keyboard/Fire TV D-pad input without requiring a camera. */
export function attachRemoteFallback({target = globalThis.document, scorer, preventDefault = true} = {}) {
  if (!target?.addEventListener || !scorer?.add) throw new TypeError('A keyboard event target and MotionScorer are required');
  const listener = event => {
    const direction = normalizeDirection(event.key) || normalizeDirection(event.keyCode);
    if (!direction) return;
    if (preventDefault) event.preventDefault?.();
    scorer.add(direction, {source: 'remote', timestamp: event.timeStamp || performance.now()});
  };
  target.addEventListener('keydown', listener);
  return () => target.removeEventListener('keydown', listener);
}
