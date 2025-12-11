import { computed } from 'vue'
import { useChordTablesStore } from '~/stores/chordTables'
import type { SongChord, SongSection, VocalNote, SongChords } from '~/types/song.type'


// Helper functions from v1 logic

function generateSpace(total: number) {
  let text = "";
  for (let index = 0; index < total; index++) {
    text += " ";
  }
  return text;
}

interface Position {
  from: number;
  to: number;
  word: string;
  newWord?: string;
}

/**
 * @param string word the string you want find its positions.
 * @param string text the text you want to find word positions in it.
 */
function findWordPosition(word: string, text: string, lastLength = 0): Position[] {
  let positions: Position[] = [];
  
  let from = text.indexOf(word);

  // is not valid if from is -1
  if (from == -1) {
    return positions;
  }

  let to = from + word.length - 1;
  let position: Position = {
    from: from + (lastLength > 0 ? lastLength : 0),
    to: to + (lastLength > 0 ? lastLength : 0),
    word: word,
  };

  /**
   * Check valid [from] position
   */

  // is not valid if after [from] posed another character
  let charAfterToPositiontext = text.charAt(position.to + 1);
  if (charAfterToPositiontext.length && charAfterToPositiontext != " ") {
    return positions;
  }

  // is not valid if before [from] posed another character
  let charBeforeFromPosition = text.charAt(position.from - 1);
  if (charBeforeFromPosition.length && charBeforeFromPosition != " ") {
    return positions;
  }

  positions.push(position);

  let rest = text.slice(to + 1, text.length);
  let restPositions: Position[] = [];

  if (rest.length) {
    lastLength = to + lastLength - 1;
    restPositions = findWordPosition(word, rest, lastLength);
  }

  return [...positions, ...restPositions];
}

function seperateChords(chordsLine: string) {
  /**
   * Separate chords in this line
   */
  let list: string[] = [];
  let sparatedBySpace = chordsLine
    .split(" ")
    .filter((item) => item != " " && item != "");

  // remove repetitiv chords
  for (let i = 0; i < sparatedBySpace.length; i++) {
    const chord = sparatedBySpace[i] as string;
    if (list.indexOf(chord) == -1) list.push(chord);
  }

  /**
   * Extract chord positions as a list
   */
  let positions: Position[] = [];
  list.forEach((chordTitle) => {
    positions = positions.concat(findWordPosition(chordTitle, chordsLine));
  });

  positions.sort((a, b) => a.from - b.from);

  return positions;
}

function injectSpace({
  before,
  current,
  index,
  newPositionListWithSpaces,
  totalPositions,
  lineLength,
}: {
  before: Position,
  current: Position,
  index: number,
  newPositionListWithSpaces: Position[],
  totalPositions: number,
  lineLength: number
}) {
  // Add start spaces
  if (index == 1 && before.from > 0) {
    newPositionListWithSpaces.push({
      from: 0,
      to: before.to - 1,
      word: generateSpace(0 - before.to), // Note: 0 - before.to is likely negative? v1 logic copy.
    });
  }

  newPositionListWithSpaces.push(before);

  let currentLengthDifference =
    current.word.length - (current.newWord || "").length;
  let beforeLengthDifference =
    before.word.length - (before.newWord || "").length;

  let totalSpace = current.from - (before.to + 1);

  if (index == totalPositions - 2) {
    totalSpace +=
      currentLengthDifference < 0
        ? currentLengthDifference * 2
        : currentLengthDifference;
  } else {
    totalSpace +=
      beforeLengthDifference < 0
        ? beforeLengthDifference * 2
        : beforeLengthDifference;
  }

  let spacePosition = {
    from: before.to + 1,
    to: current.from - 1,
    word: generateSpace(totalSpace > 0 ? totalSpace : 1),
  };

  newPositionListWithSpaces.push(spacePosition);

  if (index == totalPositions - 1) newPositionListWithSpaces.push(current);

  // Add end spaces
  if (totalPositions - 1 == index && current.to < lineLength) {
    newPositionListWithSpaces.push({
      from: current.to + 1,
      to: lineLength,
      word: generateSpace(lineLength - current.to),
    });
  }
}

