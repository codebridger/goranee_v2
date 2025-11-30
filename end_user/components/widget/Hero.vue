<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Play, ChevronRight, ChevronLeft } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import type { SongWithPopulatedRefs } from '~/types/song.type'
import { useTabService } from '~/composables/useTabService'

const props = defineProps<{
    songs: SongWithPopulatedRefs[]
    isLoading?: boolean
}>()

const { getImageUrl } = useTabService()
const activeIndex = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)

const activeSong = computed(() => props.songs[activeIndex.value])
const nextIndex = computed(() => {
    if (!props.songs.length) return 0;
    return (activeIndex.value + 1) % props.songs.length
})
const prevIndex = computed(() => {
    if (!props.songs.length) return 0;
    return (activeIndex.value - 1 + props.songs.length) % props.songs.length
})

const nextSlide = () => {
    if (!props.songs.length) return
    activeIndex.value = nextIndex.value
    resetTimer()
}

const prevSlide = () => {
    if (!props.songs.length) return
    activeIndex.value = prevIndex.value
    resetTimer()
}

const goToSlide = (index: number) => {
    activeIndex.value = index
    resetTimer()
}

const resetTimer = () => {
    if (timer.value) clearInterval(timer.value)
    timer.value = setInterval(() => {
        if (props.songs.length > 1) {
            activeIndex.value = (activeIndex.value + 1) % props.songs.length
        }
    }, 8000)
}

watch(() => props.songs, (newVal) => {
    if (newVal.length > 0) resetTimer()
})

onMounted(() => {
    if (props.songs.length > 0) resetTimer()
})

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value)
})

// Helper to extract lyrics with chord notation
const getChordPreview = (song: SongWithPopulatedRefs) => {
    if (!song.sections || song.sections.length === 0) return []
    const section = song.sections.find(s => s.lines && s.lines.length > 0)
    return section?.lines?.slice(0, 2) || []
}

const getArtistName = (song: SongWithPopulatedRefs) => {
    return song.artists?.[0]?.name || 'Unknown Artist'
}

const getArtistImage = (song: SongWithPopulatedRefs) => {
    if (song.artists?.[0]?.image) return getImageUrl(song.artists[0].image)
    if (song.image) return getImageUrl(song.image)
    return null
}
</script>

