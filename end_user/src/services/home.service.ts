import { dataProvider } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '../types/database.type'
import type { SongWithPopulatedRefs, Artist, Song } from '../types/song.type'

// Mock constants for fallbacks (only for filling gaps in real data)
const MOCK_RHYTHMS = ['Slow 6/8', 'Kurdish 7/8', '4/4 Pop', 'Georgina', 'Waz Waz', 'Garyan']
const MOCK_KEYS = ['Cm', 'Am', 'Gm', 'Dm', 'Em', 'Fm']
const MOCK_IMAGES = ['purple', 'pink', 'blue', 'orange', 'emerald', 'red']

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T

export const homeService = {
  async getTrendingSongs(): Promise<SongWithPopulatedRefs[]> {
    try {
      const songs = await dataProvider.find<Song>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        query: {},
        options: {
          limit: 8,
          // @ts-expect-error: populate is not in the strict type definition but supported by backend
          populate: ['artists'],
        },
      })

      if (!songs || songs.length === 0) {
        return []
      }

      // Map over results to add mock data for missing fields
      return songs.map((song) => {
        const songWithRefs = song as unknown as SongWithPopulatedRefs

        // Mock rhythm if missing
        if (!songWithRefs.rhythm) {
          songWithRefs.rhythm = getRandomElement(MOCK_RHYTHMS)
        }

        // Ensure chords object exists and mock key if missing
        if (!songWithRefs.chords) {
          songWithRefs.chords = { list: [] }
        }
        if (!songWithRefs.chords.keySignature) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(songWithRefs.chords as any).keySignature = getRandomElement(MOCK_KEYS)
        }

        // Mock image gradient/color if no image file
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(songWithRefs as any)._mockColor = getRandomElement(MOCK_IMAGES)

        return songWithRefs
      })
    } catch (error) {
      console.error('Failed to fetch trending songs:', error)
      return []
    }
  },

  async getFeaturedArtists(): Promise<Artist[]> {
    try {
      const artists = await dataProvider.find<Artist>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.ARTIST,
        query: {},
        options: {
          limit: 10,
        },
      })

      if (!artists || artists.length === 0) {
        return []
      }

      return artists.map((artist) => {
        // Mock song count if missing
        if (artist.chords === undefined || artist.chords === null) {
          artist.chords = Math.floor(Math.random() * 50) + 1
        }

        // Mock color for gradient border
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(artist as any)._mockColor = getRandomElement([
          'from-pink-500 to-rose-500',
          'from-purple-500 to-indigo-500',
          'from-blue-500 to-cyan-500',
          'from-orange-500 to-red-500',
          'from-emerald-500 to-teal-500',
        ])

        return artist
      })
    } catch (error) {
      console.error('Failed to fetch featured artists:', error)
      return []
    }
  },
}
