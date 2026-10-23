# Privacy and security model

## Data flow

```text
Camera permission → local video element → 96×54 canvas frame
                                        → RGB frame difference
                                        → left/right/null event
                                        → movement score

D-pad/keyboard ─────────────────────────→ left/right event → movement score
```

Only the latest two downscaled RGBA frame buffers exist in memory. Starting a new frame replaces the older buffer. Calling `stop()` clears the retained frame reference and stops every media track.

The package contains no `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `MediaRecorder`, IndexedDB, storage, analytics, facial recognition, identity matching, or video encoding code. It cannot upload or persist camera frames by itself.

## Guarantees and host responsibilities

The library guarantees that its own code performs local direction detection and does not store or transmit frames. It cannot prevent a host application, browser extension, compromised page, or operating system from accessing data independently. Integrators should:

1. Serve the application over HTTPS with a restrictive Content Security Policy.
2. Request camera access only after a clear user action.
3. Show a persistent indicator while the camera is active.
4. stop the controller when leaving or hiding the activity.
5. Avoid third-party scripts on camera-enabled pages.
6. Keep the remote fallback fully functional when permission is refused.
7. Document any telemetry added by the host separately; never describe host telemetry as part of this library.

## Non-goals

This library is not a medical device, safety monitor, identity system, posture analyzer, or precise exercise tracker. It detects coarse horizontal image changes and produces anonymous direction events.