<template>
    <!-- 
    Layout Strategy for RTL/LTR:
    - RTL (Persian/Kurdish): Text on LEFT, Image on RIGHT (same as reference design)
    - LTR (English): Text on RIGHT, Image on LEFT (reversed)
    
    Using CSS logical properties:
    - In RTL: start = right, end = left
    - In LTR: start = left, end = right
    
    So for RTL to have text on LEFT, we use physical "left" positioning
    And for LTR to have text on RIGHT, we use logical "end" which maps to right
    
    Solution: Use explicit RTL/LTR variants to control positioning
  -->
    <div class="relative w-full h-[600px] md:h-[700px] overflow-hidden text-white font-sans">

        <!-- Loading State -->
        <div v-if="isLoading || !activeSong"
            class="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] z-20">
            <div class="animate-pulse flex flex-col items-center gap-4">
                <div class="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <span class="text-gray-400 text-sm">Loading charts...</span>
            </div>
        </div>

        <template v-else>
            <!-- Generative Dark Background (Concert Stage Style) -->
            <div class="absolute inset-0 z-0 bg-[#0a0a0f]">
                <!-- Animated gradient background -->
                <div class="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0a0a0f] to-[#16213e] opacity-80">
                </div>

                <!-- Stage lights effect -->
                <div
                    class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow">
                </div>
                <div class="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] animate-pulse-slow"
                    style="animation-delay: 1s;"></div>
                <div class="absolute top-10 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] animate-pulse-slow"
                    style="animation-delay: 2s;"></div>

                <!-- Smoke/fog effect at bottom -->
                <div
                    class="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a0f]/90 via-[#0a0a0f]/50 to-transparent">
                </div>

                <!-- Subtle grid/noise texture -->
                <div class="absolute inset-0 opacity-[0.03]"
                    style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;">
                </div>
            </div>

            <!-- Gradient Overlay for Text Area (end side) -->
            <div class="absolute inset-y-0 w-1/2 end-0 z-5 hero-text-gradient"></div>

            <!-- Artist Image - Positioned in the image area (start side, fixed 50% width) -->
            <div
                class="absolute top-16 bottom-8 w-1/2 start-0 z-10 hidden md:flex items-center justify-center pointer-events-none px-8">
                <div class="relative h-full w-full flex items-center justify-center overflow-hidden">
                    <img v-if="getArtistImage(activeSong)" :src="getArtistImage(activeSong)!"
                        :alt="getArtistName(activeSong)"
                        class="h-[85%] w-auto max-w-[90%] object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out"
                        :key="activeSong._id" />
                    <!-- Fallback silhouette when no image -->
                    <div v-else
                        class="h-[70%] w-48 bg-gradient-to-t from-gray-800/50 to-gray-700/30 rounded-t-full opacity-40">
                    </div>
                </div>
            </div>

            <!-- Content Container - Positioned in the text area (end side, fixed 50% width) -->
            <div :class="[
                'absolute inset-y-0 z-20 w-1/2 end-0 flex items-end pb-20 md:pb-24 px-8 md:px-16',
                'rtl:text-right', 'ltr:text-left'
            ]">
                <div class="w-full max-w-lg space-y-5">

                    <!-- Title (Large, Bold, White) -->
                    <h1
                        class="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up">
                        {{ activeSong.title }}
                    </h1>

                    <!-- Artist Info & Badges -->
                    <div class="flex items-center gap-3 flex-wrap animate-fade-in-up delay-50">
                        <span class="text-gray-300 text-lg font-medium">
                            {{ getArtistName(activeSong) }}
                        </span>
                        <!-- Badges - Pink filled style -->
                        <span v-if="activeSong.chords?.keySignature"
                            class="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                            {{ activeSong.chords.keySignature }}
                        </span>
                        <span v-if="activeSong.rhythm"
                            class="px-3 py-1 rounded-full bg-gray-700 text-gray-200 text-xs font-medium border border-gray-600">
                            {{ activeSong.rhythm }}
                        </span>
                    </div>

                    <!-- Chord Preview Block -->
                    <div class="font-mono text-xl md:text-2xl space-y-1 text-gray-200 animate-fade-in-up delay-100">
                        <template v-if="getChordPreview(activeSong).length > 0">
                            <div v-for="(line, idx) in getChordPreview(activeSong)" :key="idx" class="leading-relaxed">
                                <span class="text-primary font-bold" v-if="line.chords">[{{ line.chords }}]</span>
                                <span class="text-gray-100 ms-1">{{ line.text }}</span>
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-gray-200">
                                <span class="text-primary font-bold">[Cm]</span>
                                <span class="ms-1">Ewa disan baran bari...</span>
                            </div>
                            <div class="text-gray-200">
                                <span class="text-primary font-bold">[Gm]</span>
                                <span class="ms-1">Firmesk la chawm...</span>
                            </div>
                        </template>
                    </div>

                    <!-- Actions - Matching reference style -->
                    <div class="flex items-center gap-3 pt-3 animate-fade-in-up delay-150 justify-end">
                        <Button variant="primary" size="lg" :class="[
                            // shape & spacing
                            'rounded-full', 'px-6', 'py-3',

                            // shadow & hover shadow
                            'shadow-lg', 'shadow-primary/30', 'hover:shadow-primary/50',

                            // transform & transition
                            'transition-all', 'hover:scale-105',

                            // gradients
                            'bg-linear-to-r!', 'from-primary!', 'to-pink-600!',

                            // layout
                            'flex space-x-1'
                        ]">
                            <span>{{ $t('hero.startPlaying') }}</span>
                            <Play class="w-4 h-4 me-2 fill-current rtl:rotate-180" />
                        </Button>

                    </div>
                </div>
            </div>

            <!-- Navigation Arrow -->
            <!-- RTL: arrow on RIGHT side (next to image), LTR: arrow on LEFT side (next to image) -->
            <button class="absolute top-1/2 -translate-y-1/2 z-30 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-xl cursor-pointer
                   start-4 md:start-8" @click="nextSlide" aria-label="Next slide">
                <!-- Arrow direction: RTL shows >, LTR shows < -->
                <ChevronRight class="w-6 h-6 md:w-7 md:h-7 text-white rtl:block ltr:hidden" />
                <ChevronLeft class="w-6 h-6 md:w-7 md:h-7 text-white ltr:block rtl:hidden" />
            </button>

            <!-- Pagination Dots -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                <button v-for="(song, idx) in songs" :key="song._id" @click="goToSlide(idx)"
                    class="transition-all duration-300 rounded-full" :class="[
                        idx === activeIndex
                            ? 'w-6 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                            : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    ]" :aria-label="`Go to slide ${idx + 1}`"></button>
            </div>
        </template>
    </div>
</template>

<style scoped>
/* Gradient for text readability */
.hero-text-gradient {
    background: linear-gradient(to right, #0a0a0f 0%, rgba(10, 10, 15, 0.7) 50%, transparent 100%);
}

/* LTR: flip the gradient direction (gradient goes from right to left) */
[dir="ltr"] .hero-text-gradient,
:dir(ltr) .hero-text-gradient {
    background: linear-gradient(to left, #0a0a0f 0%, rgba(10, 10, 15, 0.7) 50%, transparent 100%);
}

.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
    transform: translateY(15px);
}

.delay-50 {
    animation-delay: 0.05s;
}

.delay-100 {
    animation-delay: 0.1s;
}

.delay-150 {
    animation-delay: 0.15s;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
}

@keyframes pulse-slow {

    0%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.1);
    }
}
</style>
