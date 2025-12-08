export const DATABASE_NAME = 'tab'
export const COLLECTION_NAME = {
  SONG: 'song',
  ARTIST: 'artist',
  GENRE: 'genre',
}

// Chord database for transposition tables
export const CHORD_DATABASE_NAME = 'chord'
export const CHORD_COLLECTION_NAME = {
  TABLE: 'table',
  CHORD: 'chord',
  KEY_SIGNATURE: 'keysignature',
  TYPE: 'type',
}

// Chord transposition table types
export interface ChordKeySignature {
  _id: string
  minor: string
  major: string
  description?: string
}

export interface ChordType {
  _id: string
  title: string
  description?: string
}

export interface ChordVariant {
  _id: string
  title: string
  type: string | ChordType
}

export interface ChordTableRow {
  major: ChordVariant
  naturalMinor: ChordVariant
  harmonicMinor: ChordVariant
  melodicMinor: ChordVariant
}

export interface ChordChromaticRow {
  one?: ChordVariant
  two?: ChordVariant
  three?: ChordVariant
  four?: ChordVariant
}

export interface TranspositionTable {
  _id: string
  keySignature: ChordKeySignature
  type: string | ChordType
  rows: ChordTableRow[]
  chromaticRows: ChordChromaticRow[]
  vocalRows: string[]
}
