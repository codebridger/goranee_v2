// Type definitions for db_song.js CollectionDefinitions

// Language code type
export type LanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr' | 'en'

// File reference type (for Schemas.file)
export interface FileReference {
  path?: string
  filename?: string
  mimetype?: string
  size?: number
}

// Schema types
export interface SongChord {
  rowIndex?: number
  column?: string
  title?: string
  table?: string
  chord?: string
  keySignature?: string
  type?: 'regular' | 'chromatic'
}

export interface VocalNote {
  note?: string
  index?: number
  table?: string
}

export interface SongSectionLine {
  chords?: string
  text?: string
}

export interface SongSection {
  title?: string
  direction?: string
  lines?: SongSectionLine[]
}

export interface Melody {
  title?: string
  file?: FileReference
}

// Language-specific content types
export interface SongLanguageContent {
  title: string
  title_seo?: string
  sections?: SongSection[]
}

export interface ArtistLanguageContent {
  name: string
  name_seo?: string
  bio?: string
}

// Collection types
export interface Genre {
  _id?: string
  title?: string
  title_seo?: string
  image?: FileReference
}

export interface Rhythm {
  _id?: string
  title: string
  description?: string
}

export interface Artist {
  _id?: string
  // Nested object: lang code is the key
  content: {
    'ckb-IR'?: ArtistLanguageContent
    'ckb-Latn'?: ArtistLanguageContent
    'kmr'?: ArtistLanguageContent
  }
  chords?: number
  image?: FileReference
}

export interface SongChords {
  keySignature?: 'major' | 'minor'
  vocalNote?: VocalNote
  list?: SongChord[]
}

export interface Song {
  _id: string
  // Nested object: lang code is the key
  content: {
    'ckb-IR'?: SongLanguageContent
    'ckb-Latn'?: SongLanguageContent
    'kmr'?: SongLanguageContent
  }
  // Shared content
  rhythm?: Rhythm[] // Array of populated Rhythm objects
  artists?: string[] // ObjectId references
  genres?: string[] // ObjectId references
  chords?: SongChords
  image?: FileReference
  melodies?: Melody[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Helper type for current language view (flattened for easier use)
export interface SongWithLang extends Omit<Song, 'content' | 'rhythm'> {
  currentLang: LanguageCode
  title: string
  title_seo?: string
  rhythm?: string // Comma-separated string of rhythm titles (e.g., "Slow 6/8, Kurdish 7/8") - processed from Song.rhythm (Rhythm[])
  sections?: SongSection[]
}

// Document types with populated references (optional, for when refs are populated)
export interface SongWithPopulatedRefs extends Omit<Song, 'artists' | 'genres' | 'rhythm' | 'content'> {
  // Flattened title from content (added by _processSongs)
  title?: string
  title_seo?: string
  sections?: SongSection[]
  rhythm?: string // Processed as comma-separated string from Rhythm[] array
  artists?: Artist[]
  genres?: Genre[]
}

// Content language code (excludes 'en' as it's not used in content objects)
export type ContentLanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr'

// Helper function to get available languages
export function getAvailableLangs(song: Song): ContentLanguageCode[] {
  return (Object.keys(song.content || {}) as ContentLanguageCode[]).filter(
    lang => song.content[lang]?.title
  )
}

// Helper function to get available languages for artist
export function getAvailableLangsForArtist(artist: Artist): ContentLanguageCode[] {
  return (Object.keys(artist.content || {}) as ContentLanguageCode[]).filter(
    lang => artist.content[lang]?.name
  )
}


