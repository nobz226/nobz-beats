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