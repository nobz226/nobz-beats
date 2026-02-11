// Convex server functions for albums

import { query, mutation } from '../_generated/server'

export const listAlbums = query(async ({ db }) => {
  return await db.table('albums').query().collect()
})

export const createAlbum = mutation(async ({ db }, album) => {
  const id = await db.table('albums').insert(Object.assign({ createdAt: Date.now() }, album))
  return id
})

export const deleteAlbum = mutation(async ({ db, storage }, args) => {
  const id = (args && args.id) || args
  if (!id) return true
  try {
    const existing = await db.table('albums').get(id)
    if (existing && existing.artworkStorageId && storage && typeof storage.delete === 'function') {
      try { await storage.delete(existing.artworkStorageId) } catch (e) { console.error('Failed to delete album artwork storage', e) }
    }
  } catch (e) {
    console.error('Error fetching album before delete', e)
  }
  await db.table('albums').delete(id)
  return true
})

export const updateAlbum = mutation(async ({ db, storage }, args) => {
  // Expect a single object argument { id, patch }
  const { id, patch: incomingPatch } = args || {}
  let patch = incomingPatch
  if (!id) return true

  if (!patch || Object.keys(patch).length === 0) return true

  // If replacing artwork, delete old storage entry after successful update
  try {
    const existing = await db.table('albums').get(id)
    if (existing && patch.artworkStorageId && existing.artworkStorageId && String(patch.artworkStorageId) !== String(existing.artworkStorageId)) {
      try { if (storage && typeof storage.delete === 'function') await storage.delete(existing.artworkStorageId) } catch (e) { console.error('Failed to delete old album artwork storage', e) }
    }
  } catch (e) {
    console.error('Error checking existing album for storage cleanup', e)
  }

  await db.table('albums').patch(id, patch)
  return true
})