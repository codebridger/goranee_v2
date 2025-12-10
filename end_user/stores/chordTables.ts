import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { dataProvider } from '@modular-rest/client'
import {
  CHORD_DATABASE_NAME,
  CHORD_COLLECTION_NAME,
  type TranspositionTable,
} from '~/types/database.type'

export const useChordTablesStore = defineStore('chordTables', () => {
  // State
  const tables = ref<TranspositionTable[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const tableCount = computed(() => tables.value.length)

  /**
   * Get table by index (0-11 for C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
   */
  const getTableByIndex = (index: number): TranspositionTable | undefined => {
    if (index < 0 || index >= tables.value.length) return undefined
    return tables.value[index]
  }

  /**
   * Get table index by ID
   */
  const getTableIndexById = (tableId: string): number => {
    return tables.value.findIndex((t) => t._id === tableId)
  }

  /**
   * Get key signature name by table index
   */
  const getKeySignatureName = (
    index: number,
    type: 'major' | 'minor' = 'major'
  ): string => {
    const table = getTableByIndex(index)
    if (!table) return '?'
    return table.keySignature[type] || '?'
  }

  /**
   * Get all key signature names for display
   */
  const keySignatures = computed(() => {
    return tables.value.map((table, index) => ({
      index,
      major: table.keySignature.major,
      minor: table.keySignature.minor,
      tableId: table._id,
    }))
  })

  /**
   * Fetch all 12 transposition tables from backend
   */
  const fetchTables = async (forceReload = false): Promise<void> => {
    // Skip if already loaded and not forcing reload
    if (isLoaded.value && !forceReload) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const fetchedTables = await dataProvider.find<TranspositionTable>({
        database: CHORD_DATABASE_NAME,
        collection: CHORD_COLLECTION_NAME.TABLE,
        query: {},
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
        ],
      })

      if (fetchedTables && fetchedTables.length > 0) {
        tables.value = fetchedTables
        isLoaded.value = true
      } else {
        error.value = 'No transposition tables found'
      }
    } catch (err) {
      console.error('Failed to fetch chord tables:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch chord tables'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    tables,
    isLoading,
    isLoaded,
    error,
    // Getters
    tableCount,
    keySignatures,
    // Methods
    getTableByIndex,
    getTableIndexById,
    getKeySignatureName,
    fetchTables,
  }
})

