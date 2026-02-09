// Simple global vinyl state bus and store.
// Exposes a small API for storing per-track vinyl state and subscribing to updates.

const globalScope = typeof window !== 'undefined' ? window : globalThis

if (!globalScope.__vinylBus) globalScope.__vinylBus = new EventTarget()
if (!globalScope.__vinylStateStore) globalScope.__vinylStateStore = {}

const bus = globalScope.__vinylBus
const store = globalScope.__vinylStateStore

export function setVinylState(id, state) {
  if (!id) return
  const key = String(id)
  store[key] = Object.assign({}, store[key] || {}, state)
  try {
    bus.dispatchEvent(new CustomEvent('vinyl:state', { detail: { id: key, ...store[key] } }))
  } catch (e) {
    // ignore
  }
}

export function getVinylState(id) {
  if (!id) return undefined
  return store[String(id)]
}

// subscribe to events for a specific id. callback receives the detail object.
export function subscribeToVinyl(id, callback) {
  if (!id || typeof callback !== 'function') return () => {}
  const key = String(id)
  const handler = (e) => {
    try {
      if (String(e?.detail?.id) === key) callback(e.detail)
    } catch (err) {
      // ignore
    }
  }
  bus.addEventListener('vinyl:state', handler)
  return () => bus.removeEventListener('vinyl:state', handler)
}

export function playVinyl(id, albumId) {
  try {
    if (!id) return
    setVinylState(String(id), { out: true, spinning: true })
    if (albumId && String(albumId) !== String(id)) setVinylState(String(albumId), { out: true, spinning: true })
  } catch (e) {}
}

export function pauseVinyl(id, albumId) {
  try {
    if (!id) return
    setVinylState(String(id), { spinning: false })
    if (albumId && String(albumId) !== String(id)) setVinylState(String(albumId), { spinning: false })
  } catch (e) {}
}

export function stopVinyl(id, albumId) {
  try {
    if (!id) return
    setVinylState(String(id), { out: false, spinning: false })
    if (albumId && String(albumId) !== String(id)) setVinylState(String(albumId), { out: false, spinning: false })
  } catch (e) {}
}

export default { setVinylState, getVinylState, subscribeToVinyl, playVinyl, pauseVinyl, stopVinyl }