function injectSpaceBetweenChords(positions: Position[] = [], lineLength = 0) {
  /**
   * Generate spaces between chords
   * and inject both chords and spaces into a new list
   */
  let newPositionListWithSpaces: Position[] = [];

  if (positions.length == 1) {
    let position = positions[0]!;

    // after space
    if (position.to < lineLength) {
      injectSpace({
        before: position,
        current: {
          from: lineLength,
          to: lineLength,
          word: "",
          newWord: "",
        },
        index: 0,
        newPositionListWithSpaces: newPositionListWithSpaces,
        totalPositions: positions.length,
        lineLength: lineLength,
      });
    }
  } else if (positions.length) {
    positions.reduce((before, current, index) => {
      injectSpace({
        before: before,
        current: current,
        index: index,
        newPositionListWithSpaces: newPositionListWithSpaces,
        totalPositions: positions.length,
        lineLength: lineLength,
      });

      return current;
    });
  }

  return newPositionListWithSpaces;
}

/**
 * Composable for table-based chord transposition
 * 
 * Logic Migrated from v1 (admin_panel/components/materials/Transpose.vue)
 * 
 * CORE PRINCIPLE: 
 * This logic relies on a set of 12 static transposition tables fetched from the backend.
 * Each song has an "original table" based on its starting key. Transposition works by
 * shifting to a different table index (0-11) and mapping chords from the original
 * table's rows/columns to the new table's rows/columns.
 * 
 * UNLIKE standard semitone transposition, this preserves the exact harmonic function 
 * and specific chord voicings defined in the database tables.
 * 
 * V1 LOGIC REPLICATION:
 * - Recursive position finding (`findWordPosition`) matches v1 exactly.
 * - Spacing injection (`injectSpace`, `injectSpaceBetweenChords`) matches v1 exactly.
 * - Table/Row/Column mapping matches v1 exactly.
 * 
 * IMPORTANT: 
 * All UI controls for transposition (steppers, carousels) MUST use `dir="ltr"`
 * to ensure the sequence (Minus -> Value -> Plus) and array order (C -> C# -> D...) 
 * remains intuitive and consistent regardless of the application's RTL/LTR state.
 */
