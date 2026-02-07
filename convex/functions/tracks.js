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

export const updateTrack = mutation(async ({ db }, args) => {
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

  await db.table('tracks').patch(id, patch)
  return true
})

export const deleteTrack = mutation(async ({ db }, args) => {
  const id = (args && args.id) || args
  if (!id) return true
  await db.table('tracks').delete(id)
  return true
})
