const DB_NAME = "prosyolok-game";
const STORE_NAME = "saves";
const SAVE_ID = "autosave";
export const SAVE_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function validateSave(value) {
  return Boolean(value && value.version === SAVE_VERSION && value.vehicle && Number.isFinite(value.vehicle.x) && Number.isFinite(value.vehicle.z) && Array.isArray(value.completedMissions));
}

export async function saveGame(state) {
  const payload = { ...state, version: SAVE_VERSION, savedAt: Date.now() };
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(payload, SAVE_ID);
    transaction.oncomplete = () => { database.close(); resolve(payload); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export async function loadGame() {
  const database = await openDatabase();
  return new Promise((resolve) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(SAVE_ID);
    request.onsuccess = () => { database.close(); resolve(validateSave(request.result) ? request.result : null); };
    request.onerror = () => { database.close(); resolve(null); };
  });
}

export async function clearSave() {
  const database = await openDatabase();
  return new Promise((resolve) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(SAVE_ID);
    transaction.oncomplete = () => { database.close(); resolve(); };
  });
}
