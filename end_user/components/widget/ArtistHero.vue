<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Play, Share2, Music, Mic2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { Artist } from '~/types/song.type'
import Button from '~/components/base/Button.vue'

const props = withDefaults(defineProps<{
  artist: Artist | null
  songsCount: number
  totalPlays: number
  artistImage?: string
  gradientClass: string
  bio: string
  motionVariant?: 'wave' | 'sweep' | 'dust' | 'vignette' | 'pulse'
}>(), {
  motionVariant: 'wave',
})

const showFullBio = ref(false)
const { t } = useI18n()

const bioToggleText = computed(() =>
  showFullBio.value ? t('common.showLess') : t('common.readMore')
)

const chevronIcon = computed(() => (showFullBio.value ? ChevronUp : ChevronDown))

const toggleBio = () => {
  showFullBio.value = !showFullBio.value
}
</script>

<template>
  <div class="relative w-full overflow-hidden bg-surface-card/50 border-b border-border-subtle pb-12 pt-24 lg:pt-28">
    <!-- Animated Pattern Background -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Base surface -->
      <div class="absolute inset-0 bg-surface-base"></div>

      <!-- Animated blobs (Wave variant) -->
      <div class="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-grad-primary opacity-40 blur-3xl"
        :class="props.motionVariant === 'wave' ? 'artist-hero-blob-wave' : 'artist-hero-blob-static'">
      </div>
      <div
        class="absolute -bottom-40 right-[-80px] w-[420px] h-[420px] rounded-full bg-grad-secondary opacity-35 blur-3xl"
        :class="props.motionVariant === 'wave' ? 'artist-hero-blob-wave artist-hero-blob-wave-delay-1' : 'artist-hero-blob-static'">
      </div>

      <!-- Subtle grid/noise overlay -->
      <div class="absolute inset-0 artist-hero-noise mix-blend-soft-light opacity-60"></div>

      <!-- Light sweep (sweep variant) -->
      <div v-if="props.motionVariant === 'sweep'" class="absolute inset-0 artist-hero-light">
      </div>

      <!-- Floating dust particles (dust variant) -->
      <div v-if="props.motionVariant === 'dust'" class="absolute inset-0 overflow-hidden pointer-events-none">
        <div v-for="i in 14" :key="i" class="artist-hero-dust" :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${12 + Math.random() * 8}s`,
        }" />
      </div>

      <!-- Rotating vignette (vignette variant) -->
      <div v-if="props.motionVariant === 'vignette'"
        class="absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full artist-hero-vignette">
      </div>
    </div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="artist-hero-layout items-center gap-8 lg:gap-16">
        <!-- Image Side (LTR: Left, RTL: Right) -->
        <div class="artist-hero-image flex-1 flex justify-center w-full lg:w-auto">
          <div class="relative group">
            <!-- Pulsing accent ring (pulse variant) -->
            <div v-if="props.motionVariant === 'pulse'"
              class="absolute inset-[-10px] rounded-full artist-hero-pulse-ring">
            </div>
            <div
              class="absolute inset-0 rounded-full bg-linear-to-br blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"
              :class="props.gradientClass"></div>
            <div class="relative w-48 h-48 lg:w-80 lg:h-80 rounded-full p-[6px] bg-surface-card shadow-2xl">
              <div class="w-full h-full rounded-full overflow-hidden bg-surface-base relative">
                <img v-if="props.artistImage" :src="props.artistImage" :alt="props.artist?.name"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                <div v-else
                  class="w-full h-full flex items-center justify-center bg-surface-subtle text-text-secondary">
                  <Mic2 class="w-24 h-24 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio Side (LTR: Right, RTL: Left) -->
        <div
          class="artist-hero-bio flex-1 flex flex-col items-center lg:items-start text-center lg:text-start w-full lg:w-auto">
          <!-- Name & Stats -->
          <h1
            class="text-4xl lg:text-6xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-linear-to-r from-text-primary to-text-secondary leading-tight">
            {{ props.artist?.name }}
          </h1>

          <div
            class="flex items-center gap-6 text-text-secondary text-base font-medium mb-8 bg-surface-card/60 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <div class="flex items-center gap-2">
              <Music class="w-5 h-5 text-brand-primary" />
              <span>{{ props.songsCount }} {{ t('common.songs') }}</span>
            </div>
            <div class="w-px h-4 bg-border-subtle"></div>
            <div class="flex items-center gap-2">
              <Play class="w-5 h-5 text-text-accent" />
              <span>{{ props.totalPlays }} {{ t('common.plays') }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 mb-8">
            <Button variant="primary" size="lg"
              class="rounded-full px-10 shadow-xl hover:shadow-2xl hover:shadow-brand-primary/25">
              {{ t('common.follow') }}
            </Button>
            <button
              class="p-4 rounded-full bg-surface-card border border-border-subtle hover:bg-surface-hover hover:border-text-accent/30 transition-all duration-300 text-text-secondary hover:text-text-primary shadow-sm hover:shadow-lg">
              <Share2 class="w-6 h-6" />
            </button>
          </div>

          <!-- Bio -->
          <div class="max-w-xl text-text-secondary leading-relaxed relative text-lg">
            <div :class="{ 'line-clamp-3': !showFullBio }" class="transition-all duration-300">
              <p>{{ props.bio }}</p>
            </div>
            <button @click="toggleBio"
              class="mt-3 text-brand-primary text-sm font-bold flex items-center gap-1 hover:underline focus:outline-none">
              {{ bioToggleText }}
              <component :is="chevronIcon" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.artist-hero-layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .artist-hero-layout {
    flex-direction: row;
  }

  /* LTR: Image | Bio */
  [dir="ltr"] .artist-hero-image {
    order: 1;
  }

  [dir="ltr"] .artist-hero-bio {
    order: 2;
  }

  /* RTL: Bio | Image */
  [dir="rtl"] .artist-hero-image {
    order: 2;
  }

  [dir="rtl"] .artist-hero-bio {
    order: 1;
  }
}

@keyframes artist-hero-blob {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.5;
  }

  50% {
    transform: translate3d(80px, -110px, 0) scale(1.25);
    opacity: 0.9;
  }

  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.5;
  }
}

.artist-hero-blob-static {
  animation: none;
}

.artist-hero-blob-wave {
  animation: artist-hero-blob 8s ease-in-out infinite;
}

.artist-hero-blob-wave-delay-1 {
  animation-delay: 4s;
}

.artist-hero-noise {
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1px, transparent 0);
  background-size: 28px 28px;
}

@keyframes artist-hero-light {
  0% {
    opacity: 0;
    transform: translate3d(-30%, 0, 0);
  }

  25% {
    opacity: 0.7;
  }

  75% {
    opacity: 0.7;
    transform: translate3d(30%, 0, 0);
  }

  100% {
    opacity: 0;
    transform: translate3d(60%, 0, 0);
  }
}

.artist-hero-light {
  background-image: linear-gradient(120deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 40%,
      rgba(255, 255, 255, 0) 80%);
  mix-blend-mode: screen;
  animation: artist-hero-light 16s ease-in-out infinite;
}

@keyframes artist-hero-dust-float {
  0% {
    transform: translate3d(0, 10px, 0);
    opacity: 0;
  }

  20% {
    opacity: 0.6;
  }

  80% {
    opacity: 0.6;
    transform: translate3d(0, -20px, 0);
  }

  100% {
    opacity: 0;
    transform: translate3d(0, -30px, 0);
  }
}

.artist-hero-dust {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  animation-name: artist-hero-dust-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes artist-hero-vignette-rotate {
  0% {
    transform: translate3d(-50%, 0, 0) rotate(0deg);
  }

  50% {
    transform: translate3d(-50%, 0, 0) rotate(180deg);
  }

  100% {
    transform: translate3d(-50%, 0, 0) rotate(360deg);
  }
}

.artist-hero-vignette {
  background:
    radial-gradient(circle at 30% 25%,
      rgba(255, 255, 255, 0.26) 0,
      rgba(255, 255, 255, 0.10) 35%,
      transparent 70%),
    radial-gradient(circle at 75% 70%,
      rgba(255, 255, 255, 0.18) 0,
      transparent 60%);
  mix-blend-mode: soft-light;
  animation: artist-hero-vignette-rotate 22s linear infinite;
}

@keyframes artist-hero-pulse {
  0% {
    transform: scale(1);
    opacity: 0.1;
  }

  50% {
    transform: scale(1.06);
    opacity: 0.9;
  }

  100% {
    transform: scale(1);
    opacity: 0.1;
  }
}

.artist-hero-pulse-ring {
  border-width: 2px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
  animation: artist-hero-pulse 4s ease-in-out infinite;
  mix-blend-mode: screen;
}
</style>