export const useTranspose = () => {
  const store = useChordTablesStore()

  // Computed to check if tables are ready
  const isReady = computed(() => store.isLoaded && store.tables.length > 0)

  // v1: getChordOffset
  const getChordTableIndex = (chord: SongChord): number => {
    let offset = -1;
    store.tables.forEach((table, i) => {
      if (chord.table == table._id) offset = i;
    });
    return offset;
  }

  // v1: getKeySignatureOffset / findMainTable
  const getOriginalTableIndex = (chords: SongChords | undefined): number => {
    if (!chords?.list || chords.list.length === 0) return 0
    const firstChord = chords.list[0]!
    return getChordTableIndex(firstChord)
  }

  // v1: changeVocalNote
  const transposeVocalNote = (
    vocalNote: VocalNote | undefined,
    newTableIndex: number
  ): VocalNote | undefined => {
    if (!vocalNote || vocalNote.index === undefined) return vocalNote
    
    const table = store.tables[newTableIndex]
    if (!table || !table.vocalRows) return vocalNote

    return {
      table: table._id,
      index: vocalNote.index,
      note: table.vocalRows[vocalNote.index] || vocalNote.note // Fallback if index out of bounds?
    }
  }

  // v1: changeChordOffset
  const transposeChordList = (
    originalChords: SongChord[],
    newTableIndex: number
  ): SongChord[] => {
    const table = store.tables[newTableIndex]
    if (!table) return originalChords

    const tempChords = JSON.parse(JSON.stringify(originalChords)) as SongChord[]

    originalChords.forEach((chord, chordIndex) => {
      let rowIndex = chord.rowIndex;
      let column = chord.column;

      let tableChords: any[] = []; // Use any[] because rows and chromaticRows have different structures

      if (chord.type == "regular") tableChords = table.rows;
      else if (chord.type == "chromatic") tableChords = table.chromaticRows;

      if (!tableChords || rowIndex === undefined || !column || !tableChords[rowIndex]) {
         return; // Skip if invalid
      }
      
      const targetChord = tableChords[rowIndex][column];

      if (!targetChord) return;

      let newChord = {
        ...chord,
        title: targetChord.title,
        table: table._id,
        chord: targetChord._id,
        keySignature: table.keySignature._id,
      };

      tempChords[chordIndex] = newChord;
    });

    return tempChords;
  }

  // v1: putTempChordsIntoTempSections
  const transposeSectionLines = (
    sections: SongSection[],
    originalChords: SongChord[],
    transposedChords: SongChord[]
  ): SongSection[] => {
    // Clone sections
    const tempSections = JSON.parse(JSON.stringify(sections)) as SongSection[];

    tempSections.forEach((section, sectionIndex) => {
      if (!section.lines) return;

      for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
        const line = section.lines[lineIndex];
        if (!line?.chords) continue;

        // seperate chords and spaces
        let speratedChordsFromLine = seperateChords(line.chords);

        /**
         * Put transposed chord as a new property
         * for each member of the list
         */
        for (
          let chordIndex = 0;
          chordIndex < originalChords.length;
          chordIndex++
        ) {
          const chord = originalChords[chordIndex];
          const transposedChord = transposedChords[chordIndex];

          if (!chord?.title || !transposedChord?.title) continue;

          speratedChordsFromLine.forEach((position) => {
            if (position.word == chord.title)
              position.newWord = transposedChord.title;
          });
        }

        let normalizedList = injectSpaceBetweenChords(
          speratedChordsFromLine,
          line.chords.length
        );

        /**
         * Join normalized array into one single line
         */
        let transposeChordLine = "";
        normalizedList.forEach((position) => {
          if (position.newWord) transposeChordLine += position.newWord;
          else transposeChordLine += position.word;
        });

        if (transposeChordLine.length) {
          if (tempSections[sectionIndex]?.lines?.[lineIndex]) {
            tempSections[sectionIndex].lines![lineIndex].chords = transposeChordLine;
          }
        }
      }
    });

    return tempSections;
  }

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
        sections: JSON.parse(JSON.stringify(sections)),
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

  // Helper for UI
  const getKeyDisplayName = (
    tableIndex: number,
    keyQuality: 'major' | 'minor' | undefined = 'major'
  ): string => {
    // v1 doesn't have this exact function but uses table.keySignature[chords.keySignature]
    // In v2 we have getKeySignatureName in store.
    return store.getKeySignatureName(tableIndex, keyQuality || 'major')
  }
  
  // Need to export transposeChord for legacy/compatibility if used elsewhere?
  // v2 useTranspose had it.
  const transposeChord = (chord: SongChord, newTableIndex: number): SongChord => {
     // Implement single chord transpose reusing logic
     const list = [chord];
     const transposed = transposeChordList(list, newTableIndex);
     return transposed[0]!;
  }
  
  // Legacy fallback
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const transposeNoteBySemitone = (note: string, semitones: number): string => {
    const index = NOTES.indexOf(note)
    if (index === -1) return note
    let newIndex = (index + semitones) % 12
    if (newIndex < 0) newIndex += 12
    return NOTES[newIndex]!;
  }

  return {
    isReady,
    tables: computed(() => store.tables),
    keySignatures: computed(() => store.keySignatures),
    getOriginalTableIndex,
    getChordTableIndex,
    transposeChord,
    transposeChordList,
    transposeVocalNote,
    transposeSectionLines,
    transposeAll,
    getKeyDisplayName,
    transposeNoteBySemitone,
    fetchTables: store.fetchTables,
  }
}
