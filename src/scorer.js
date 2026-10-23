const DIRECTIONS = new Map([
  ['left', 'left'], ['right', 'right'], ['ArrowLeft', 'left'], ['ArrowRight', 'right'],
  ['dpad-left', 'left'], ['dpad-right', 'right'], [21, 'left'], [22, 'right'],
]);

export function normalizeDirection(value) { return DIRECTIONS.get(value) || null; }

export class MotionScorer {
  #count = 0; #lastDirection = null; #lastAcceptedAt = -Infinity;

  constructor({target = 12, cooldownMs = 300, requireAlternating = true, onEvent = () => {}} = {}) {
    this.target = Math.max(1, Number(target) || 12);
    this.cooldownMs = Math.max(0, Number(cooldownMs) || 0);
    this.requireAlternating = Boolean(requireAlternating);
    this.onEvent = onEvent;
  }

  add(direction, {source = 'unknown', timestamp = performance.now()} = {}) {
    const normalized = normalizeDirection(direction);
    const reason = !normalized ? 'invalid-direction'
      : timestamp - this.#lastAcceptedAt < this.cooldownMs ? 'cooldown'
        : this.requireAlternating && normalized === this.#lastDirection ? 'not-alternating' : null;
    if (reason) return this.#emit({type: 'ignored', accepted: false, reason, direction: normalized, source, timestamp});
    this.#count += 1; this.#lastDirection = normalized; this.#lastAcceptedAt = timestamp;
    return this.#emit({type: this.complete ? 'complete' : 'move', accepted: true, direction: normalized, source, timestamp});
  }

  reset() {
    this.#count = 0; this.#lastDirection = null; this.#lastAcceptedAt = -Infinity;
    return this.#emit({type: 'reset', accepted: false, reason: null, direction: null, source: 'system', timestamp: performance.now()});
  }

  get count() { return this.#count; }
  get complete() { return this.#count >= this.target; }
  get progress() { return Math.min(100, Math.round(this.#count / this.target * 100)); }
  get snapshot() { return Object.freeze({count: this.count, target: this.target, progress: this.progress, complete: this.complete, lastDirection: this.#lastDirection}); }

  #emit(event) {
    const value = Object.freeze({...event, ...this.snapshot}); this.onEvent(value); return value;
  }
}
