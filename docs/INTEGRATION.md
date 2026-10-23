# Integration guide

## Browser and television web apps

Install the package or import `src/index.js` directly. Create one scorer and connect both input paths so the application remains usable without camera permission:

```js
import {
  MotionScorer,
  CameraMotionController,
  attachRemoteFallback,
} from 'huddlelens-motion';

const scorer = new MotionScorer({
  target: 12,
  cooldownMs: 300,
  onEvent(event) {
    progress.textContent = `${event.count} / ${event.target}`;
    if (event.complete) announce('Movement goal complete');
  },
});

const detachRemote = attachRemoteFallback({scorer});
const camera = new CameraMotionController({video, canvas, scorer});

cameraButton.onclick = () => camera.running ? camera.stop() : camera.start();
window.addEventListener('pagehide', () => {
  camera.stop();
  detachRemote();
});
```

The host page needs camera permission and a secure context (`https://` or localhost). Camera permission must always be user initiated. The remote path works with standard `ArrowLeft`/`ArrowRight` keyboard events and Android/Fire TV key codes 21/22.

## Accessibility applications

- Never make camera permission a prerequisite. Keep D-pad buttons and keyboard input visible.
- Announce accepted moves and completion through an ARIA live region, not every rejected/noisy frame.
- Use a target appropriate to the user and allow `requireAlternating: false` for one-sided mobility.
- Allow longer `cooldownMs` values for slower or switch-based input.
- Do not infer identity, health, pose, disability, or emotion from direction events.
- Stop the camera when the activity, page, or app loses visibility.

## Fire TV and embedded WebViews

Forward native remote events as DOM keyboard events or call `scorer.add('left', {source: 'remote'})` directly. If the WebView supports `getUserMedia`, connect a local `<video>` and `<canvas>` to `CameraMotionController`. Otherwise omit the camera controller entirely—the scoring API is identical.

The package intentionally has no analytics or backend client. Applications may observe anonymous score events, but should not transmit them without a separate, disclosed consent decision.

## Tuning detection

`CameraMotionController` accepts a `detection` object containing:

- `threshold`: per-channel change threshold; increase it in noisy lighting.
- `minChangedRatio` and `minChangedPixels`: minimum changed image area.
- `dominance`: how strongly one half of the frame must dominate.

The default 96×54 processing size is adequate for coarse side-to-side activity and deliberately unsuitable for identification. This is direction detection, not pose estimation.
