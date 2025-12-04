# Chord Transposition & Rendering System Analysis

> **Source Project**: `chord_library/website/`  
> **Analysis Date**: December 4, 2025  
> **Purpose**: Deep-dive into how chords are transposed and rendered over song lyrics

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [Component Hierarchy](#component-hierarchy)
4. [Transposition Logic](#transposition-logic)
5. [Chord Rendering Over Lyrics](#chord-rendering-over-lyrics)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Key Algorithms](#key-algorithms)
8. [Implementation Notes](#implementation-notes)

---

## Architecture Overview

The chord library uses a **hierarchical component architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tab Page (_id.vue)                          │
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │   Transpose.vue     │  │          Tabview.vue             │ │
│  │   (Key Selection)   │  │      (Section Renderer)          │ │
│  │                     │  │                                  │ │
│  │  [C] [C#] [D] ...   │  │  ┌────────────────────────────┐ │ │
│  │                     │  │  │ TabviewSectionLines.vue    │ │ │
│  │                     │  │  │ (Chord + Lyric Lines)      │ │ │
│  └─────────────────────┘  │  └────────────────────────────┘ │ │
│                           └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Files

| Component               | Path                                                                 | Responsibility                                |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| **Tab Page**            | `chord_library/website/pages/tab/_id.vue`                            | Main page, data fetching, state orchestration |
| **Transpose**           | `chord_library/website/components/materials/Transpose.vue`           | Key selection UI, transposition calculations  |
| **Tabview**             | `chord_library/website/components/materials/Tabview.vue`             | Section iteration and layout                  |
| **TabviewSectionLines** | `chord_library/website/components/materials/TabviewSectionLines.vue` | Individual line rendering (chords + lyrics)   |
| **Chords Store**        | `chord_library/website/store/chords.js`                              | Vuex store for chord tables data              |

---

## Data Models

### Song Object (from API)

```typescript
interface Song {
  _id: string;
  title: string;
  title_seo?: string;
  rhythm: string;
  artists: Artist[];
  genres: Genre[];
  sections: Section[];
  chords: ChordConfig;
}
```

### Section Structure

```typescript
interface Section {
  title: string;           // e.g., "Verse 1", "Chorus"
  direction: 'ltr' | 'rtl'; // Text direction (for RTL languages like Persian)
  lines: Line[];
}

interface Line {
  chords: string;  // Space-positioned chord string, e.g., "Am      G       C"
  text: string;    // Lyrics line, e.g., "این یک متن فارسی است"
}
```

### Chord Configuration

```typescript
interface ChordConfig {
  keySignature: string;  // Reference to the key signature (e.g., "Am")
  list: Chord[];         // All chords used in the song
  vocalNote: VocalNote;  // The vocal range starting note
}

interface Chord {
  title: string;         // Display name, e.g., "Am", "G7", "Cmaj7"
  table: string;         // Reference to the transposition table ID
  chord: string;         // Specific chord variant ID
  keySignature: string;  // Key signature ID
  rowIndex: number;      // Position in the chord table (row)
  column: number;        // Position in the chord table (column)
  type: 'regular' | 'chromatic';  // Chord type
}

interface VocalNote {
  table: string;   // Reference to transposition table
  index: number;   // Row index in vocalRows
  note: string;    // Display note, e.g., "A3", "C4"
}
```

### Transposition Table Structure

```typescript
interface TranspositionTable {
  _id: string;
  keySignature: KeySignature;  // Contains name like "C", "C#", "D", etc.
  type: ChordType;
  rows: ChordRow[];            // Regular chord rows (major, minor variants)
  chromaticRows: ChordRow[];   // Chromatic chord variations
  vocalRows: string[];         // Vocal notes for this key
}

interface ChordRow {
  major: ChordVariant;
  naturalMinor: ChordVariant;
  harmonicMinor: ChordVariant;
  melodicMinor: ChordVariant;
}
```

---

## Component Hierarchy

### 1. Tab Page (`pages/tab/_id.vue`)

**Location**: `chord_library/website/pages/tab/_id.vue`

**Responsibilities**:
- Fetches song data via `asyncData()` from the API
- Manages transposed sections state (`transposedSections`)
- Manages vocal note state (`vocalNote`)
- Orchestrates communication between Transpose and Tabview components
- Handles SEO metadata generation

**Key Data Flow**:
```
API → asyncData() → song object
                  ↓
         ┌───────┴───────┐
         ↓               ↓
    Transpose.vue   Tabview.vue
         │               ↑
         └───────────────┘
         (transposed event)
```

**Critical Code Section**:
```javascript
// pages/tab/_id.vue - Lines 107-112
methods: {
  onReceivedTranspose({ sections, vocalNote }) {
    this.transposedSections = sections;
    this.componentKey = new Date().getUTCMilliseconds();  // Force re-render
    this.vocalNote = vocalNote;
  },
}
```

---

### 2. Transpose Component (`Transpose.vue`)

**Location**: `chord_library/website/components/materials/Transpose.vue`

**Responsibilities**:
- Renders clickable key signature buttons (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- Calculates chord transposition when user selects a different key
- Maintains temporary state for transposed chords and sections
- Emits transposed data to parent component

**Props**:
```javascript
props: {
  sections: { type: Array, required: true },  // Original song sections
  chords: { type: Object, required: true },   // {keySignature, list, vocalNote}
}
```

**Core State**:
```javascript
data() {
  return {
    currentTableIndex: null,    // Currently selected key (0-11)
    tempSections: [],           // Working copy of sections
    tempChords: {               // Working copy of chords
      keySignature: "",
      list: [],
      vocalNote: {},
    },
  };
}
```

---

### 3. Tabview Component (`Tabview.vue`)

**Location**: `chord_library/website/components/materials/Tabview.vue`

**Responsibilities**:
- Iterates through song sections
- Renders section titles with proper text direction
- Delegates line rendering to TabviewSectionLines

**Template Structure**:
```html
<div class="tab-content" v-if="sections">
  <div v-for="(section, i) in sections" :key="i" class="mb-4 section">
    <h3 class="my-2" :dir="section.direction">{{ section.title }}</h3>
    <tabview-section-lines
      :lines="section.lines"
      :direction="section.direction"
    />
  </div>
</div>
```

---

### 4. TabviewSectionLines Component (`TabviewSectionLines.vue`)

**Location**: `chord_library/website/components/materials/TabviewSectionLines.vue`

**Responsibilities**:
- Renders individual chord/lyric line pairs
- Handles text alignment based on direction (RTL/LTR)
- Uses `whitespace-pre-wrap` to preserve chord spacing

**Critical Rendering Logic**:
```html
<div class="lines whitespace-pre-wrap">
  <p v-for="(line, i) in lines" :key="i" :style="{'text-align':align}">
    <span class="chord" dir="ltr">{{ line.chords }}</span>
    <br />
    <span :dir="direction">{{ line.text }}</span>
  </p>
</div>
```

**Key Insight**: The chord line uses `dir="ltr"` (left-to-right) regardless of the lyric direction. This ensures chords are always rendered in the standard Western musical notation order.

---

## Transposition Logic

### Overview

Transposition uses a **table-based lookup system** where each key signature (C, C#, D, etc.) has a corresponding table containing all chord variants. When the user selects a new key, the system:

1. Finds the table index for the new key
2. Iterates through all chords in the song
3. Looks up the equivalent chord in the new key's table using `rowIndex` and `column`
4. Replaces chord titles in the section lines while preserving spacing

### Step-by-Step Transposition Process

#### Step 1: Initialize with Original Key

When the component mounts, it determines the original key:

```javascript
// Transpose.vue - Lines 155-163
getKeySignatureOffset() {
  let firstChord = this.chords.list[0];
  return this.getChordOffset(firstChord);  // Returns table index (0-11)
}

findMainTable({ keySignature, list }) {
  if (!keySignature || !list) return;
  this.currentTableIndex = this.getKeySignatureOffset();
}
```

#### Step 2: User Selects New Key

When `currentTableIndex` changes (via click), the watcher triggers:

```javascript
// Transpose.vue - Lines 120-136
watch: {
  currentTableIndex(index, old) {
    if (old == null) return;  // Skip initial load

    this.changeChordOffset(index);      // 1. Transpose chords
    this.changeVocalNote(index);        // 2. Update vocal note
    this.putTempChordsIntoTempSections(); // 3. Apply to sections
    
    // 4. Emit to parent
    this.$emit("transposed", {
      sections: this.tempSections,
      vocalNote: this.tempChords.vocalNote,
    });
  },
}
```

#### Step 3: Chord Offset Calculation

The core transposition algorithm:

```javascript
// Transpose.vue - Lines 189-221
changeChordOffset(newOffset) {
  this.tempChords = _.cloneDeep(this.chords);  // Deep copy original

  this.chords.list.forEach((chord, chordIndex) => {
    // Get the new key's table
    let table = this.tables[newOffset];
    let rowIndex = chord.rowIndex;
    let column = chord.column;

    // Select correct chord set based on type
    let tableChords = [];
    if (chord.type == "regular") tableChords = table.rows;
    else if (chord.type == "chromatic") tableChords = table.chromaticRows;

    // Create new chord with transposed title
    let newChord = {
      ...chord,
      title: tableChords[rowIndex][column].title,  // New chord name
      table: table._id,
      chord: tableChords[rowIndex][column]._id,
      keySignature: table.keySignature._id,
    };

    this.tempChords.list[chordIndex] = newChord;
  });
}
```

**Example Transposition**:
```
Original Key: Am (table index 9)
Chord: Am (rowIndex: 0, column: "naturalMinor")
Target Key: Cm (table index 0)
Result: Cm (same rowIndex, same column, different table)
```

#### Step 4: Apply to Section Lines

The system must update chord strings in sections while **preserving spacing**:

```javascript
// Transpose.vue - Lines 380-426
putTempChordsIntoTempSections() {
  this.tempSections = _.cloneDeep(this.sections);

  this.sections.forEach((section, sectionIndex) => {
    for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
      const line = section.lines[lineIndex];

      // 1. Parse chord positions from the line
      let speratedChordsFromLine = this.seperateChords(line.chords);

      // 2. Map original chords to transposed chords
      for (let chordIndex = 0; chordIndex < this.chords.list.length; chordIndex++) {
        const chord = this.chords.list[chordIndex];

        speratedChordsFromLine.forEach((position) => {
          if (position.word == chord.title)
            position.newWord = this.tempChords.list[chordIndex].title;
        });
      }

      // 3. Recalculate spacing and rebuild line
      let normalizedList = this.injectSpaceBetweenChords(
        speratedChordsFromLine,
        line.chords.length
      );

      // 4. Join back into string
      let transposeChordLine = "";
      normalizedList.forEach((position) => {
        if (position.newWord) transposeChordLine += position.newWord;
        else transposeChordLine += position.word;
      });

      if (transposeChordLine.length) {
        this.tempSections[sectionIndex].lines[lineIndex].chords = transposeChordLine;
      }
    }
  });
}
```

---

## Chord Rendering Over Lyrics

### The Core Challenge

Chords must appear **directly above** the syllable or word they correspond to. This is achieved through:

1. **Fixed-width font** (`font-family: dana`) for consistent character widths
2. **Pre-formatted whitespace** (`whitespace-pre-wrap`) to preserve spacing
3. **Parallel string alignment** - chord line and lyric line have matching positions

### Visual Representation

```
Chord Line:  "Am      G       C       F"
             ↓       ↓       ↓       ↓
Lyric Line:  "این یک متن فارسی است که"
```

### CSS Implementation

```css
/* TabviewSectionLines.vue - Lines 25-32 */
.lines {
  font-family: dana;  /* Fixed-width Persian-compatible font */
}

.chord {
  color: red;  /* Visual distinction for chords */
}
```

### HTML Structure

```html
<p v-for="(line, i) in lines" :key="i" :style="{'text-align':align}">
  <span class="chord" dir="ltr">{{ line.chords }}</span>  <!-- Always LTR -->
  <br />
  <span :dir="direction">{{ line.text }}</span>           <!-- Follows content direction -->
</p>
```

### RTL Handling

For Persian/Arabic text:
- **Chords**: Always `dir="ltr"` (Western notation standard)
- **Lyrics**: Dynamic `dir` based on `section.direction`
- **Alignment**: `text-align: right` for RTL, `text-align: left` for LTR

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    API Call     ┌──────────────────┐                       │
│  │   API   │ ───────────────→│  Tab Page        │                       │
│  │ Server  │                 │  (_id.vue)       │                       │
│  └─────────┘                 └────────┬─────────┘                       │
│                                       │                                  │
│                         ┌─────────────┼─────────────┐                   │
│                         ↓             ↓             ↓                   │
│              ┌──────────────┐  ┌────────────┐  ┌────────────┐          │
│              │ song.chords  │  │song.sections│  │ vocalNote  │          │
│              └──────┬───────┘  └─────┬──────┘  └─────┬──────┘          │
│                     │                │               │                   │
│                     ↓                ↓               │                   │
│              ┌───────────────────────────────┐       │                   │
│              │      Transpose.vue            │       │                   │
│              │                               │       │                   │
│              │  ┌─────────────────────────┐ │       │                   │
│              │  │   Vuex: chords/tables   │ │       │                   │
│              │  │   (12 transposition     │ │       │                   │
│              │  │    tables)              │ │       │                   │
│              │  └─────────────────────────┘ │       │                   │
│              │                               │       │                   │
│              │  User clicks key → transpose │       │                   │
│              └───────────────┬───────────────┘       │                   │
│                              │                       │                   │
│                              ↓                       ↓                   │
│              ┌───────────────────────────────────────────────┐          │
│              │            $emit('transposed')                │          │
│              │  { sections: [...], vocalNote: {...} }        │          │
│              └───────────────────────┬───────────────────────┘          │
│                                      │                                   │
│                                      ↓                                   │
│              ┌───────────────────────────────────────────────┐          │
│              │          Tab Page: State Update               │          │
│              │  transposedSections = sections                │          │
│              │  componentKey = timestamp (force re-render)   │          │
│              └───────────────────────┬───────────────────────┘          │
│                                      │                                   │
│                                      ↓                                   │
│              ┌───────────────────────────────────────────────┐          │
│              │              Tabview.vue                      │          │
│              │         (receives transposedSections)         │          │
│              └───────────────────────┬───────────────────────┘          │
│                                      │                                   │
│                                      ↓                                   │
│              ┌───────────────────────────────────────────────┐          │
│              │         TabviewSectionLines.vue               │          │
│              │      (renders chord + lyric pairs)            │          │
│              └───────────────────────────────────────────────┘          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Key Algorithms

### 1. Find Word Position Algorithm

**Purpose**: Locate chord positions within a space-delimited string

**Location**: `Transpose.vue` - Lines 31-76

```javascript
function findWordPosition(word, text, lastLength = 0) {
  let positions = [];
  let from = text.indexOf(word);
  
  if (from == -1) return positions;

  let to = from + word.length - 1;
  let position = {
    from: from + (lastLength > 0 ? lastLength : 0),
    to: to + (lastLength > 0 ? lastLength : 0),
    word: word,
  };

  // Validation: ensure word boundaries (spaces before/after)
  let charAfterToPositiontext = text.charAt(position.to + 1);
  if (charAfterToPositiontext.length && charAfterToPositiontext != " ") {
    return positions;  // Invalid - not a complete word
  }

  let charBeforeFromPosition = text.charAt(position.from - 1);
  if (charBeforeFromPosition.length && charBeforeFromPosition != " ") {
    return positions;  // Invalid - not a complete word
  }

  positions.push(position);

  // Recursive call for remaining text
  let rest = text.slice(to + 1, text.length);
  if (rest.length) {
    lastLength = to + lastLength - 1;
    restPositions = findWordPosition(word, rest, lastLength);
  }

  return [...positions, ...restPositions];
}
```

**Example**:
```
Input:  word = "Am", text = "Am      G       Am"
Output: [
  { from: 0, to: 1, word: "Am" },
  { from: 16, to: 17, word: "Am" }
]
```

### 2. Space Injection Algorithm

**Purpose**: Maintain proper spacing when chord names change length (e.g., "C" → "C#m")

**Location**: `Transpose.vue` - Lines 251-307

```javascript
injectSpace({
  before,           // Previous chord position
  current,          // Current chord position
  index,            // Position index
  newPositionListWithSpaces,
  totalPositions,
  lineLength,
}) {
  // Calculate length difference
  let currentLengthDifference = current.word.length - (current.newWord || "").length;
  let beforeLengthDifference = before.word.length - (before.newWord || "").length;

  // Calculate total space needed
  let totalSpace = current.from - (before.to + 1);

  // Adjust for length changes
  if (index == totalPositions - 2) {
    totalSpace += currentLengthDifference < 0
      ? currentLengthDifference * 2
      : currentLengthDifference;
  } else {
    totalSpace += beforeLengthDifference < 0
      ? beforeLengthDifference * 2
      : beforeLengthDifference;
  }

  // Create space position object
  let spacePosition = {
    from: before.to + 1,
    to: current.from - 1,
    word: generateSpace(totalSpace > 0 ? totalSpace : 1),
  };

  newPositionListWithSpaces.push(spacePosition);
}
```

**Example**:
```
Original: "Am      G"      (Am at 0-1, G at 8)
Transpose: Am → C#m

Before adjustment: "C#m      G"  (spacing broken)
After adjustment:  "C#m     G"   (spacing recalculated)
```

### 3. Chord Separation Algorithm

**Purpose**: Parse a chord line into individual chord positions

**Location**: `Transpose.vue` - Lines 223-249

```javascript
seperateChords(chordsLine) {
  // Split by space, remove empty entries
  let list = [];
  let sparatedBySpace = chordsLine
    .split(" ")
    .filter((item) => item != " " && item != "");

  // Remove duplicate chords (for unique matching)
  for (let i = 0; i < sparatedBySpace.length; i++) {
    const chord = sparatedBySpace[i];
    if (list.indexOf(chord) == -1) list.push(chord);
  }

  // Find positions for each unique chord
  let positions = [];
  list.forEach((chordTitle) => {
    positions = positions.concat(findWordPosition(chordTitle, chordsLine));
  });

  // Sort by position (left to right)
  positions.sort((a, b) => a.from - b.from);

  return positions;
}
```

---

## Implementation Notes

### Strengths

1. **Modular Architecture**: Clear separation between transposition logic and rendering
2. **Table-Based Transposition**: Accurate music theory-based transposition using lookup tables
3. **RTL Support**: Proper handling of Persian/Arabic text with Western chord notation
4. **Spacing Preservation**: Sophisticated algorithm to maintain chord-to-lyric alignment

### Potential Improvements

1. **Performance**: Deep cloning on every transpose could be optimized
2. **Chord Variety**: System assumes all chords exist in tables; edge cases may fail silently
3. **Responsive Design**: Fixed-width fonts may not scale well on mobile
4. **Accessibility**: No ARIA labels for chord selection buttons

### Data Dependencies

- **Vuex Store** (`chords.js`): Must load transposition tables before component mounts
- **API Schema**: Requires specific population of chord relationships:
  ```javascript
  populates: [
    'keySignature',
    'type',
    'rows.major',
    'rows.naturalMinor',
    'rows.harmonicMinor',
    'rows.melodicMinor',
    'chromaticRows.one',
    'chromaticRows.two',
    'chromaticRows.three',
    'chromaticRows.four',
  ]
  ```

---

## Summary

The chord transposition and rendering system is a **table-driven music theory implementation** that:

1. **Stores** chords with positional metadata (table, row, column)
2. **Transposes** by looking up equivalent positions in different key tables
3. **Renders** by preserving whitespace alignment between chord and lyric lines
4. **Adapts** to RTL languages while maintaining LTR chord notation

The system's core insight is treating chord transposition as a **2D lookup problem** where:
- **X-axis** = Key signature (C, C#, D, ... B)
- **Y-axis** = Chord function (I, ii, iii, IV, V, vi, vii°)

This allows O(1) transposition for any chord to any key, making real-time key changes responsive and accurate.

