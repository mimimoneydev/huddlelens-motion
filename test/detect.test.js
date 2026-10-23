import test from 'node:test';
import assert from 'node:assert/strict';
import {detectMotionDirection} from '../src/index.js';

function frame(width, height, side = null) {
  const value = new Uint8ClampedArray(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const x = pixel % width;
    const active = side === 'left' ? x < width / 2 : side === 'right' ? x >= width / 2 : false;
    value[pixel * 4] = value[pixel * 4 + 1] = value[pixel * 4 + 2] = active ? 255 : 0;
    value[pixel * 4 + 3] = 255;
  }
  return value;
}

test('detects dominant horizontal changes from low-resolution RGBA frames', () => {
  const width = 20; const previous = frame(width, 10);
  assert.equal(detectMotionDirection(previous, frame(width, 10, 'left'), {width}), 'left');
  assert.equal(detectMotionDirection(previous, frame(width, 10, 'right'), {width}), 'right');
});

test('rejects absent, malformed, and evenly distributed changes', () => {
  const previous = frame(20, 10);
  assert.equal(detectMotionDirection(null, previous, {width: 20}), null);
  assert.equal(detectMotionDirection(previous, new Uint8ClampedArray(8), {width: 20}), null);
  assert.equal(detectMotionDirection(previous, new Uint8ClampedArray(previous.length).fill(255), {width: 20}), null);
});
