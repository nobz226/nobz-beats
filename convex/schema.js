import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tracks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    src: v.optional(v.string()),
    type: v.optional(v.string()),
    albumId: v.optional(v.id('albums')),
    createdAt: v.number()
  }),
  albums: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    createdAt: v.number()
  })
})
