# Multi-Language Implementation Roadmap

**Date:** December 2024  
**Feature:** Multi-language support with language codes in URLs  
**Status:** Planning Phase

---

## Overview

Implement multi-language support for songs and artists with language-specific URLs:

- `/tab/1234/` - Default (Sorani Iran - ckb-IR)
- `/tab/1234/ckb-Latn` - Sorani Latin
- `/tab/1234/kmr` - Kurmanji
- `/tab/1234/hac` - Hawrami/Gorani

Each entity (song/artist) will store all language versions in a single document, with language switcher UI for end users and separate editing interfaces in admin panel.

---

## Language Codes Reference

| Code               | Language       | Script       | Region | Description             |
| ------------------ | -------------- | ------------ | ------ | ----------------------- |
| `ckb-IR` (default) | Sorani         | Arabic       | Iran   | Default Kurdish dialect |
| `ckb-Latn`         | Sorani         | Latin        | -      | Sorani in Latin script  |
| `kmr`              | Kurmanji       | Latin        | -      | Northern Kurdish        |
| `hac`              | Hawrami/Gorani | Arabic/Latin | -      | Gorani dialect          |

**Note:** Using ISO 639-3 codes where applicable. `ckb` = Central Kurdish (Sorani), `kmr` = Northern Kurdish (Kurmanji), `hac` = Hawrami.

---

## Phase 1: Database Schema Design

### 1.1 Update Song Schema

**File:** `server/src/modules/chords/db_song.ts`

**Recommended Approach: Nested Object Structure**

```typescript
// Language-specific content schema (reusable)
let SongLanguageContentSchema = new Schema({
    title: { type: String, required: true },
    title_seo: { type: String },
    rhythm: { type: String },
    sections: [SongSectionSchema], // Language-specific sections
}, { _id: false }) // No _id for nested documents

// Updated Song Schema
schema: new Schema({
    // Language-specific content as nested object with lang codes as keys
    // Benefits:
    // 1. Direct O(1) access: song.content['ckb-IR'] vs array.find()
    // 2. Type safety: TypeScript can enforce all language keys
    // 3. No need for availableLangs array - compute from Object.keys()
    // 4. Easier updates: song.content['kmr'] = {...}
    // 5. Schema validation per language
    // 6. Clearer structure: all languages always present
    content: {
        'ckb-IR': SongLanguageContentSchema,
        'ckb-Latn': SongLanguageContentSchema,
        'kmr': SongLanguageContentSchema,
        'hac': SongLanguageContentSchema,
    },
    
    // Default language (for backward compatibility and fallback)
    defaultLang: { 
        type: String, 
        enum: ['ckb-IR', 'ckb-Latn', 'kmr', 'hac'],
        default: 'ckb-IR'
    },
    
    // Shared content (not language-specific)
    artists: [{ type: Schema.Types.ObjectId, ref: 'artist', default: [] }],
    genres: [{ type: Schema.Types.ObjectId, ref: 'genre', default: [] }],
    chords: {
        keySignature: { type: String, enum: ['major', 'minor'] },
        vocalNote: VocalNoteSchema,
        list: [SongChordSchema]
    },
    image: schemas.file,
    melodies: [MelodySchema],
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})
```

**Benefits of Nested Object Approach:**

1. **Performance:** Direct access `song.content['ckb-IR']` is O(1) vs O(n) array search
2. **Type Safety:** TypeScript can enforce all language keys exist at compile time
3. **No Redundancy:** `availableLangs` can be computed from `Object.keys(song.content).filter(k => song.content[k])`
4. **Easier Updates:** `song.content['kmr'] = {...}` vs finding and updating array element
5. **Schema Validation:** MongoDB validates structure for each language automatically
6. **Clearer Structure:** All languages are always present (even if null/empty), making it explicit
7. **Better Queries:** Can query specific language fields directly: `{ 'content.ckb-IR.title': '...' }`
8. **Simpler Code:** No need for `.find()` or `.filter()` operations

**Usage Examples:**

