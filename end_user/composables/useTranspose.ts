import { computed } from 'vue'
import { useChordTablesStore } from '~/stores/chordTables'
import type { SongChord, SongSection, SongSectionLine, VocalNote, SongChords } from '~/types/song.type'
import type { TranspositionTable, ChordTableRow, ChordChromaticRow } from '~/types/database.type'

// Position of a chord within a line string
interface ChordPosition {
  from: number
  to: number
  word: string
  newWord?: string
}

/**
 * Helper: Generate a string of spaces
 */
function generateSpace(total: number): string {
  return ' '.repeat(Math.max(0, total))
}

/**
 * Recursively find all positions of a word in text (only if it's a complete word)
 * Based on chord_library's findWordPosition algorithm
 */
function findWordPosition(word: string, text: string, lastLength = 0): ChordPosition[] {
  const positions: ChordPosition[] = []
  const from = text.indexOf(word)

  // Not found
  if (from === -1) return positions

  const to = from + word.length - 1
  const position: ChordPosition = {
    from: from + (lastLength > 0 ? lastLength : 0),
    to: to + (lastLength > 0 ? lastLength : 0),
    word: word,
  }

  // Validate word boundaries (must be surrounded by spaces or at start/end)
  const charAfter = text.charAt(to + 1)
  if (charAfter.length && charAfter !== ' ') {
    return positions // Invalid - not a complete word
  }

  const charBefore = text.charAt(from - 1)
  if (charBefore.length && charBefore !== ' ') {
    return positions // Invalid - not a complete word
  }

  positions.push(position)

  // Recursive call for remaining text
  const rest = text.slice(to + 1)
  if (rest.length) {
    const newLastLength = to + lastLength + 1
    const restPositions = findWordPosition(word, rest, newLastLength)
    positions.push(...restPositions)
  }

  return positions
}

/**
 * Separate chords from a chord line into position objects
 */
function separateChords(chordsLine: string): ChordPosition[] {
  // Split by space, remove empty entries
  const uniqueChords: string[] = []
  const separated = chordsLine.split(' ').filter((item) => item !== '')

  // Remove duplicate chords (for unique matching)
  for (const chord of separated) {
    if (!uniqueChords.includes(chord)) {
      uniqueChords.push(chord)
    }
  }

  // Find positions for each unique chord
  let positions: ChordPosition[] = []
  for (const chordTitle of uniqueChords) {
    positions = positions.concat(findWordPosition(chordTitle, chordsLine))
  }

  // Sort by position (left to right)
  positions.sort((a, b) => a.from - b.from)

  return positions
}

/**
 * Inject spaces between chords, recalculating for length differences
 */
function injectSpaceBetweenChords(
  positions: ChordPosition[],
  lineLength: number
): ChordPosition[] {
  const result: ChordPosition[] = []

  if (positions.length === 0) return result

  if (positions.length === 1) {
    const pos = positions[0]
    // Add starting space if chord doesn't start at 0
    if (pos.from > 0) {
      result.push({
        from: 0,
        to: pos.from - 1,
        word: generateSpace(pos.from),
      })
    }
    result.push(pos)
    // Add trailing space
    if (pos.to < lineLength - 1) {
      result.push({
        from: pos.to + 1,
        to: lineLength - 1,
        word: generateSpace(lineLength - pos.to - 1),
      })
    }
    return result
  }

  // Process multiple positions
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i]

    // Add starting space before first chord
    if (i === 0 && current.from > 0) {
      result.push({
        from: 0,
        to: current.from - 1,
        word: generateSpace(current.from),
      })
    }

    result.push(current)

    // Add space between current and next chord
    if (i < positions.length - 1) {
      const next = positions[i + 1]
      const currentLengthDiff = current.word.length - (current.newWord?.length || current.word.length)
      let totalSpace = next.from - current.to - 1

      // Adjust for length changes when chord name changes
      totalSpace += currentLengthDiff

      result.push({
        from: current.to + 1,
        to: next.from - 1,
        word: generateSpace(Math.max(1, totalSpace)),
      })
    }

    // Add trailing space after last chord
    if (i === positions.length - 1 && current.to < lineLength - 1) {
      result.push({
        from: current.to + 1,
        to: lineLength - 1,
        word: generateSpace(lineLength - current.to - 1),
      })
    }
  }

  return result
}

/**
 * Deep clone helper (simple implementation for our data structures)
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Composable for table-based chord transposition
 */
