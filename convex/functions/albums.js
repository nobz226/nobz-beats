// Convex server functions for albums

import { query, mutation } from '../_generated/server'

export const listAlbums = query(async ({ db }) => {
  return await db.table('albums').query().collect()
})

export const createAlbum = mutation(async ({ db }, album) => {
  const id = await db.table('albums').insert(Object.assign({ createdAt: Date.now() }, album))
  return id
})

export const deleteAlbum = mutation(async ({ db }, args) => {
  const id = (args && args.id) || args
  if (!id) return true
  await db.table('albums').delete(id)
  return true
})

export const updateAlbum = mutation(async ({ db }, args) => {
  // Expect a single object argument { id, patch }
  const { id, patch: incomingPatch } = args || {}
  let patch = incomingPatch
  if (!id) return true

  if (!patch || Object.keys(patch).length === 0) return true

  await db.table('albums').patch(id, patch)
  return true
})