// Photo storage for kitchen-log entries. Photos are JPEG data URLs that
// can run to hundreds of KB, so they live in IndexedDB, not localStorage.
const DB_NAME = 'fridge-cat';
const STORE = 'photos';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(out.result); };
    t.onerror = () => { db.close(); reject(t.error); };
  });
}

export const photos = {
  save: (id, dataUrl) => tx('readwrite', (s) => s.put(dataUrl, id)),
  get: (id) => tx('readonly', (s) => s.get(id)),
  remove: (id) => tx('readwrite', (s) => s.delete(id)),
};

// Downscale a picked image file to a phone-friendly JPEG data URL.
export function fileToDataUrl(file, maxEdge = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}
