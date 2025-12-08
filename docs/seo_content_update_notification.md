# SEO Content Update Notification Strategy

**Date:** December 2024  
**Purpose:** How to notify search engines when songs/content are updated

---

## Problem Statement

When an old song gets updated (chords corrected, lyrics added, metadata changed), search engines need to be informed to:
- Re-crawl the updated page
- Update their index with fresh content
- Maintain accurate search results
- Preserve SEO rankings

**Current State:**
- ❌ No timestamp tracking (`createdAt`, `updatedAt`) in song schema
- ❌ No automatic sitemap updates
- ❌ No search engine notification system
- ❌ No structured data with `dateModified`

---

## Solution Overview

### Multi-Layer Notification Strategy

1. **Database Layer:** Track modification timestamps
2. **Sitemap Layer:** Update XML sitemap with `lastmod` dates
3. **API Layer:** Instant notification via Indexing APIs
4. **Structured Data Layer:** Include `dateModified` in JSON-LD
5. **HTTP Headers Layer:** Set `Last-Modified` headers

---

## Implementation Plan

### Phase 1: Database Schema Enhancement

#### 1.1 Add Timestamp Fields to Song Schema

**File:** `server/src/modules/chords/db_song.ts`

```typescript
// Add to Song schema
schema: new Schema({
    title: { type: String, required: true },
    title_seo: { type: String },
    rhythm: { type: String },
    artists: [{ type: Schema.Types.ObjectId, ref: 'artist', default: [] }],
    genres: [{ type: Schema.Types.ObjectId, ref: 'genre', default: [] }],
    chords: {
        keySignature: { type: String, enum: ['major', 'minor'] },
        vocalNote: VocalNoteSchema,
        list: [SongChordSchema]
    },
    sections: [SongSectionSchema],
    image: schemas.file,
    melodies: [MelodySchema],
    
    // NEW: Timestamp tracking
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true // Auto-update updatedAt on save
})
```

**Alternative:** Use Mongoose `timestamps` option:
```typescript
schema: new Schema({...}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
```

#### 1.2 Update TypeScript Types

**File:** `end_user/types/song.type.ts`

```typescript
export interface Song {
  _id: string
  title: string
  title_seo?: string
  rhythm?: string
  artists?: string[]
  genres?: string[]
  chords?: SongChords
  sections?: SongSection[]
  image?: FileReference
  melodies?: Melody[]
  
  // NEW: Timestamp fields
  createdAt?: Date | string
  updatedAt?: Date | string
}
```

---

### Phase 2: Sitemap with Dynamic lastmod

#### 2.1 Install Nuxt Sitemap Module

```bash
npm install @nuxtjs/sitemap
```

#### 2.2 Configure Sitemap in `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/sitemap',
    // ... other modules
  ],
  
  sitemap: {
    hostname: 'https://goranee.ir', // Your domain
    gzip: true,
    routes: async () => {
      // Fetch all songs from API
      const songs = await fetch(`${process.env.NUXT_API_BASE_URL}/songs`).then(r => r.json())
      
      return songs.map((song: Song) => ({
        url: `/tab/${song._id}`,
        lastmod: song.updatedAt || song.createdAt, // Use updatedAt if available
        changefreq: 'monthly', // How often content changes
        priority: 0.8, // Priority (0.0 to 1.0)
      }))
    },
    // Also include static pages
    defaults: {
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }
  },
})
```

#### 2.3 Dynamic Sitemap Generation (Server-Side)

**Better approach:** Create a server route that generates sitemap dynamically:

**File:** `end_user/server/routes/sitemap.xml.ts`

```typescript
import { dataProvider } from '@modular-rest/client'