```typescript
// Access language content
const soraniContent = song.content['ckb-IR']
const kurmanjiContent = song.content['kmr']

// Check if language exists (has content)
const hasKurmanji = !!song.content['kmr']?.title

// Get available languages
const availableLangs = Object.keys(song.content).filter(
  lang => song.content[lang]?.title
)

// Update specific language
song.content['kmr'] = {
  title: 'New Title',
  title_seo: 'new-title',
  rhythm: '4/4',
  sections: [...]
}

// Copy from one language to another
song.content['hac'] = { ...song.content['ckb-IR'] }
song.content['hac'].title = 'Modified Title'
```

### 1.2 Update Artist Schema

**File:** `server/src/modules/chords/db_song.ts`

```typescript
// Language-specific content schema for artists
let ArtistLanguageContentSchema = new Schema({
    name: { type: String, required: true },
    name_seo: { type: String },
    bio: { type: String }, // Language-specific bio
}, { _id: false })

schema: new Schema({
    // Nested object structure (same benefits as Song schema)
    content: {
        'ckb-IR': ArtistLanguageContentSchema,
        'ckb-Latn': ArtistLanguageContentSchema,
        'kmr': ArtistLanguageContentSchema,
        'hac': ArtistLanguageContentSchema,
    },
    defaultLang: { 
        type: String, 
        enum: ['ckb-IR', 'ckb-Latn', 'kmr', 'hac'],
        default: 'ckb-IR'
    },
    chords: { type: Number, default: 0 },
    image: schemas.file,
})
```

### 1.3 Update TypeScript Types

**File:** `end_user/types/song.type.ts`

```typescript
export type LanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr' | 'hac'

// Language-specific content (no lang field needed - it's the key)
export interface SongLanguageContent {
  title: string
  title_seo?: string
  rhythm?: string
  sections?: SongSection[]
}

export interface ArtistLanguageContent {
  name: string
  name_seo?: string
  bio?: string
}

// Updated Song interface with nested object structure
export interface Song {
  _id: string
  // Nested object: lang code is the key
  content: {
    'ckb-IR'?: SongLanguageContent
    'ckb-Latn'?: SongLanguageContent
    'kmr'?: SongLanguageContent
    'hac'?: SongLanguageContent
  }
  defaultLang: LanguageCode
  
  // Shared content
  artists?: string[]
  genres?: string[]
  chords?: SongChords
  image?: FileReference
  melodies?: Melody[]
  
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Helper type for current language view (flattened for easier use)
export interface SongWithLang extends Omit<Song, 'content'> {
  currentLang: LanguageCode
  title: string
  title_seo?: string
  rhythm?: string
  sections?: SongSection[]
}

// Helper function to get available languages
export function getAvailableLangs(song: Song): LanguageCode[] {
  return (Object.keys(song.content) as LanguageCode[]).filter(
    lang => song.content[lang]?.title
  )
}

// Updated Artist interface
export interface Artist {
  _id?: string
  content: {
    'ckb-IR'?: ArtistLanguageContent
    'ckb-Latn'?: ArtistLanguageContent
    'kmr'?: ArtistLanguageContent
    'hac'?: ArtistLanguageContent
  }
  defaultLang: LanguageCode
  chords?: number
  image?: FileReference
}
```

---

## Phase 2: URL Routing & Navigation

### 2.1 Update Route Constants

**File:** `end_user/constants/routes.ts`

```typescript
export type LanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr' | 'hac'

export const ROUTES = {
  HOME: '/',
  DISCOVERY: '/discovery',
  COMMUNITY: '/community',
  
  ARTIST: {
    INDEX: '/artist',
    DETAIL: (id: string, lang?: LanguageCode) => 
      lang ? `/artist/${id}/${lang}` : `/artist/${id}`,
  },
  
  TAB: {
    DETAIL: (id: string, lang?: LanguageCode) => 
      lang ? `/tab/${id}/${lang}` : `/tab/${id}`,
  },
} as const
```

### 2.2 Update Page Structure

**Current:** `pages/tab/[id].vue`  
**New:** `pages/tab/[id]/[[lang]].vue` (optional catch-all)

**File:** `end_user/pages/tab/[id]/[[lang]].vue`

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LanguageCode } from '~/constants/routes'

definePageMeta({
  layout: 'song'
})

const route = useRoute()
const router = useRouter()

// Extract song ID and language from route
const songId = computed(() => route.params.id as string)
const langCode = computed<LanguageCode>(() => {
  const lang = route.params.lang as string
  const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
  return validLangs.includes(lang as LanguageCode) 
    ? (lang as LanguageCode) 
    : 'ckb-IR' // Default fallback
})

