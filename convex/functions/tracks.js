// Convex server functions for tracks
// Deploy these with the Convex CLI (convex/dev) — they rely on the Convex runtime API

import { query, mutation } from '../_generated/server'

export const listTracks = query(async ({ db }) => {
  const q = await db.table('tracks').query().collect()
  return q
})

export const createTrack = mutation(async ({ db }, track) => {
  // Schema's `albumId` is optional but does not accept `null` — convert null to undefined
  if (track && Object.prototype.hasOwnProperty.call(track, 'albumId') && track.albumId === null) {
    // create a shallow copy to avoid mutating caller data
    track = { ...track }
    delete track.albumId
  }
  const doc = Object.assign({ createdAt: Date.now() }, track)
  const id = await db.table('tracks').insert(doc)
  return id
})

export const updateTrack = mutation(async ({ db, storage }, args) => {
  // Expect a single object argument { id, patch }
  const { id, patch: incomingPatch } = args || {}
  let patch = incomingPatch
  if (!id) return true

  // If no patch provided or empty, nothing to do
  if (!patch || Object.keys(patch).length === 0) return true

  // Normalize null albumId to undefined (schema accepts optional but not null)
  if (Object.prototype.hasOwnProperty.call(patch, 'albumId') && patch.albumId === null) {
    const { albumId, ...rest } = patch
    patch = rest
  }

  if (!patch || Object.keys(patch).length === 0) return true

  // If replacing artwork or audio, delete the previous storage objects when present
  try {
    const existing = await db.table('tracks').get(id)
    if (existing) {
      // artworkStorageId replacement
      if (patch.artworkStorageId && existing.artworkStorageId && String(patch.artworkStorageId) !== String(existing.artworkStorageId)) {
        try {
          if (storage && typeof storage.delete === 'function') await storage.delete(existing.artworkStorageId)
        } catch (e) { console.error('Failed to delete old artwork storage', e) }
      }
      // srcStorageId replacement
      if (patch.srcStorageId && existing.srcStorageId && String(patch.srcStorageId) !== String(existing.srcStorageId)) {
        try {
          if (storage && typeof storage.delete === 'function') await storage.delete(existing.srcStorageId)
        } catch (e) { console.error('Failed to delete old audio storage', e) }
      }
    }
  } catch (e) {
    console.error('Error checking existing track for storage cleanup', e)
  }

  await db.table('tracks').patch(id, patch)
  return true
})

export const deleteTrack = mutation(async ({ db, storage }, args) => {
  const id = (args && args.id) || args
  if (!id) return true
  try {
    // fetch existing to determine any storage ids to delete
    const existing = await db.table('tracks').get(id)
    if (existing) {
      // delete artwork storage
      if (existing.artworkStorageId && storage && typeof storage.delete === 'function') {
        try { await storage.delete(existing.artworkStorageId) } catch (e) { console.error('Failed to delete artwork storage for track', e) }
      }
      // delete audio storage
      if (existing.srcStorageId && storage && typeof storage.delete === 'function') {
        try { await storage.delete(existing.srcStorageId) } catch (e) { console.error('Failed to delete audio storage for track', e) }
      }
    }
  } catch (e) {
    console.error('Error fetching track before delete', e)
  }

  await db.table('tracks').delete(id)
  return true
})
