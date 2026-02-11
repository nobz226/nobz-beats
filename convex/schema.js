import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tracks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    artworkStorageId: v.optional(v.id('_storage')),
    src: v.optional(v.string()),
    srcStorageId: v.optional(v.id('_storage')),
    type: v.optional(v.string()),
    albumId: v.optional(v.id('albums')),
    createdAt: v.number()
  }),
  albums: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    artworkStorageId: v.optional(v.id('_storage')),
    createdAt: v.number()
  })
})