// Fetch song and extract language-specific content
const song = ref<SongWithLang | null>(null)
const availableLangs = computed(() => song.value?.availableLangs || [])

// Language switcher function
const switchLanguage = (newLang: LanguageCode) => {
  router.push(`/tab/${songId.value}/${newLang}`)
}

// ... rest of component logic
</script>
```

**Alternative:** Use separate route files:

```
pages/
  tab/
    [id]/
      index.vue          → /tab/1234 (default)
      [lang].vue         → /tab/1234/kmr
```

### 2.3 Route Middleware for Language Validation

**File:** `end_user/middleware/lang-validator.ts`

```typescript
export default defineNuxtRouteMiddleware((to) => {
  const validLangs = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
  const lang = to.params.lang as string
  
  // If lang param exists but is invalid, redirect to default
  if (lang && !validLangs.includes(lang)) {
    return navigateTo(to.path.replace(`/${lang}`, ''))
  }
})
```

---

## Phase 3: Service Layer Updates

**Important:** This project uses `dataProvider` from `@modular-rest/client` for all database operations. No traditional REST API endpoints are needed - all CRUD operations go through the dataProvider which communicates directly with the modular-rest backend.

### 3.1 Update Service Layer (End User)

**File:** `end_user/composables/useTabService.ts`

```typescript
import { dataProvider } from '@modular-rest/client'
import type { LanguageCode } from '~/constants/routes'

// Add language parameter to fetch functions
async function fetchSongById(
  id: string, 
  lang?: LanguageCode
): Promise<SongWithLang | null> {
  const song = await dataProvider.findOne({
    database: 'tab',
    collection: 'song',
    query: { _id: id },
    populates: ['artists', 'genres'],
  })
  
  if (!song) return null
  
  // Extract language-specific content (direct access - O(1))
  const targetLang = lang || song.defaultLang || 'ckb-IR'
  const langContent = song.content?.[targetLang]
  
  if (!langContent) {
    // Fallback to default language
    const defaultContent = song.content?.[song.defaultLang]
    if (!defaultContent) return null
    return {
      ...song,
      currentLang: song.defaultLang,
      ...defaultContent,
    }
  }
  
  return {
    ...song,
    currentLang: targetLang,
    ...langContent,
  }
}

// Helper to get available languages for a song
function getAvailableLangs(song: Song): LanguageCode[] {
  return (Object.keys(song.content || {}) as LanguageCode[]).filter(
    lang => song.content[lang]?.title
  )
}
```

**Note:** All data operations use `dataProvider` directly - no traditional REST API endpoints needed. The `dataProvider` from `@modular-rest/client` handles all CRUD operations through the modular-rest client, providing a unified interface for database operations.****

---

## Phase 4: Admin Panel Implementation

### 4.1 Language Tabs UI

**File:** `admin_panel/pages/admin/song/_id.vue`

```vue
<template>
  <div>
    <!-- Language Tabs -->
    <div class="language-tabs">
      <button 
        v-for="lang in availableLangs" 
        :key="lang"
        :class="{ active: currentLang === lang }"
        @click="switchLanguage(lang)"
      >
        {{ getLangLabel(lang) }}
      </button>
      <button @click="addLanguage">+ Add Language</button>
    </div>
    
    <!-- Language-specific form -->
    <form v-if="currentLangContent">
      <input v-model="currentLangContent.title" placeholder="Title" />
      <input v-model="currentLangContent.title_seo" placeholder="SEO Title" />
      <input v-model="currentLangContent.rhythm" placeholder="Rhythm" />
      
      <!-- Sections editor -->
      <SectionsEditor :sections="currentLangContent.sections" />
      
      <!-- Copy from another language -->
      <select v-model="copyFromLang" @change="copyLanguage">
        <option value="">Copy from...</option>
        <option 
          v-for="lang in availableLangs.filter(l => l !== currentLang)" 
          :key="lang"
          :value="lang"
        >
          {{ getLangLabel(lang) }}
        </option>
      </select>
    </form>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import { notifier } from '@/plugins/toaster' // Adjust import path as needed