export default defineEventHandler(async (event) => {
  // Set content type
  event.node.res.setHeader('Content-Type', 'application/xml')
  
  // Fetch all songs
  const songs = await dataProvider.find({
    database: 'tab',
    collection: 'song',
    query: {},
    options: { sort: { updatedAt: -1 } } // Sort by most recently updated
  })
  
  // Fetch all artists
  const artists = await dataProvider.find({
    database: 'tab',
    collection: 'artist',
    query: {},
  })
  
  const baseUrl = 'https://goranee.ir'
  const currentDate = new Date().toISOString()
  
  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Songs -->
  ${songs.map((song: any) => `
  <url>
    <loc>${baseUrl}/tab/${song._id}</loc>
    <lastmod>${song.updatedAt ? new Date(song.updatedAt).toISOString() : new Date(song.createdAt || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- Artists -->
  ${artists.map((artist: any) => `
  <url>
    <loc>${baseUrl}/artist/${artist._id}</loc>
    <lastmod>${artist.updatedAt ? new Date(artist.updatedAt).toISOString() : new Date(artist.createdAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  
</urlset>`
  
  return sitemap
})
```

---

### Phase 3: Instant Notification via Indexing APIs

#### 3.1 Google Indexing API

**When to use:**
- Song content is updated
- New songs are published
- Critical metadata changes

**Implementation:**

**File:** `server/src/modules/chords/service.ts` (or create new notification service)

```typescript
import { google } from 'googleapis'

interface IndexingNotification {
  url: string
  type: 'URL_UPDATED' | 'URL_DELETED'
}

async function notifyGoogleIndexing(notification: IndexingNotification) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY, // Path to service account JSON
    scopes: ['https://www.googleapis.com/auth/indexing'],
  })
  
  const indexing = google.indexing({ version: 'v3', auth })
  
  try {
    await indexing.urlNotifications.publish({
      requestBody: {
        url: notification.url,
        type: notification.type,
      },
    })
    console.log(`✅ Google notified: ${notification.url}`)
  } catch (error) {
    console.error(`❌ Google indexing error:`, error)
  }
}
```

**Trigger on song update:**

```typescript
// In your song update endpoint
async function updateSong(songId: string, updates: Partial<Song>) {
  // Update song in database
  const updatedSong = await dataProvider.updateOne({
    database: 'tab',
    collection: 'song',
    query: { _id: songId },
    update: { ...updates, updatedAt: new Date() },
  })
  
  // Notify Google
  await notifyGoogleIndexing({
    url: `https://goranee.ir/tab/${songId}`,
    type: 'URL_UPDATED',
  })
  
  return updatedSong
}
```

#### 3.2 Bing IndexNow API (Simpler, No Auth Required)

**Implementation:**

```typescript
async function notifyBingIndexNow(urls: string[]) {
  const endpoint = 'https://api.indexnow.org/IndexNow'
  const apiKey = process.env.INDEXNOW_API_KEY // Optional but recommended
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'goranee.ir',
        key: apiKey,
        keyLocation: `https://goranee.ir/${apiKey}.txt`, // Key file location
        urlList: urls,
      }),
    })
    
    if (response.ok) {
      console.log(`✅ Bing IndexNow notified for ${urls.length} URLs`)
    }
  } catch (error) {
    console.error(`❌ Bing IndexNow error:`, error)
  }
}
```

**Note:** IndexNow also notifies Yandex automatically.

---

### Phase 4: Structured Data with dateModified

#### 4.1 Update Song Page Structured Data

**File:** `end_user/pages/tab/[id].vue`

```typescript
<script setup lang="ts">
// ... existing code ...

// SEO with dateModified
useSeoMeta({
  title: computed(() => song.value ? `آکورد ${song.value.title} - Goranee` : 'Goranee'),
  description: computed(() => {
    if (!song.value) return ''
    const artists = song.value.artists?.map(a => 
      typeof a === 'string' ? a : a.name
    ).join(' و ') || ''
    return `آکورد ${song.value.title} از ${artists}`
  }),
  ogTitle: computed(() => song.value?.title || ''),
  ogDescription: computed(() => {
    // ... description logic
  }),
  ogImage: computed(() => song.value?.image ? getImageUrl(song.value.image) : ''),
  ogType: 'music.song',
  twitterCard: 'summary_large_image',
})

// Structured Data with dateModified
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MusicComposition',
        name: computed(() => song.value?.title),
        composer: computed(() => song.value?.artists?.map(artist => ({
          '@type': 'Person',
          name: typeof artist === 'string' ? artist : artist?.name,
        }))),
        dateCreated: computed(() => song.value?.createdAt),
        dateModified: computed(() => song.value?.updatedAt || song.value?.createdAt), // KEY: Show when updated
        inAlbum: {
          '@type': 'MusicAlbum',
          name: 'Goranee Kurdish Chords',
        },
        // ... other properties
      }),
    },
  ],
})
</script>
```

---

### Phase 5: HTTP Headers (Last-Modified)

#### 5.1 Set Last-Modified Header in Nuxt

**File:** `end_user/server/middleware/song-headers.ts`

```typescript
export default defineEventHandler(async (event) => {
  const url = event.node.req.url
  
  // Only for song pages
  if (url?.startsWith('/tab/')) {
    const songId = url.split('/tab/')[1]?.split('?')[0]
    
    if (songId) {
      // Fetch song to get updatedAt
      const song = await dataProvider.findOne({
        database: 'tab',
        collection: 'song',
        query: { _id: songId },
      })
      
      if (song?.updatedAt) {
        const lastModified = new Date(song.updatedAt)
        event.node.res.setHeader('Last-Modified', lastModified.toUTCString())
        
        // Handle If-Modified-Since (304 Not Modified)
        const ifModifiedSince = event.node.req.headers['if-modified-since']
        if (ifModifiedSince) {
          const clientDate = new Date(ifModifiedSince)
          if (lastModified <= clientDate) {
            event.node.res.statusCode = 304
            return
          }
        }
      }
    }
  }
})
```

---

## Complete Update Flow

### When a Song is Updated:

```
1. Admin updates song in admin panel
   ↓
