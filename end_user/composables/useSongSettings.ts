import { ref, watch } from 'vue'

type GridColumns = 2 | 3 | 'auto'

export interface SongSettings {
  tableIndex: number
  fontSize: number
  scrollSpeed: number
  gridMode: boolean
  gridColumns: GridColumns
}

const STORAGE_KEY_PREFIX = 'goranee_song_settings_'

const defaultSettings: SongSettings = {
  tableIndex: 0,
  fontSize: 1.0,
  scrollSpeed: 0.5,
  gridMode: false,
  gridColumns: 2
}

export const useSongSettings = (songId: string) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${songId}`

  // Reactive settings
  const tableIndex = ref(defaultSettings.tableIndex)
  const fontSize = ref(defaultSettings.fontSize)
  const scrollSpeed = ref(defaultSettings.scrollSpeed)
  const gridMode = ref(defaultSettings.gridMode)
  const gridColumns = ref<GridColumns>(defaultSettings.gridColumns)

  // Load settings from localStorage
  const loadSettings = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SongSettings>
        
        if (typeof parsed.tableIndex === 'number') tableIndex.value = parsed.tableIndex
        if (typeof parsed.fontSize === 'number') fontSize.value = parsed.fontSize
        if (typeof parsed.scrollSpeed === 'number') scrollSpeed.value = parsed.scrollSpeed
        if (typeof parsed.gridMode === 'boolean') gridMode.value = parsed.gridMode
        if (parsed.gridColumns === 2 || parsed.gridColumns === 3 || parsed.gridColumns === 'auto') {
          gridColumns.value = parsed.gridColumns
        }
      }
    } catch (e) {
      console.warn('Failed to load song settings from localStorage:', e)
    }
  }

  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window === 'undefined') return

    try {
      const settings: SongSettings = {
        tableIndex: tableIndex.value,
        fontSize: fontSize.value,
        scrollSpeed: scrollSpeed.value,
        gridMode: gridMode.value,
        gridColumns: gridColumns.value
      }
      localStorage.setItem(storageKey, JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save song settings to localStorage:', e)
    }
  }

  // Watch for changes and auto-save
  watch([tableIndex, fontSize, scrollSpeed, gridMode, gridColumns], saveSettings, { deep: true })

  // Initialize by loading from storage
  loadSettings()

  return {
    tableIndex,
    fontSize,
    scrollSpeed,
    gridMode,
    gridColumns,
    loadSettings,
    saveSettings
  }
}

