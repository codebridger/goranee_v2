import songCollections from './db_song';
import chordCollections from './db_chord';

module.exports = [
    ...songCollections,
    ...chordCollections
]

