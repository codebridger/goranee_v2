import { dataProvider, fileProvider } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '~/types/database.type'
import type { SongWithPopulatedRefs, Artist, Song, Genre } from '~/types/song.type'

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
    projection: any = {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any = {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort: any = {}
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
        query: query,
        options: {
          limit,
          skip,
          // @ts-expect-error: populate is not in the strict type definition but supported by backend
          populate: ['artists'],
          projection: { ...defaultProjection, ...projection },
          sort: sort
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

  const fetchGenres = async (): Promise<Genre[]> => {
    try {
      const genres = await dataProvider.find<Genre>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.GENRE,
        query: {},
        options: {
          limit: 50,
          sort: { title: 1 },
        },
      })
      return genres || []
    } catch (error) {
      console.error('Failed to fetch genres:', error)
      return []
    }
  }

  const getImageUrl = (file: any) => {
    return fileProvider.getFileLink(file)
  }

  // Helper to process songs with mock data
  const _processSongs = (songs: Song[] | SongWithPopulatedRefs[]): SongWithPopulatedRefs[] => {
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

  const searchSongs = async (
    query: string,
    limit: number = 5
  ): Promise<SongWithPopulatedRefs[]> => {
    try {
      if (!query || query.trim().length === 0) return []

      const songs = await dataProvider.find<Song>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        populates: ['artists'],
        query: {
          title: { $regex: query, $options: 'i' }
        },
        options: {
          limit,
          select: {
            title: 1,
            rhythm: 1,
            image: 1,
            artists: 1,
            'chords.keySignature': 1
          },
        },
      })

      return _processSongs(songs || [])
    } catch (error) {
      console.error('Failed to search songs:', error)
      return []
    }
  }

  /**
   * Advanced search with filters using pagination
   */
  const searchSongsAdvanced = (filters: {
    query?: string
    genre?: string // genre ID
    key?: 'major' | 'minor'
    rhythm?: string
    sort?: 'newest' | 'oldest' | 'a-z' | 'z-a'
    limit?: number
    page?: number,
  }, onFetched: ((docs: SongWithPopulatedRefs[]) => void)) => {
    const {
      query,
      genre,
      key,
      rhythm,
      sort = 'newest',
      limit = 12,
      page = 1,
    } = filters

    // Build query object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryObj: any = {}

    // Text search - search in title and artist names
    if (query && query.trim().length > 0) {
      queryObj.$or = [
        { title: { $regex: query, $options: 'i' } },
      ]
    }

    // Genre filter - genres is an array, so we check if it contains the genre ID
    if (genre) {
      queryObj.genres = { $in: [genre] }
    }

    // Key signature filter
    if (key) {
      queryObj['chords.keySignature'] = key
    }

    // Rhythm filter
    if (rhythm && rhythm.trim().length > 0) {
      queryObj.rhythm = { $regex: rhythm, $options: 'i' }
    }

    // Build sort object
    let sortObj: any = {}
    switch (sort) {
      case 'newest':
        sortObj = { _id: -1 }
        break
      case 'oldest':
        sortObj = { _id: 1 }
        break
      case 'a-z':
        sortObj = { title: 1 }
        break
      case 'z-a':
        sortObj = { title: -1 }
        break
      default:
        sortObj = { _id: -1 }
    }

    return dataProvider.list<SongWithPopulatedRefs>(
      {
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        query: queryObj,
        populates: ['artists'],
        options: {
          select: {
            title: 1,
            rhythm: 1,
            image: 1,
            artists: 1,
            'chords.keySignature': 1,
            'chords.list.title': 1,
          },
          sort: sortObj,
        },
      },
      {
        limit,
        page,
        onFetched: (docs) => {
          docs = _processSongs(docs)
          onFetched(docs)
        },
      }
    )
  }

  /**
   * Fetch all artists with pagination and sorting
   * Returns the modular-rest pagination controller
   */
  const fetchAllArtists = (options: {
    limit?: number
    page?: number
    sort?: 'name-asc' | 'name-desc' | 'popularity-desc' | 'popularity-asc'
    search?: string
  } = {}, onFetched: ((docs: Artist[]) => void)) => {
    const {
      limit = 24,
      page = 1,
      sort = 'name-asc',
      search,
    } = options

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryObj: any = {}
    if (search && search.trim().length > 0) {
      queryObj.name = { $regex: search, $options: 'i' }
    }

    // Build sort object
    let sortObj: any = {}
    switch (sort) {
      case 'name-asc':
        sortObj = { name: 1 }
        break
      case 'name-desc':
        sortObj = { name: -1 }
        break
      case 'popularity-desc':
        sortObj = { chords: -1 }
        break
      case 'popularity-asc':
        sortObj = { chords: 1 }
        break
      default:
        sortObj = { name: 1 }
    }

    return dataProvider.list<Artist>(
      {
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.ARTIST,
        query: queryObj,
        options: {
          sort: sortObj,
        },
      },
      {
        limit,
        page,
        onFetched: (docs) => {
          const processedArtists = docs.map((artist) => {
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
          onFetched(processedArtists)
        },
      }
    )
  }

  const fetchArtist = async (id: string): Promise<Artist | null> => {
    try {
      const artists = await dataProvider.find<Artist>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.ARTIST,
        query: { _id: id },
        options: { limit: 1 },
      })

      const artist = artists && artists.length > 0 ? artists[0] : null

      if (artist) {
        // Mock color for gradient border
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(artist as any)._mockColor = getRandomElement([
          'from-pink-500 to-rose-500',
          'from-purple-500 to-indigo-500',
          'from-blue-500 to-cyan-500',
          'from-orange-500 to-red-500',
          'from-emerald-500 to-teal-500',
        ])

        return artist as Artist
      }

      return null
    } catch (error) {
      console.error('Failed to fetch artist:', error)
      return null
    }
  }

  const fetchSongsByArtist = async (artistId: string): Promise<SongWithPopulatedRefs[]> => {
    try {
      const songs = await dataProvider.find<SongWithPopulatedRefs>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        populates: ['artists'],
        query: {
          artists: artistId,
        },
        options: {
          select: {
            title: 1,
            rhythm: 1,
            image: 1,
            artists: 1,
            'chords.keySignature': 1,
            'chords.list.title': 1,
          },
        },
      })
      return _processSongs(songs || [])
    } catch (error) {
      console.error('Failed to fetch songs by artist:', error)
      return []
    }
  }

  const fetchSongById = async (id: string): Promise<SongWithPopulatedRefs | null> => {
    try {
      const song = await dataProvider.findOne<SongWithPopulatedRefs>({
        database: DATABASE_NAME,
        collection: COLLECTION_NAME.SONG,
        // @ts-expect-error: populate is not in the strict type definition but supported by backend
        populates: ['artists', 'genres'],
        query: { _id: id },
        options: {
          limit: 1,
        },
      })

      if (!song) {
        return null
      }

      const processedSongs = _processSongs([song])
      return processedSongs[0] || null
    } catch (error) {
      console.error('Failed to fetch song by id:', error)
      return null
    }
  }

  return {
    fetchSongs,
    fetchSongwithPagination,
    fetchFeaturedArtists,
    fetchGenres,
    searchSongs,
    searchSongsAdvanced,
    getImageUrl,
    fetchArtist,
    fetchSongsByArtist,
    fetchSongById,
    fetchAllArtists,
  }
}


