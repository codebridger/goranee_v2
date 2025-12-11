<script setup lang="ts">
import { computed } from 'vue'
import type { SongSection } from '~/types/song.type'

interface Props {
  section: SongSection
  maxLines?: number // Optional limit for preview (e.g., 2 for Hero)
  fontSize?: number // Font size in rem (default: 1.0)
  variant?: 'compact' | 'full' // Compact hides title, full shows it
  transposedChords?: string[] // Optional transposed chords array (if provided, use instead of line.chords)
}

const props = withDefaults(defineProps<Props>(), {
  maxLines: undefined,
  fontSize: 1.0,
  variant: 'full',
})

// Get lines to display (limited by maxLines if provided)
const displayLines = computed(() => {
  if (!props.section.lines || props.section.lines.length === 0) return []

  if (props.maxLines !== undefined && props.maxLines > 0) {
    return props.section.lines.slice(0, props.maxLines)
  }

  return props.section.lines
})

// Font size style
const fontSizeStyle = computed(() => ({
  fontSize: `${props.fontSize}rem`
}))

// Show title only in full variant
const showTitle = computed(() => props.variant === 'full' && props.section.title)
</script>

<template>
  <div class="lyric-section" :style="fontSizeStyle">
    <!-- Section Title (only in full variant) -->
    <h3 v-if="showTitle" class="section-title" :dir="section.direction">
      {{ section.title }}
    </h3>

    <!-- Lines -->
    <div v-if="displayLines.length > 0" class="lines" :style="{ fontFamily: 'dana, sans-serif' }">
      <p v-for="(line, lIdx) in displayLines" :key="lIdx" class="line" :style="{
        textAlign: section.direction === 'rtl' ? 'right' : 'left',
        fontFamily: 'dana, sans-serif'
      }">
        <!-- Chord line: display:block makes it full-width so trailing spaces work with text-align -->
        <!-- Priority: line.transposedChords > transposedChords prop array > line.chords -->
        <span v-if="(line as any).transposedChords || line.chords || (transposedChords && transposedChords[lIdx])"
          class="chord text-text-accent" dir="ltr" :style="{
            display: 'block',
            fontFamily: 'dana, sans-serif',
            fontWeight: 400
          }">
          {{ (line as any).transposedChords || (transposedChords && transposedChords[lIdx]) || line.chords }}
        </span>
        <!-- Lyrics line: display:block for consistent width with chords -->
        <span v-if="line.text" :dir="section.direction || 'ltr'" :style="{
          display: 'block',
          fontFamily: 'dana, sans-serif'
        }">
          {{ line.text }}
        </span>
      </p>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      No lyrics available
    </div>
  </div>
</template>

<style scoped>
.lyric-section {
  width: 100%;
}

.section-title {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted, #6B5A68);
  letter-spacing: 0.05em;
}

.lines {
  white-space: pre;
}

.lines .line {
  margin-bottom: 1rem;
}

.lines .line:last-child {
  margin-bottom: 0;
}

.chord {
  color: var(--color-text-accent, #EC4899);
  font-weight: 400;
}

/* Allow text color inheritance from parent (for Hero context) */
.lyric-section {
  color: inherit;
}

.empty-state {
  color: var(--color-text-secondary, #9CA3AF);
  font-style: italic;
  text-align: center;
  padding: 1rem;
}
</style>
