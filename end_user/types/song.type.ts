// Type definitions for db_song.js CollectionDefinitions

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

// Collection types
export interface Genre {
  _id?: string
  title?: string
  title_seo?: string
  image?: FileReference
}

export interface Artist {
  _id?: string
  name: string // required
  name_seo?: string
  chords?: number
  image?: FileReference
  bio?: string
}

export interface SongChords {
  keySignature?: 'major' | 'minor'
  vocalNote?: VocalNote
  list?: SongChord[]
}

export interface Song {
  _id: string
  title: string // required
  title_seo?: string
  rhythm?: string
  artists?: string[] // ObjectId references
  genres?: string[] // ObjectId references
  chords?: SongChords
  sections?: SongSection[]
  image?: FileReference
  melodies?: Melody[]
}

// Document types with populated references (optional, for when refs are populated)
export interface SongWithPopulatedRefs extends Omit<Song, 'artists' | 'genres'> {
  artists?: Artist[]
  genres?: Genre[]
}