export default {
  data() {
    return {
      song: null,
      form: {}, // Form data for current language
      currentLang: 'ckb-IR',
      copyFromLang: '',
      pending: false,
    }
  },
  computed: {
    currentLangContent() {
      return this.song?.content?.[this.currentLang]
    },
    availableLangs() {
      if (!this.song?.content) return []
      return Object.keys(this.song.content).filter(
        lang => this.song.content[lang]?.title
      )
    },
    id() {
      return this.$route.params.id
    },
  },
  methods: {
    switchLanguage(lang) {
      // Save current language content to form before switching
      if (this.song && this.currentLangContent) {
        this.song.content[this.currentLang] = { ...this.form }
      }
      
      this.currentLang = lang
      
      // Load new language content into form
      if (this.song?.content?.[lang]) {
        this.form = { ...this.song.content[lang] }
      } else {
        // Initialize empty form for new language
        this.form = {
          title: '',
          title_seo: '',
          rhythm: '',
          sections: [],
        }
      }
    },
    async copyLanguage() {
      if (!this.copyFromLang) return
      
      const sourceContent = this.song.content[this.copyFromLang]
      if (!sourceContent) {
        notifier.toast({
          label: 'Error',
          description: 'Source language content not found',
          type: 'error',
        })
        return
      }
      
      // Copy content to current language (frontend-side operation)
      this.form = {
        ...sourceContent,
        // Deep copy sections array
        sections: sourceContent.sections ? JSON.parse(JSON.stringify(sourceContent.sections)) : [],
      }
      
      // Update song object locally
      this.song.content[this.currentLang] = { ...this.form }
      
      // Save to database using dataProvider
      this.pending = true
      try {
        await dataProvider.updateOne({
          database: 'tab',
          collection: 'song',
          query: { _id: this.song._id },
          update: {
            [`content.${this.currentLang}`]: this.form,
            updatedAt: new Date(),
          },
        })
        
        notifier.toast({
          label: 'Success',
          description: `Content copied from ${this.getLangLabel(this.copyFromLang)}`,
          type: 'success',
        })
        this.copyFromLang = ''
      } catch (error) {
        console.error('Failed to copy language:', error)
        notifier.toast({
          label: 'Error',
          description: 'Failed to save changes',
          type: 'error',
        })
        // Revert local change on error
        delete this.song.content[this.currentLang]
        this.form = {
          title: '',
          title_seo: '',
          rhythm: '',
          sections: [],
        }
      } finally {
        this.pending = false
      }
    },
    async update() {
      // Save current language content
      if (!this.song) return
      
      this.pending = true
      try {
        // Update current language content in song object
        this.song.content[this.currentLang] = { ...this.form }
        
        // Save entire song using dataProvider
        await dataProvider.updateOne({
          database: 'tab',
          collection: 'song',
          query: { _id: this.song._id },
          update: {
            content: this.song.content,
            updatedAt: new Date(),
          },
        })
        
        notifier.toast({
          label: 'Success',
          description: 'Song saved successfully',
          type: 'success',
        })
      } catch (error) {
        console.error('Failed to save song:', error)
        notifier.toast({
          label: 'Error',
          description: 'Failed to save song',
          type: 'error',
        })
      } finally {
        this.pending = false
      }
    },
    getLangLabel(lang) {
      const labels = {
        'ckb-IR': 'سورانی (ایران)',
        'ckb-Latn': 'سورانی (لاتین)',
        'kmr': 'کرمانجی',
        'hac': 'گورانی',
      }
      return labels[lang] || lang
    },
    async loadSong() {
      this.pending = true
      try {
        const song = await dataProvider.findOne({
          database: 'tab',
          collection: 'song',
          query: { _id: this.id },
        })
        
        if (song) {
          this.song = song
          // Load current language content into form
          if (song.content?.[this.currentLang]) {
            this.form = { ...song.content[this.currentLang] }
          } else {
            // Initialize empty form
            this.form = {
              title: '',
              title_seo: '',
              rhythm: '',
              sections: [],
            }
          }
        }
      } catch (error) {
        console.error('Failed to load song:', error)
        notifier.toast({
          label: 'Error',
          description: 'Failed to load song',
          type: 'error',
        })
      } finally {
        this.pending = false
      }
    },
  },
  async mounted() {
    await this.loadSong()
  },
}
</script>
```

### 4.2 Language Management Component

**File:** `admin_panel/components/inputs/LanguageManager.vue`

```vue
<template>
  <div class="language-manager">
    <div class="lang-tabs">
      <button 
        v-for="lang in languages" 
        :key="lang.code"
        :class="{ active: activeLang === lang.code }"
        @click="setActiveLang(lang.code)"
      >
        {{ lang.label }}
        <span v-if="lang.hasContent" class="badge">✓</span>
      </button>
    </div>
    
    <div class="lang-content">
      <slot :lang="activeLang" :content="getContent(activeLang)" />
    </div>
    
    <div class="lang-actions">
      <button @click="copyFromLang">Copy from...</button>
      <button @click="addLanguage">Add Language</button>
    </div>
  </div>