2. Server updates song in database
   - Sets updatedAt = new Date()
   ↓
3. Notification triggers:
   a) Google Indexing API called (instant)
   b) Bing IndexNow API called (instant)
   c) Sitemap lastmod updated (next sitemap generation)
   ↓
4. Frontend reflects changes:
   - Structured data includes new dateModified
   - HTTP headers include new Last-Modified
   ↓
5. Search engines:
   - Google: Re-crawls within hours (via Indexing API)
   - Bing: Re-crawls within hours (via IndexNow)
   - Others: Discover via sitemap (within days)
```

---

## Best Practices

### 1. **Prioritize Updates**
- **High Priority:** Title, chords, lyrics changes → Use Indexing API
- **Low Priority:** Minor metadata → Rely on sitemap

### 2. **Batch Notifications**
- Don't call APIs for every single update
- Batch updates and notify once per hour/day

### 3. **Monitor Success**
- Track which URLs were successfully notified
- Log failures for retry
- Monitor Google Search Console for indexing status

### 4. **Sitemap Refresh Frequency**
- Generate sitemap dynamically (on-demand)
- Or regenerate daily via cron job
- Include only recently updated songs in priority

### 5. **Content Versioning**
- Consider adding `version` field to track major updates
- Use semantic versioning: `1.0.0` → `1.1.0` for minor, `2.0.0` for major

---

## Monitoring & Verification

### Google Search Console
- Check "URL Inspection" tool
- Monitor "Coverage" report
- Track "Last crawl" dates

### Bing Webmaster Tools
- Check indexing status
- Monitor crawl frequency

### Verification Script

```typescript
// Check if song was indexed
async function checkIndexingStatus(url: string) {
  // Google Search Console API
  // Or use URL Inspection tool
  
  // Check sitemap lastmod
  // Check structured data dateModified
  // Check HTTP Last-Modified header
}
```

---

## Implementation Priority

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| **High** | Add `updatedAt` to schema | Critical | Low |
| **High** | Dynamic sitemap with `lastmod` | High | Medium |
| **High** | Structured data `dateModified` | High | Low |
| **Medium** | Bing IndexNow API | Medium | Low |
| **Medium** | HTTP Last-Modified headers | Medium | Low |
| **Low** | Google Indexing API | High | High (requires setup) |

---

## Example: Complete Implementation

### Server-Side Update Handler

```typescript
// server/src/modules/chords/router.ts or service.ts

async function updateSongHandler(songId: string, updates: Partial<Song>) {
  // 1. Update database with timestamp
  const updatedSong = await dataProvider.updateOne({
    database: 'tab',
    collection: 'song',
    query: { _id: songId },
    update: {
      ...updates,
      updatedAt: new Date(),
    },
  })
  
  // 2. Notify search engines (async, don't block)
  const songUrl = `https://goranee.ir/tab/${songId}`
  
  Promise.all([
    notifyBingIndexNow([songUrl]), // Fast, no auth
    // notifyGoogleIndexing({ url: songUrl, type: 'URL_UPDATED' }), // If configured
  ]).catch(err => console.error('Notification error:', err))
  
  // 3. Invalidate sitemap cache (if cached)
  // sitemapCache.invalidate()
  
  return updatedSong
}
```

---

## Summary

**To notify search engines when songs are updated:**

1. ✅ **Track timestamps** (`updatedAt` in database)
2. ✅ **Update sitemap** with `lastmod` dates
3. ✅ **Use Indexing APIs** for instant notification (Bing IndexNow, Google Indexing API)
4. ✅ **Include `dateModified`** in structured data
5. ✅ **Set HTTP headers** (`Last-Modified`)

**Result:** Search engines will re-crawl and re-index updated content within hours to days, maintaining fresh search results and preserving SEO rankings.

---

**Next Steps:**
1. Implement Phase 1 (database timestamps)
2. Implement Phase 2 (dynamic sitemap)
3. Implement Phase 4 (structured data)
4. Add Phase 3 (Indexing APIs) for critical updates

