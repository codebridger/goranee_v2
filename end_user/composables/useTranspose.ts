
export const useTranspose = () => {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

  const getNoteIndex = (note: string) => {
    const sharpIndex = NOTES.indexOf(note)
    if (sharpIndex !== -1) return sharpIndex
    return NOTES_FLAT.indexOf(note)
  }

  const transposeNote = (note: string, semitones: number) => {
    const index = getNoteIndex(note)
    if (index === -1) return note // Not a recognized note

    let newIndex = (index + semitones) % 12
    if (newIndex < 0) newIndex += 12

    // Prefer sharps for now, could be smarter based on key signature
    return NOTES[newIndex]
  }

  // Regex to find chords in text (simplified)
  // Looks for [Chord] pattern as used in the backend/rendering or just common chord patterns if raw text
  // The specs mention "Real-time regex replacement of chord text." and "[Cm]" brackets.
  const transposeChord = (chord: string, semitones: number) => {
    // Split chord into root and quality (e.g., "Cm7" -> "C", "m7")
    const match = chord.match(/^([A-G][#b]?)(.*)$/)
    if (!match) return chord

    const root = match[1]
    const quality = match[2]
    const newRoot = transposeNote(root, semitones)

    return `${newRoot}${quality}`
  }

  return {
    transposeChord,
    transposeNote
  }
}