export const useTranspose = () => {
  const store = useChordTablesStore()

  // Computed to check if tables are ready
  const isReady = computed(() => store.isLoaded && store.tables.length > 0)

  /**
   * Get table index from a chord's table ID
   */
  const getChordTableIndex = (chord: SongChord): number => {
    if (!chord.table) return -1
    return store.getTableIndexById(chord.table)
  }

  /**
   * Find the original table index from song's first chord
   */
  const getOriginalTableIndex = (chords: SongChords | undefined): number => {
    if (!chords?.list || chords.list.length === 0) return 0
    const firstChord = chords.list[0]
    return getChordTableIndex(firstChord)
  }

  /**
   * Get chord from table by row index and column
   */
  const getChordFromTable = (
    table: TranspositionTable,
    rowIndex: number,
    column: string,
    type: 'regular' | 'chromatic' = 'regular'
  ): { title: string; _id: string } | null => {
    const rows = type === 'regular' ? table.rows : table.chromaticRows

    if (!rows || rowIndex < 0 || rowIndex >= rows.length) return null

    const row = rows[rowIndex] as ChordTableRow | ChordChromaticRow

    // Map column names for chromatic rows
    const chromaticColumnMap: Record<string, keyof ChordChromaticRow> = {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
    }

    // Map column names for regular rows
    const regularColumnMap: Record<string, keyof ChordTableRow> = {
      major: 'major',
      naturalMinor: 'naturalMinor',
      harmonicMinor: 'harmonicMinor',
      melodicMinor: 'melodicMinor',
    }

    let chord
    if (type === 'chromatic') {
      const colKey = chromaticColumnMap[column]
      chord = colKey ? (row as ChordChromaticRow)[colKey] : undefined
    } else {
      const colKey = regularColumnMap[column]
      chord = colKey ? (row as ChordTableRow)[colKey] : undefined
    }

    if (!chord) return null

    return {
      title: chord.title,
      _id: chord._id,
    }
  }

  /**
   * Transpose a single chord to a new table index
   */
  const transposeChord = (
    chord: SongChord,
    newTableIndex: number
  ): SongChord => {
    const table = store.getTableByIndex(newTableIndex)
    if (!table || chord.rowIndex === undefined || !chord.column) {
      return chord
    }

    const newChordData = getChordFromTable(
      table,
      chord.rowIndex,
      chord.column,
      chord.type || 'regular'
    )

    if (!newChordData) return chord

    return {
      ...chord,
      title: newChordData.title,
      table: table._id,
      chord: newChordData._id,
      keySignature: table.keySignature._id,
    }
  }

  /**
   * Transpose vocal note to new table
   */
  const transposeVocalNote = (
    vocalNote: VocalNote | undefined,
    newTableIndex: number
  ): VocalNote | undefined => {
    if (!vocalNote || vocalNote.index === undefined) return vocalNote

    const table = store.getTableByIndex(newTableIndex)
    if (!table || !table.vocalRows) return vocalNote

    const newNote = table.vocalRows[vocalNote.index]
    if (!newNote) return vocalNote

    return {
      ...vocalNote,
      table: table._id,
      note: newNote,
    }
  }

  /**
   * Transpose all chords in the list to a new table
   */
  const transposeChordList = (
    originalChords: SongChord[],
    newTableIndex: number
  ): SongChord[] => {
    return originalChords.map((chord) => transposeChord(chord, newTableIndex))
  }

  /**
   * Apply transposed chords to section lines, preserving spacing
   * This is the core algorithm from chord_library
   */
  const transposeSectionLines = (
    sections: SongSection[],
    originalChords: SongChord[],
    transposedChords: SongChord[]
  ): SongSection[] => {
    const result = deepClone(sections)

    // Create a mapping from original chord title to transposed title
    const chordMap = new Map<string, string>()
    for (let i = 0; i < originalChords.length; i++) {
      const original = originalChords[i]
      const transposed = transposedChords[i]
      if (original.title && transposed.title) {
        chordMap.set(original.title, transposed.title)
      }
    }

    // Process each section
    for (const section of result) {
      if (!section.lines) continue

      for (const line of section.lines) {
        if (!line.chords) continue

        // Separate chords from the line
        const positions = separateChords(line.chords)

        // Map original chords to transposed chords
        for (const position of positions) {
          const transposedTitle = chordMap.get(position.word)
          if (transposedTitle) {
            position.newWord = transposedTitle
          }
        }

        // Recalculate spacing and rebuild line
        const normalizedList = injectSpaceBetweenChords(positions, line.chords.length)

        // Join back into string
        let transposedLine = ''
        for (const pos of normalizedList) {
          transposedLine += pos.newWord || pos.word
        }

        if (transposedLine.length > 0) {
          line.chords = transposedLine
        }
      }
    }

    return result
  }

  /**
   * Full transpose operation: sections + vocal note
   * Returns everything needed for rendering
   */
  const transposeAll = (
    sections: SongSection[],
    songChords: SongChords | undefined,
    newTableIndex: number
  ): {
    sections: SongSection[]
    vocalNote: VocalNote | undefined
    chordList: SongChord[]
  } => {
    if (!songChords?.list || songChords.list.length === 0) {
      return {
        sections: deepClone(sections),
        vocalNote: songChords?.vocalNote,
        chordList: [],
      }
    }

    const transposedChords = transposeChordList(songChords.list, newTableIndex)
    const transposedSections = transposeSectionLines(sections, songChords.list, transposedChords)
    const transposedVocalNote = transposeVocalNote(songChords.vocalNote, newTableIndex)

    return {
      sections: transposedSections,
      vocalNote: transposedVocalNote,
      chordList: transposedChords,
    }
  }

  /**
   * Get display name for current key
   */
  const getKeyDisplayName = (
    tableIndex: number,
    keyQuality: 'major' | 'minor' | undefined = 'major'
  ): string => {
    return store.getKeySignatureName(tableIndex, keyQuality || 'major')
  }

  // Legacy support: simple semitone-based transpose for fallback
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const transposeNoteBySemitone = (note: string, semitones: number): string => {
    const index = NOTES.indexOf(note)
    if (index === -1) return note
    let newIndex = (index + semitones) % 12
    if (newIndex < 0) newIndex += 12
    return NOTES[newIndex]
  }

  return {
    // State
    isReady,
    tables: computed(() => store.tables),
    keySignatures: computed(() => store.keySignatures),
    // Core functions
    getOriginalTableIndex,
    getChordTableIndex,
    transposeChord,
    transposeChordList,
    transposeVocalNote,
    transposeSectionLines,
    transposeAll,
    getKeyDisplayName,
    // Legacy fallback
    transposeNoteBySemitone,
    // Store access
    fetchTables: store.fetchTables,
  }
}
