import { dataProvider, authentication, GlobalOptions } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '~/types/database.type'
import type { Song, Artist } from '~/types/song.type'
import { getAvailableLangs } from '~/types/song.type'

export default defineEventHandler(async (event) => {
  // Set content type
  event.node.res.setHeader('Content-Type', 'application/xml')
  
  // Get dynamic base URL from request headers
  const headers = event.node.req.headers
  const protocol = headers['x-forwarded-proto'] || 
                  (event.node.req.socket?.encrypted ? 'https' : 'http')
  const host = headers['x-forwarded-host'] || 
               headers['host'] || 
               headers[':authority'] ||
               'goranee.ir'
  
  // Remove port if it's standard (80 for http, 443 for https)
  const hostWithoutPort = host.split(':')[0]
  const port = host.includes(':') ? host.split(':')[1] : null
  
  // Only include port if it's non-standard
  let baseUrl = `${protocol}://${hostWithoutPort}`
  if (port && port !== '80' && port !== '443') {
    baseUrl = `${protocol}://${hostWithoutPort}:${port}`
  }
  
  const currentDate = new Date().toISOString()

  // Configure GlobalOptions for server-side API calls
  // On server-side, connect directly to the server service
  const config = useRuntimeConfig()
  let apiBaseUrl = config.public.apiBaseUrl || '/api/'
  
  // For server-side (SSR), use internal Docker service URL
  if (!apiBaseUrl.startsWith('http')) {
    // For SSR, connect directly to the server service (no /api prefix needed)
    apiBaseUrl = 'http://server:8081'
  }
  
  // Remove trailing slash if present
  apiBaseUrl = apiBaseUrl.replace(/\/$/, '')
  
  GlobalOptions.set({ host: apiBaseUrl })
  
  try {
    // Authenticate as anonymous user before making API calls
    // This is required for server-side API requests
    try {
      await authentication.loginAsAnonymous()
    } catch (authError) {
      // If already authenticated, this might fail - continue anyway
      console.warn('Anonymous authentication warning:', authError)
    }
    
    // Fetch all songs
    const songs = await dataProvider.find<Song>({
      database: DATABASE_NAME,
      collection: COLLECTION_NAME.SONG,
      query: {},
      options: {
        select: {
          _id: 1,
          content: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      },
    })
    
    // Fetch all artists
    const artists = await dataProvider.find<Artist>({
      database: DATABASE_NAME,
      collection: COLLECTION_NAME.ARTIST,
      query: {},
      options: {
        select: {
          _id: 1,
          content: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      },
    })
    
    // Generate XML with all language versions
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Discovery Page -->
  <url>
    <loc>${baseUrl}/discovery</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Community Page -->
  <url>
    <loc>${baseUrl}/community</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Songs with all language versions -->
  ${songs.map((song: Song) => {
    const availableLangs = getAvailableLangs(song)
    const lastmod = song.updatedAt 
      ? new Date(song.updatedAt).toISOString() 
      : (song.createdAt ? new Date(song.createdAt).toISOString() : currentDate)
    
    return availableLangs.map((lang) => {
      const url = lang === 'ckb-IR'
        ? `${baseUrl}/tab/${song._id}`
        : `${baseUrl}/tab/${song._id}/${lang}`
      
      // Generate xhtml:link for alternate languages
      const alternates = availableLangs.map((altLang) => {
        const altUrl = altLang === 'ckb-IR'
          ? `${baseUrl}/tab/${song._id}`
          : `${baseUrl}/tab/${song._id}/${altLang}`
        return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`
      }).join('\n')
      
      // Add x-default
      const defaultUrl = `${baseUrl}/tab/${song._id}`
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`
      
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
${alternates}
${xDefault}
  </url>`
    }).join('')
  }).join('')}
  
  <!-- Artists with all language versions -->
  ${artists.map((artist: Artist) => {
    const availableLangs = (Object.keys(artist.content || {}) as Array<'ckb-IR' | 'ckb-Latn' | 'kmr'>).filter(
      lang => artist.content?.[lang]?.name
    )
    const lastmod = (artist as any).updatedAt 
      ? new Date((artist as any).updatedAt).toISOString() 
      : ((artist as any).createdAt ? new Date((artist as any).createdAt).toISOString() : currentDate)
    
    if (availableLangs.length === 0) return ''
    
    return availableLangs.map((lang) => {
      const url = lang === 'ckb-IR'
        ? `${baseUrl}/artist/${artist._id}`
        : `${baseUrl}/artist/${artist._id}/${lang}`
      
      // Generate xhtml:link for alternate languages
      const alternates = availableLangs.map((altLang) => {
        const altUrl = altLang === 'ckb-IR'
          ? `${baseUrl}/artist/${artist._id}`
          : `${baseUrl}/artist/${artist._id}/${altLang}`
        return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`
      }).join('\n')
      
      // Add x-default
      const defaultUrl = `${baseUrl}/artist/${artist._id}`
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`
      
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${alternates}
${xDefault}
  </url>`
    }).join('')
  }).join('')}
  
</urlset>`
    
    return sitemap
  } catch (error) {
    console.error('Error generating sitemap:', error)
    event.node.res.statusCode = 500
    return '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>'
  }
})

