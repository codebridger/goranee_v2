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

// Grid style (no longer needed for CSS variables, but kept for potential future use)
const gridStyle = computed(() => {
  return {}
})

// Grid class based on column setting
const gridClass = computed(() => {
  if (!props.gridMode) return {}
  const columns = props.gridColumns || 2
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
        <div class="lines" :style="[fontSizeStyle, { fontFamily: 'dana, sans-serif' }]">
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
 * Lines should NOT wrap - preserve whitespace and prevent breaking
 */
.lines {
  white-space: pre;
}

.lines p {
  margin-bottom: 1rem;
}

/* Flexbox layout for sections - per-row flexibility */
.sections-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: stretch;
}

/* Section card styling in grid mode */
.section-card {
  position: relative;
  padding: 0.5rem;
  padding-top: 1.25rem;
  background: var(--color-surface-muted, #f8f8f8);
  border: 1px solid var(--color-border-subtle, #e5e5e5);
  border-radius: 0.5rem;
  /* Flex: grow to fill, shrink if needed, basis auto */
  flex: 1 1 auto;
  /* Respect content width - never shrink smaller than content */
  min-width: fit-content;
}

/* Auto mode: sections grow freely, natural content-based sizing */
.sections-grid.grid-cols-auto .section-card {
  /* No constraints - fit as many as possible, grow to fill */
}

/* 2 columns mode: prefer 2 per row, grow to fill when fewer fit */
.sections-grid.grid-cols-2 .section-card {
  /* Prefer ~50% width, but grow to fill row when content forces fewer columns */
  flex: 1 0 calc(50% - 0.25rem);
  /* No max-width - allows sections to expand when fewer fit per row */
}

/* 3 columns mode: prefer 3 per row, grow to fill when fewer fit */
.sections-grid.grid-cols-3 .section-card {
  /* Prefer ~33% width, but grow to fill row when content forces fewer columns */
  flex: 1 0 calc(33.333% - 0.35rem);
  /* No max-width - allows sections to expand when fewer fit per row */
}

@media (min-width: 768px) {
  .sections-grid {
    gap: 0.75rem;
  }

  .section-card {
    padding: 0.75rem;
    padding-top: 1.25rem;
  }

  .sections-grid.grid-cols-2 .section-card {
    flex: 1 0 calc(50% - 0.375rem);
  }

  .sections-grid.grid-cols-3 .section-card {
    flex: 1 0 calc(33.333% - 0.5rem);
  }
}

:root.dark .section-card {
  background: var(--color-surface-muted, #2a2a2a);
  border-color: var(--color-border-subtle, #3a3a3a);
}

/* Subtle section number badge */
.section-number {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
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
    top: 0.35rem;
    left: 0.35rem;
    width: 1.125rem;
    height: 1.125rem;
    font-size: 0.6rem;
  }
}

:root.dark .section-number {
  background: var(--color-surface-base, #1e1e1e);
}
</style>
