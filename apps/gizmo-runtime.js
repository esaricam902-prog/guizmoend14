// Remplacement navigateur de '@gizmo/runtime'.
// Permet aux codes exportés depuis Gizmo de tourner tels quels dans une page HTML.

// Fichiers de content.gizmo.party chargés via fetch ou crossOrigin : ce serveur
// ne renvoie pas d'en-têtes CORS, donc on sert une copie locale (apps/assets/).
const GIZMO_CONTENT = 'https://content.gizmo.party/';
const LOCAL_ASSETS = {
  'a5e51cda-9915-48a9-99e7-346d6782dd02': 'a5e51cda-9915-48a9-99e7-346d6782dd02.m4a',
  '13f012ed-0fa5-41c3-85d9-8c031386e953': '13f012ed-0fa5-41c3-85d9-8c031386e953.m4a',
  '91966871-b068-44c4-93d8-6d0c53f47d23': '91966871-b068-44c4-93d8-6d0c53f47d23.m4a',
  'f2cfc38f-8b20-40b8-be2d-04775e14f667': 'f2cfc38f-8b20-40b8-be2d-04775e14f667.m4a',
  '2fe48780-c37e-415f-99eb-1ffd19ca901e': '2fe48780-c37e-415f-99eb-1ffd19ca901e.png',
};

function localAsset(url) {
  if (typeof url !== 'string' || !url.startsWith(GIZMO_CONTENT)) return url;
  const file = LOCAL_ASSETS[url.slice(GIZMO_CONTENT.length)];
  return file ? new URL(`assets/${file}`, import.meta.url).href : url;
}

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => nativeFetch(localAsset(input), init);

const imageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  ...imageSrc,
  set(value) {
    imageSrc.set.call(this, localAsset(value));
  },
});

const HAPTIC_PATTERNS = {
  light: 10,
  medium: 20,
  heavy: 40,
  selection: 5,
  success: [15, 40, 15],
  warning: [30, 50, 30],
  error: [50, 50, 50, 50, 50],
};

function performHaptic(style = 'medium') {
  try {
    if (navigator.vibrate) navigator.vibrate(HAPTIC_PATTERNS[style] ?? 20);
  } catch (e) {}
}

// Chaque tweak expose sa valeur par défaut via .value et .useState()
function tweaks(config) {
  const result = {};
  for (const key of Object.keys(config)) {
    const value = config[key].value;
    result[key] = { ...config[key], value, useState: () => value };
  }
  return result;
}

// Détection de secousse via l'accéléromètre du téléphone
function addShakeListener(callback) {
  const THRESHOLD = 15;
  const COOLDOWN = 800;
  let last = null;
  let lastShake = 0;
  const onMotion = (event) => {
    const a = event.accelerationIncludingGravity || event.acceleration;
    if (!a || a.x == null) return;
    if (last) {
      const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
      const now = Date.now();
      if (delta > THRESHOLD && now - lastShake > COOLDOWN) {
        lastShake = now;
        callback();
      }
    }
    last = { x: a.x, y: a.y, z: a.z };
  };
  // iOS demande une autorisation suite à un geste de l'utilisateur
  const requestPermission = () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().catch(() => {});
    }
  };
  window.addEventListener('devicemotion', onMotion);
  window.addEventListener('pointerdown', requestPermission, { once: true });
  return () => {
    window.removeEventListener('devicemotion', onMotion);
    window.removeEventListener('pointerdown', requestPermission);
  };
}

// Génération de texte IA via l'API publique gratuite de Pollinations (sans clé)
async function generateText({ prompt, imageData } = {}) {
  let content = prompt;
  if (imageData) {
    const url = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
    content = [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url } },
    ];
  }
  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages: [{ role: 'user', content }] }),
  });
  if (!response.ok) throw new Error(`generateText failed: ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') throw new Error('generateText: empty response');
  return { text: text.trim() };
}

export const gizmoRuntime = { tweaks, performHaptic, addShakeListener, generateText };
export default gizmoRuntime;
