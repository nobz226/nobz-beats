// Convex client helper (frontend)
// TODO: Install Convex browser client: `npm i convex` and configure REACT_APP_CONVEX_URL
// This is a small wrapper that expects a Convex HTTP client instance.
// If you prefer using Convex React hooks, replace these calls with `useQuery/useMutation`.

import { ConvexHttpClient } from 'convex/browser' // ensure package is installed

const convexUrl = process.env.REACT_APP_CONVEX_URL || ''
if (!convexUrl) {
  console.warn('REACT_APP_CONVEX_URL not set — convex API calls will fail until configured')
}
export const client = new ConvexHttpClient(convexUrl)

export async function listTracks() { return client.query('functions/tracks:listTracks') }
export async function createTrack(payload) { return client.mutation('functions/tracks:createTrack', payload) }
export async function updateTrack(id, patch) { return client.mutation('functions/tracks:updateTrack', id, patch) }
export async function deleteTrack(id) { return client.mutation('functions/tracks:deleteTrack', id) }

export async function listAlbums() { return client.query('functions/albums:listAlbums') }
export async function createAlbum(payload) { return client.mutation('functions/albums:createAlbum', payload) }
export async function deleteAlbum(id) { return client.mutation('functions/albums:deleteAlbum', id) }
