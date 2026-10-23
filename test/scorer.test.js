import test from 'node:test';
import assert from 'node:assert/strict';
import {MotionScorer, attachRemoteFallback} from '../src/index.js';

test('scores alternating input and reports bounded progress', () => {
  const scorer = new MotionScorer({target: 3, cooldownMs: 0});
  assert.equal(scorer.add('left', {timestamp: 1}).accepted, true);
  assert.equal(scorer.add('left', {timestamp: 2}).reason, 'not-alternating');
  scorer.add('right', {timestamp: 3}); scorer.add('ArrowLeft', {timestamp: 4});
  assert.deepEqual(scorer.snapshot, {count: 3, target: 3, progress: 100, complete: true, lastDirection: 'left'});
});

test('cooldown filters repeated camera noise', () => {
  const scorer = new MotionScorer({cooldownMs: 300, requireAlternating: false});
  assert.equal(scorer.add('left', {timestamp: 1000}).accepted, true);
  assert.equal(scorer.add('right', {timestamp: 1100}).reason, 'cooldown');
  assert.equal(scorer.add('right', {timestamp: 1300}).accepted, true);
});

test('remote fallback handles D-pad keys and can be detached', () => {
  let listener; let prevented = false;
  const target = {addEventListener: (_name, fn) => { listener = fn; }, removeEventListener: (_name, fn) => assert.equal(fn, listener)};
  const scorer = new MotionScorer({cooldownMs: 0}); const detach = attachRemoteFallback({target, scorer});
  listener({key: 'ArrowLeft', timeStamp: 1, preventDefault: () => { prevented = true; }});
  assert.equal(scorer.count, 1); assert.equal(prevented, true); detach();
});
