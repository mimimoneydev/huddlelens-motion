import {MotionScorer, attachRemoteFallback, CameraMotionController} from '../src/index.js';

const $ = selector => document.querySelector(selector);
const scorer = new MotionScorer({target: 12, cooldownMs: 250, onEvent: render});
const camera = new CameraMotionController({video: $('#camera'), canvas: $('#frames'), scorer});
const detachRemote = attachRemoteFallback({scorer});

function render(event) {
  $('#count').textContent = event.count; $('#progress').style.width = `${event.progress}%`;
  $('#status').textContent = event.complete ? 'Movement goal complete!' : event.accepted ? `${event.source === 'camera' ? 'Camera' : 'D-pad'}: ${event.direction}` : event.type === 'reset' ? 'Alternate left and right' : event.reason.replace('-', ' ');
  if (event.direction) { $('#silhouette').textContent = event.direction === 'left' ? '←' : '→'; $('#silhouette').dataset.direction = event.direction; }
}

$('#left').addEventListener('click', () => scorer.add('left', {source: 'button'}));
$('#right').addEventListener('click', () => scorer.add('right', {source: 'button'}));
$('#reset').addEventListener('click', () => scorer.reset());
$('#camera-button').addEventListener('click', async () => {
  if (camera.running) {
    camera.stop(); $('#camera-button').textContent = 'Enable camera'; $('#camera').classList.remove('visible');
    $('#privacy-state').textContent = 'Camera off'; return;
  }
  try {
    await camera.start(); $('#camera-button').textContent = 'Disable camera'; $('#camera').classList.add('visible');
    $('#privacy-state').textContent = 'Local camera active';
  } catch (error) { $('#status').textContent = error.name === 'NotAllowedError' ? 'Camera permission declined—D-pad still works' : error.message; }
});

window.addEventListener('pagehide', () => { camera.stop(); detachRemote(); });
