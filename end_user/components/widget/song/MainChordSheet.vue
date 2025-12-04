<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, type ComponentPublicInstance } from 'vue'
import { useTranspose } from '~/composables/useTranspose'
import { useI18nRtl } from '~/composables/useI18nRtl'
import type { SongSection, SongChords } from '~/types/song.type'

type GridColumns = 2 | 3 | 'auto'

interface Props {
  sections: SongSection[]
  songChords?: SongChords
  currentTableIndex: number
  originalTableIndex: number
  fontSize: number // scale factor, e.g., 1 (base) -> 1.5
  gridMode?: boolean // enable grid layout for sections
  gridColumns?: GridColumns // max columns per row: 2, 3, or 'auto'
}

const props = defineProps<Props>()
const { transposeAll, isReady } = useTranspose()
const { isRtl } = useI18nRtl()
const dir = computed(() => isRtl.value ? 'rtl' : 'ltr')

const lineRefs = ref<(HTMLElement | null)[]>([])
const globalSectionWidth = ref<string>('fit-content')

// Process sections with table-based transposition
const processedSections = computed(() => {
  // If no transposition needed (same index) or tables not ready, return original
  if (props.currentTableIndex === props.originalTableIndex || !isReady.value) {
    return props.sections.map(section => ({
      ...section,
      lines: section.lines?.map(line => ({
        ...line,
        transposedChords: line.chords || ''
      }))
    }))
  }

  // Use table-based transposition with spacing algorithms
  const { sections: transposedSections } = transposeAll(
    props.sections,
    props.songChords,
    props.currentTableIndex
  )

  // Map to include transposedChords property for template
  return transposedSections.map(section => ({
    ...section,
    lines: section.lines?.map(line => ({
      ...line,
      transposedChords: line.chords || ''
    }))
  }))
})

const fontSizeStyle = computed(() => ({
  fontSize: `${props.fontSize}rem`
}))

const measureLongestLine = () => {
  nextTick(() => {
    // Clear previous refs
    lineRefs.value = []

    // Wait for DOM to update
    setTimeout(() => {
      let maxWidth = 0

      // Measure all line elements
      lineRefs.value.forEach((lineEl) => {
        if (lineEl) {
          const width = lineEl.scrollWidth
          if (width > maxWidth) {
            maxWidth = width
          }
        }
      })

      // Set global width if we found a max width
      if (maxWidth > 0) {
        globalSectionWidth.value = `${maxWidth}px`
      } else {
        globalSectionWidth.value = 'fit-content'
      }
    }, 100)
  })
}

const setLineRef = (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLElement && !lineRefs.value.includes(el)) {
    lineRefs.value.push(el)
  }
}

onMounted(() => {
  measureLongestLine()
})

// Re-measure when sections, table index, or fontSize changes
watch([() => props.sections, () => props.currentTableIndex, () => props.fontSize], () => {
  measureLongestLine()
}, { deep: true })

const sectionWidthStyle = computed(() => ({
  width: globalSectionWidth.value
}))

// Dynamic grid style based on font size and column setting
// Base minimum: 140px at fontSize 1.0, scales with font size
const gridStyle = computed(() => {
  if (!props.gridMode) return {}
  const baseMinWidth = 140 // px at fontSize 1.0
  const minWidth = Math.round(baseMinWidth * props.fontSize)
  const columns = props.gridColumns || 'auto'

  return {
    '--grid-min-width': `${minWidth}px`,
    '--grid-max-columns': columns === 'auto' ? 'none' : columns
  }
})

// Grid class based on column setting
const gridClass = computed(() => {
  if (!props.gridMode) return {}
  const columns = props.gridColumns || 'auto'
  return {
    'sections-grid': true,
    'grid-cols-2': columns === 2,
    'grid-cols-3': columns === 3,
    'grid-cols-auto': columns === 'auto'
  }
})
</script>

<template>
  <div class="chord-sheet bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-6 md:p-10 min-h-[600px]">
    <!-- Match original Tabview.vue structure -->
    <div v-if="processedSections.length > 0" class="tab-content" :class="gridClass" :style="gridStyle">
      <div v-for="(section, sIdx) in processedSections" :key="sIdx" class="section"
        :class="gridMode ? 'section-card' : 'mb-4'">
        <!-- Section number badge (subtle, top-left corner) -->
        <span v-if="gridMode" class="section-number">{{ sIdx + 1 }}</span>

        <h3 v-if="section.title" class="my-2 text-xs font-bold uppercase text-gray-400 tracking-wider"
          :dir="section.direction">
          {{ section.title }}
        </h3>

        <!-- Match original TabviewSectionLines.vue EXACTLY -->
        <div class="lines whitespace-pre-wrap" :style="[fontSizeStyle, { fontFamily: 'dana, sans-serif' }]">
          <p v-for="(line, lIdx) in section.lines" :key="lIdx" :style="{
            textAlign: section.direction === 'rtl' ? 'right' : 'left',
            fontFamily: 'dana, sans-serif'
          }">
            <!-- Chord line: display:block makes it full-width so trailing spaces work with text-align -->
            <span class="chord" dir="ltr" :style="{
              display: 'block',
              fontFamily: 'dana, sans-serif',
              color: 'red',
              fontWeight: 400
            }">{{ line.transposedChords }}</span>
            <!-- Lyrics line: display:block for consistent width with chords -->
            <span :dir="section.direction || 'ltr'" :style="{
              display: 'block',
              fontFamily: 'dana, sans-serif'
            }">{{ line.text }}</span>
          </p>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-20">
      No chords available for this song.
    </div>
  </div>
</template>

<style scoped>
/* 
 * Chord/lyric alignment styles
 * Critical font-family is applied via inline styles to ensure it reaches all elements
 */
.lines p {
  margin-bottom: 1.5rem;
}

/* Grid layout for sections */
.sections-grid {
  --grid-min-width: 140px;
  /* fallback, overridden by inline style */
  display: grid;
  gap: 1rem;
  align-items: start;
}

/* Auto columns: fit as many as possible */
.sections-grid.grid-cols-auto {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
}

/* Fixed 2 columns max */
.sections-grid.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* Fixed 3 columns max */
.sections-grid.grid-cols-3 {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
  max-width: 100%;
}

/* On larger screens, limit to 3 columns */
@media (min-width: 640px) {
  .sections-grid.grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* On small screens, 2-col and 3-col both can collapse to 1 if needed */
@media (max-width: 400px) {

  .sections-grid.grid-cols-2,
  .sections-grid.grid-cols-3 {
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
  }
}

/* Section card styling in grid mode */
.section-card {
  position: relative;
  padding: 0.75rem;
  padding-top: 1.25rem;
  background: var(--color-surface-muted, #f8f8f8);
  border: 1px solid var(--color-border-subtle, #e5e5e5);
  border-radius: 0.75rem;
}

@media (min-width: 768px) {
  .section-card {
    padding: 1rem;
    padding-top: 1.5rem;
  }

  .sections-grid {
    gap: 1.5rem;
  }
}

:root.dark .section-card {
  background: var(--color-surface-muted, #2a2a2a);
  border-color: var(--color-border-subtle, #3a3a3a);
}

/* Subtle section number badge */
.section-number {
  position: absolute;
  top: 0.35rem;
  left: 0.35rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-text-muted, #888);
  background: var(--color-surface-base, #fff);
  border-radius: 50%;
  opacity: 0.7;
}

@media (min-width: 768px) {
  .section-number {
    top: 0.5rem;
    left: 0.5rem;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.65rem;
  }
}

:root.dark .section-number {
  background: var(--color-surface-base, #1e1e1e);
}
</style>
