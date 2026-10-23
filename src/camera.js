import {detectMotionDirection} from './detect.js';

/**
 * Reads deliberately small in-memory frames. This module contains no network,
 * persistence, recording, MediaRecorder, fetch, beacon, or upload code.
 */
export class CameraMotionController {
  #stream = null; #frame = null; #animation = null; #lastAcceptedAt = -Infinity;

  constructor({video, canvas, scorer, width = 96, height = 54, scanCooldownMs = 350, detection = {}} = {}) {
    if (!video || !canvas?.getContext || !scorer?.add) throw new TypeError('video, canvas, and MotionScorer are required');
    this.video = video; this.canvas = canvas; this.scorer = scorer;
    this.width = Math.max(16, Math.round(width)); this.height = Math.max(9, Math.round(height));
    this.scanCooldownMs = Math.max(0, Number(scanCooldownMs) || 0); this.detection = detection;
    this.canvas.width = this.width; this.canvas.height = this.height;
  }

  async start(constraints = {video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 360}}, audio: false}) {
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) throw new Error('Camera capture is unavailable');
    if (this.running) return;
    this.#stream = await globalThis.navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.#stream; this.video.muted = true; await this.video.play?.(); this.#scan();
  }

  stop() {
    if (this.#animation !== null) cancelAnimationFrame(this.#animation);
    this.#stream?.getTracks().forEach(track => track.stop());
    this.video.srcObject = null; this.#stream = null; this.#frame = null; this.#animation = null; this.#lastAcceptedAt = -Infinity;
  }

  get running() { return Boolean(this.#stream); }

  #scan = () => {
    if (!this.running) return;
    if (this.video.readyState >= 2) {
      const context = this.canvas.getContext('2d', {willReadFrequently: true});
      context.drawImage(this.video, 0, 0, this.width, this.height);
      const pixels = context.getImageData(0, 0, this.width, this.height).data;
      const direction = detectMotionDirection(this.#frame, pixels, {width: this.width, ...this.detection});
      const now = performance.now();
      if (direction && now - this.#lastAcceptedAt >= this.scanCooldownMs) {
        const result = this.scorer.add(direction, {source: 'camera', timestamp: now});
        if (result.accepted) this.#lastAcceptedAt = now;
      }
      this.#frame = new Uint8ClampedArray(pixels);
    }
    this.#animation = requestAnimationFrame(this.#scan);
  };
}
