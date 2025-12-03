<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, type ComponentPublicInstance } from 'vue'
import { useTranspose } from '~/composables/useTranspose'
import type { SongSection } from '~/types/song.type'

interface Props {
  sections: SongSection[]
  transposeSteps: number
  fontSize: number // scale factor, e.g., 1 (base) -> 1.5
}

const props = defineProps<Props>()
const { transposeChord } = useTranspose()

const lineRefs = ref<(HTMLElement | null)[]>([])
const globalSectionWidth = ref<string>('fit-content')

const processedSections = computed(() => {
  return props.sections.map(section => ({
    ...section,
    lines: section.lines?.map(line => {
      // Transpose chords in the 'chords' string
      // Assuming chords are separated by spaces or are just a string of chords
      // Logic: Split by space, transpose each part if it looks like a chord, join back
      // This is a simple approximation. Ideally we parse positionally.

      const originalChords = line.chords || ''
      const transposedChords = originalChords.split(/(\s+)/).map(part => {
        // If part is whitespace, return as is
        if (!part.trim()) return part
        // Try to transpose
        return transposeChord(part, props.transposeSteps)
      }).join('')

      return {
        ...line,
        transposedChords
      }
    })
  }))
})

const fontSizeClass = computed(() => {
  // This is a simplified mapping. In real world we might use dynamic style or specific classes
  if (props.fontSize <= 0.8) return 'text-sm'
  if (props.fontSize >= 1.2) return 'text-xl'
  return 'text-base'
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

// Re-measure when sections, transpose, or fontSize changes
watch([() => props.sections, () => props.transposeSteps, () => props.fontSize], () => {
  measureLongestLine()
}, { deep: true })

const sectionWidthStyle = computed(() => ({
  width: globalSectionWidth.value
}))

</script>

<template>
  <div class="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-6 md:p-10 min-h-[600px] flex flex-col items-center"
    dir="rtl">
    <div v-for="(section, sIdx) in processedSections" :key="sIdx" class="mb-8">
      <h3 v-if="section.title" class="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">
        {{ section.title }}
      </h3>

      <div class="space-y-4 font-mono leading-loose mx-auto" :style="sectionWidthStyle">
        <div v-for="(line, lIdx) in section.lines" :key="lIdx" class="group">
          <!-- Chords Line -->
          <div v-if="line.transposedChords" :ref="setLineRef" class="font-bold text-text-accent whitespace-pre-wrap"
            :style="fontSizeStyle">
            {{ line.transposedChords }}
          </div>

          <!-- Lyrics Line -->
          <div v-if="line.text" :ref="setLineRef" class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans"
            :style="fontSizeStyle">
            {{ line.text }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="sections.length === 0" class="text-center text-gray-500 py-20">
      No chords available for this song.
    </div>
  </div>
</template>
