# huddlelens-motion

An MIT-licensed, dependency-free library for privacy-first movement scoring on television devices.

`huddlelens-motion` processes deliberately low-resolution camera frames locally, converts coarse horizontal changes into anonymous `left`/`right` direction events, and falls back to Fire TV D-pad or keyboard controls when a camera is unavailable or permission is declined.

Family fitness and accessible TV experiences should not require uploading video or owning specialized hardware.

## Features

- Browser-based on-device motion detection using 96×54 in-memory frames by default.
- Fire TV, Android TV, keyboard, switch-adapter, and on-screen button input.
- Alternating repetition scoring with cooldown/noise filtering and progress events.
- No video storage, recording, uploads, analytics, or runtime dependencies.
- Camera-free operation is a first-class path, not a degraded afterthought.
- Unit tests and a responsive browser demo.
- MIT license for reuse in commercial and open-source applications.

## Try the demo

Requires Node.js 20 or newer:

```bash
npm run demo
```

Open `http://localhost:4174`. Enable the camera after reading the privacy notice, or use Left/Right arrow keys and the on-screen buttons without granting permission.

## Quick start

```bash
npm install huddlelens-motion
```

```js
import {MotionScorer, attachRemoteFallback} from 'huddlelens-motion';

const scorer = new MotionScorer({
  target: 12,
  onEvent: event => console.log(event.count, event.progress, event.source),
});

const detach = attachRemoteFallback({scorer});
// Later: detach();
```

Camera support is opt-in:

```js
import {CameraMotionController} from 'huddlelens-motion';

const camera = new CameraMotionController({
  video: document.querySelector('video'),
  canvas: document.querySelector('canvas'),
  scorer,
});

await camera.start(); // call only after an explicit user action
camera.stop();
```

See the [integration guide](docs/INTEGRATION.md) for television WebViews, direct remote input, accessibility considerations, and detector tuning.

## Privacy by construction

```text
camera → downscaled local canvas → frame difference → left/right/null → score
D-pad ─────────────────────────────────────────────→ left/right → score
```

The package retains only two downscaled frame buffers while the controller is running. It has no network or storage code. Stopping it clears the retained frame and closes every media track. See the complete [privacy and security model](docs/PRIVACY.md), including host-application responsibilities and non-goals.

This is coarse direction detection—not pose estimation, facial recognition, identity analysis, or a medical measurement.

## API

### `new MotionScorer(options)`

Options include `target`, `cooldownMs`, `requireAlternating`, and `onEvent`. Call `add(direction, metadata)`, `reset()`, or read the immutable `snapshot`.

### `detectMotionDirection(previous, current, options)`

Compares equal-length RGBA buffers. Requires `options.width`; returns `left`, `right`, or `null`.

### `new CameraMotionController(options)`

Connects a video element, private canvas, and scorer. `start()` requests permission and `stop()` closes tracks and clears frame state.

### `attachRemoteFallback(options)`

Listens for Left/Right D-pad keyboard events and returns a detach function. Android key codes 21 and 22 are also recognized.

## Development

```bash
npm test
npm pack --dry-run
```

The test suite covers direction detection, malformed frames, background changes, alternating scoring, cooldown behavior, and D-pad attachment. Contributions must preserve the camera-free path and the documented privacy properties.

## Origin and impact

This library was extracted from HuddleLens, an accessible live-sports companion for Fire TV. It is published as an additional open-source project so other TV, education, rehabilitation, and family-experience developers can reuse the privacy-first input layer without adopting the rest of HuddleLens.

## License

[MIT](LICENSE) © 2026 HuddleLens contributors.
