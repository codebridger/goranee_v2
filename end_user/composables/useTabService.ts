import { dataProvider, fileProvider } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '~/types/database.type'
import type { SongWithPopulatedRefs, Artist, Song } from '~/types/song.type'

// Mock constants for fallbacks (only for filling gaps in real data)
const MOCK_RHYTHMS = ['Slow 6/8', 'Kurdish 7/8', '4/4 Pop', 'Georgina', 'Waz Waz', 'Garyan']
const MOCK_KEYS = ['Cm', 'Am', 'Gm', 'Dm', 'Em', 'Fm']
const MOCK_IMAGES = ['purple', 'pink', 'blue', 'orange', 'emerald', 'red']

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T

/**
 * Composable for tab/song related services
 */
export const useTabService = () => {
  /**
   * Fetch songs with limited fields optimized for SongCard
   */
  const fetchSongs = async (
    limit: number = 8,
    skip: number = 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projection: any = {}
  ): Promise<SongWithPopulatedRefs[]> => {
    try {
      const defaultProjection = {
        title: 1,
        rhythm: 1,
        image: 1,
        artists: 1,
        'chords.keySignature': 1,
        'chords.list.title': 1,
      }

      const songs = await dataProvider.find<Song>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        query: {},
        options: {
          limit,
          skip,
          // @ts-expect-error: populate is not in the strict type definition but supported by backend
          populate: ['artists'],
          projection: { ...defaultProjection, ...projection },
        },
      })

      return _processSongs(songs || [])
    } catch (error) {
      console.error('Failed to fetch songs:', error)
      return []
    }
  }

  /**
   * Fetch songs with pagination
   * Returns the modular-rest pagination controller
   */
  const fetchSongwithPagination = (options: {limit: number , query: any}) => {
    const { limit=12, query={} } = options;
    
    return dataProvider.list<Song>(
      {
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        query: query,
        options: {
          // @ts-expect-error: populate is not in the strict type definition but supported by backend
          populate: ['artists'],
          projection: {
            title: 1,
            rhythm: 1,
            image: 1,
            artists: 1,
            'chords.keySignature': 1,
            'chords.list.title': 1,
          },
        },
      },
      { limit }
    )
  }

  const fetchFeaturedArtists = async (): Promise<Artist[]> => {
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
  }

  const getImageUrl = (file: any) => {
    return fileProvider.getFileLink(file)
  }

  // Helper to process songs with mock data
  const _processSongs = (songs: Song[]): SongWithPopulatedRefs[] => {
    if (!songs || songs.length === 0) {
      return []
    }

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
  }

  return {
    fetchSongs,
    fetchSongwithPagination,
    fetchFeaturedArtists,
    getImageUrl,
  }
}


