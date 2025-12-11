import { dataProvider, authentication, GlobalOptions } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '~/types/database.type'
import type { Song, Artist } from '~/types/song.type'

/**
 * Middleware to set Last-Modified HTTP headers for song and artist pages
 * Also handles If-Modified-Since for 304 Not Modified responses
 */
export default defineEventHandler(async (event) => {
  const url = event.node.req.url
  
  if (!url) return
  
  // Only process song and artist pages
  const songMatch = url.match(/^\/tab\/([^\/]+)/)
  const artistMatch = url.match(/^\/artist\/([^\/]+)/)
  
  if (!songMatch && !artistMatch) return
  
  // Configure API connection for server-side
  const config = useRuntimeConfig()
  let apiBaseUrl = config.public.apiBaseUrl || '/api/'
  
  // For server-side (SSR), use internal Docker service URL
  if (!apiBaseUrl.startsWith('http')) {
    apiBaseUrl = 'http://server:8081'
  }
  
  apiBaseUrl = apiBaseUrl.replace(/\/$/, '')
  GlobalOptions.set({ host: apiBaseUrl })
  
  try {
    // Authenticate as anonymous user
    try {
      await authentication.loginAsAnonymous()
    } catch (authError) {
      // If already authenticated, continue anyway
      console.warn('Anonymous authentication warning:', authError)
    }
    
    let updatedAt: Date | null = null
    
    if (songMatch) {
      const songId = songMatch[1]
      
      // Fetch song to get updatedAt
      const song = await dataProvider.findOne<Song>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        query: { _id: songId },
        options: {
          select: {
            updatedAt: 1,
            createdAt: 1,
          },
        },
      })
      
      if (song) {
        updatedAt = song.updatedAt 
          ? new Date(song.updatedAt)
          : (song.createdAt ? new Date(song.createdAt) : null)
      }
    } else if (artistMatch) {
      const artistId = artistMatch[1]
      
      // Fetch artist to get updatedAt
      const artist = await dataProvider.findOne<Artist>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.ARTIST,
        query: { _id: artistId },
        options: {
          select: {
            updatedAt: 1,
            createdAt: 1,
          },
        },
      })
      
      if (artist) {
        const artistWithTimestamps = artist as any
        updatedAt = artistWithTimestamps.updatedAt
          ? new Date(artistWithTimestamps.updatedAt)
          : (artistWithTimestamps.createdAt 
              ? new Date(artistWithTimestamps.createdAt) 
              : null)
      }
    }
    
    if (updatedAt) {
      const lastModified = updatedAt
      const lastModifiedString = lastModified.toUTCString()
      
      // Set Last-Modified header
      event.node.res.setHeader('Last-Modified', lastModifiedString)
      
      // Handle If-Modified-Since (304 Not Modified)
      const ifModifiedSince = event.node.req.headers['if-modified-since']
      if (ifModifiedSince) {
        try {
          const clientDate = new Date(ifModifiedSince)
          // If content hasn't changed, return 304
          if (lastModified <= clientDate) {
            event.node.res.statusCode = 304
            event.node.res.end()
            return
          }
        } catch (e) {
          // Invalid date, continue with normal response
        }
      }
      
      // Set cache control headers
      event.node.res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate')
    }
  } catch (error) {
    // Don't fail the request if header setting fails
    console.error('Error setting Last-Modified header:', error)
  }
})