</template>
```

---

## Phase 5: End User UI - Language Switcher

### 5.1 Language Switcher Component

**File:** `end_user/components/widget/song/LanguageSwitcher.vue`

```vue
<template>
  <div class="language-switcher" v-if="availableLangs.length > 1">
    <div class="switcher-label">{{ t('song.language') }}:</div>
    <div class="switcher-buttons">
      <button
        v-for="lang in availableLangs"
        :key="lang"
        :class="{ 
          active: currentLang === lang,
          unavailable: !isLangAvailable(lang)
        }"
        @click="switchToLang(lang)"
        :title="getLangLabel(lang)"
      >
        {{ getLangCode(lang) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LanguageCode } from '~/constants/routes'

const props = defineProps<{
  availableLangs: LanguageCode[]
  currentLang: LanguageCode
  songId: string
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const switchToLang = (lang: LanguageCode) => {
  if (!props.availableLangs.includes(lang)) return
  
  const newPath = lang === 'ckb-IR' 
    ? `/tab/${props.songId}` // Default: no lang in URL
    : `/tab/${props.songId}/${lang}`
  
  router.push(newPath)
}

const getLangLabel = (lang: LanguageCode) => {
  const labels = {
    'ckb-IR': 'سورانی (ایران)',
    'ckb-Latn': 'سورانی (لاتین)',
    'kmr': 'کرمانجی',
    'hac': 'گورانی',
  }
  return labels[lang] || lang
}

const getLangCode = (lang: LanguageCode) => {
  // Show short code for UI
  return lang.split('-')[0].toUpperCase()
}

const isLangAvailable = (lang: LanguageCode) => {
  return props.availableLangs.includes(lang)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-card);
  border-radius: 0.5rem;
}

.switcher-buttons {
  display: flex;
  gap: 0.25rem;
}

.switcher-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: var(--surface-base);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.switcher-buttons button:hover {
  background: var(--surface-hover);
}

.switcher-buttons button.active {
  background: var(--brand-primary);
  color: white;
  border-color: var(--brand-primary);
}

.switcher-buttons button.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 5.2 Integrate Language Switcher in Song Page

**File:** `end_user/pages/tab/[id]/[[lang]].vue`

```vue
<template>
  <div v-if="song">
    <!-- Language Switcher -->
    <LanguageSwitcher 
      :available-langs="availableLangs"
      :current-lang="langCode"
      :song-id="songId"
    />
    
    <!-- Rest of song content -->
    <!-- ... -->
  </div>
</template>
```

---

## Phase 6: Migration Strategy

### 6.1 Data Migration Script

**File:** `server/scripts/migrate-to-multilang.js`

A complete Node.js migration script that:
- Connects directly to MongoDB
- Migrates all songs and artists to new multi-language schema
- Provides detailed statistics and error reporting
- Can be run manually with safety checks

**Installation:**

The script uses `mongodb` driver. If not already installed:

```bash
cd server
npm install mongodb
# or
yarn add mongodb
```

**Usage:**

```bash
# From server directory
node scripts/migrate-to-multilang.js

# Or make it executable and run directly
chmod +x scripts/migrate-to-multilang.js
./scripts/migrate-to-multilang.js
```

**Environment Variables:**

The script reads MongoDB connection from `.env` file:
```bash
MONGODB_URL=mongodb://localhost:27017
# or
MONGODB_URL=mongodb://user:password@host:27017
```

**What it does:**

1. ✅ Connects to MongoDB using `MONGODB_URL` from `.env` (or default: `mongodb://localhost:27017`)
2. ✅ Migrates all songs: converts `title`, `title_seo`, `rhythm`, `sections` → `content.ckb-IR.*`
3. ✅ Migrates all artists: converts `name`, `name_seo`, `bio` → `content.ckb-IR.*`
4. ✅ Sets `defaultLang: 'ckb-IR'` for all documents
5. ✅ Initializes all language slots (`ckb-IR`, `ckb-Latn`, `kmr`, `hac`) with `null` for non-default languages
6. ✅ Removes old fields after migration (title, title_seo, rhythm, sections for songs; name, name_seo, bio for artists)
7. ✅ Skips already migrated documents
8. ✅ Processes in batches for performance
9. ✅ Provides progress updates and detailed statistics
10. ✅ Verifies migration after completion

**Safety Features:**

- Checks if document is already migrated (skips if yes)
- Error handling per document (continues on errors)
- Verification step after migration
- Detailed logging and statistics
- **Important:** Old fields are removed after migration (backup available for recovery if needed)

**Example Output:**

```
🚀 Starting Multi-Language Schema Migration
   Database: tab
   MongoDB URL: mongodb://***@localhost:27017

📡 Connecting to MongoDB...
   ✓ Connected

🎵 Migrating songs...
   Found 1250 songs
   Progress: 100/1250
   Progress: 200/1250
   ...
   ✓ Migrated: 1250
   ⊘ Skipped: 0
   ❌ Errors: 0

👤 Migrating artists...
   Found 350 artists
   ✓ Migrated: 350
   ⊘ Skipped: 0
   ❌ Errors: 0

🔍 Verifying migration...
   Songs: 1250/1250 have new structure
   Artists: 350/350 have new structure
   ✅ All documents migrated successfully!

📊 Migration Summary:
   Songs:
     Total: 1250
     Migrated: 1250
     Skipped: 0
   Artists:
     Total: 350
     Migrated: 350
     Skipped: 0

✅ Migration completed successfully!
```

**Before Running in Production:**

1. **Create backup** using existing backup system:
   - Via API: `GET /backup` (creates backup zip file)
   - Via Admin Panel: Use backup feature in settings
   - Backup includes both database and uploads directory

2. **Test on staging/local first** to verify migration works correctly

3. **Run migration:**
   ```bash
   node scripts/migrate-to-multilang.js
   ```

4. **Verify results:**
   - Check migration statistics
   - Test a few songs/artists in admin panel
   - Verify frontend still works correctly
   - Verify old fields have been removed (check a few documents in MongoDB)

### 6.2 Post-Migration Notes

**Important:** After running the migration script, all old fields are removed. The system will only work with the new multi-language structure.

**No Backward Compatibility:** Since old fields are deleted, there's no need for backward compatibility code. All documents must be migrated before deploying the new code.

**Migration Order:**
1. ✅ Backup database (via admin panel or API)
2. ✅ Run migration script: `node scripts/migrate-to-multilang.js`
3. ✅ Verify migration completed successfully
4. ✅ Deploy new code that uses multi-language structure
5. ✅ Test thoroughly in production

**If Migration Fails:**
- Restore from backup
- Fix any issues
- Re-run migration script

---

## Phase 7: SEO Implementation

### 7.1 hreflang Tags

**File:** `end_user/pages/tab/[id]/[[lang]].vue`

```typescript
useHead({
  link: computed(() => {
    if (!song.value) return []
    
    const baseUrl = 'https://goranee.ir'
    const links = []
    
    // Add hreflang for each available language
    getAvailableLangs(song.value).forEach(lang => {
      const url = lang === 'ckb-IR'
        ? `${baseUrl}/tab/${songId.value}`
        : `${baseUrl}/tab/${songId.value}/${lang}`
      
      links.push({
        rel: 'alternate',
        hreflang: lang,
        href: url,
      })
    })
    
    // Add x-default
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}/tab/${songId.value}`,
    })
    
    return links
  }),
})
```

### 7.2 Canonical URLs

```typescript
useHead({
  link: [
    {
      rel: 'canonical',
      href: computed(() => {
        const baseUrl = 'https://goranee.ir'
        const lang = langCode.value === 'ckb-IR' ? '' : `/${langCode.value}`
        return `${baseUrl}/tab/${songId.value}${lang}`
      }),
    },
  ],
})
```

### 7.3 Sitemap Updates

Include all language versions in sitemap:

```typescript
// In sitemap generation
songs.forEach(song => {
  getAvailableLangs(song).forEach(lang => {
    sitemapUrls.push({
      url: lang === 'ckb-IR' 
        ? `/tab/${song._id}`
        : `/tab/${song._id}/${lang}`,
      lastmod: song.updatedAt,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: getAvailableLangs(song).map(l => ({
        lang: l,
        url: l === 'ckb-IR' ? `/tab/${song._id}` : `/tab/${song._id}/${l}`,
      })),
    })
  })
})
```

---

## Phase 8: Testing & Validation

### 8.1 Test Cases

1. **URL Routing**
   - ✅ `/tab/1234` → Default language (ckb-IR)
   - ✅ `/tab/1234/kmr` → Kurmanji version
   - ✅ Invalid lang code → Redirect to default
   - ✅ Missing language → Fallback to default

2. **Language Switching**
   - ✅ Switch between available languages
   - ✅ Preserve scroll position
   - ✅ Update URL correctly
   - ✅ Load correct content

3. **Admin Panel**
   - ✅ Edit each language separately
   - ✅ Copy content between languages
   - ✅ Add new language version
   - ✅ Remove language version

4. **Data Migration**
   - ✅ Existing songs migrated correctly
   - ✅ Backward compatibility maintained
   - ✅ No data loss

5. **SEO**
   - ✅ hreflang tags correct
   - ✅ Canonical URLs correct
   - ✅ Sitemap includes all languages

---

## Implementation Timeline

| Phase       | Tasks                      | Estimated Time | Dependencies |
| ----------- | -------------------------- | -------------- | ------------ |
| **Phase 1** | Database schema updates    | 2-3 days       | None         |
| **Phase 2** | URL routing & navigation   | 2-3 days       | Phase 1      |
| **Phase 3** | Backend API updates        | 2-3 days       | Phase 1      |
| **Phase 4** | Admin panel UI             | 4-5 days       | Phase 1, 3   |
| **Phase 5** | End user language switcher | 2-3 days       | Phase 2, 3   |
| **Phase 6** | Data migration             | 1-2 days       | Phase 1      |
| **Phase 7** | SEO implementation         | 2-3 days       | Phase 2      |
| **Phase 8** | Testing & validation       | 3-4 days       | All phases   |

**Total Estimated Time:** 18-26 days (3.5-5 weeks)

---

## Risk Mitigation

### Risks

1. **Data Loss During Migration**
   - **Mitigation:** Full database backup before migration
   - **Mitigation:** Test migration on staging first
   - **Mitigation:** Keep old fields during transition period

2. **Breaking Existing URLs**
   - **Mitigation:** Implement redirects from old URLs
   - **Mitigation:** Maintain backward compatibility
   - **Mitigation:** Gradual rollout

3. **Performance Impact**
   - **Mitigation:** Index `availableLangs` field
   - **Mitigation:** Cache language-specific queries
   - **Mitigation:** Lazy load language content

4. **SEO Impact**
   - **Mitigation:** Proper hreflang implementation
   - **Mitigation:** Canonical URLs for each language
   - **Mitigation:** Monitor Search Console

---

## Success Criteria

- ✅ All songs support multiple language versions
- ✅ URL structure includes language codes
- ✅ Language switcher works on all song pages
- ✅ Admin panel allows editing each language separately
- ✅ Copy functionality works between languages
- ✅ SEO properly implemented (hreflang, canonical)
- ✅ No data loss during migration
- ✅ Backward compatibility maintained
- ✅ Performance not degraded

---

## Next Steps

1. **Review & Approve** this roadmap
2. **Set up development branch** for multi-language feature
3. **Start with Phase 1** (Database schema)
4. **Create migration scripts** early for testing
5. **Implement incrementally** - one phase at a time
6. **Test thoroughly** before production deployment

---

## Questions & Decisions Needed

1. **Default Language:** Confirm `ckb-IR` as default?
2. **URL Structure:** Use `/tab/1234/kmr` or `/kmr/tab/1234`?
3. **Fallback Strategy:** What if requested language doesn't exist?
4. **Migration Timeline:** When to run migration? (maintenance window?)
5. **Old URLs:** Redirect strategy for old URLs?
6. **Performance:** Caching strategy for language content?

---

**Document Version:** 1.0  
**Last Updated:** December 2024

