<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, type ComponentPublicInstance } from 'vue'
import { useTranspose } from '~/composables/useTranspose'
import { useI18nRtl } from '~/composables/useI18nRtl'
import type { SongSection, SongChords } from '~/types/song.type'

interface Props {
  sections: SongSection[]
  songChords?: SongChords
  currentTableIndex: number
  originalTableIndex: number
  fontSize: number // scale factor, e.g., 1 (base) -> 1.5
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
</script>

<template>
  <div class="chord-sheet bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-6 md:p-10 min-h-[600px]">
    <!-- Match original Tabview.vue structure -->
    <div class="tab-content" v-if="processedSections.length > 0">
      <div v-for="(section, sIdx) in processedSections" :key="sIdx" class="mb-4 section">

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
</style>
