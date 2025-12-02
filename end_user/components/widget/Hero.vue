<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Play, ChevronRight, ChevronLeft, Search, Music, Loader2 } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import Input from '../base/Input.vue'
import type { SongWithPopulatedRefs } from '~/types/song.type'
import { useTabService } from '~/composables/useTabService'

const props = defineProps<{
    songs: SongWithPopulatedRefs[]
    isLoading?: boolean
}>()

const router = useRouter()
const { t } = useI18n()
const { getImageUrl, searchSongs } = useTabService()
const activeIndex = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)

// Search State
const searchQuery = ref('')
const searchResults = ref<SongWithPopulatedRefs[]>([])
const isSearching = ref(false)
const showResults = ref(false)

// Search Logic
let searchTimeout: ReturnType<typeof setTimeout>
const performSearch = () => {
    clearTimeout(searchTimeout)
    if (searchQuery.value.length < 2) {
        searchResults.value = []
        showResults.value = false
        return
    }

    searchTimeout = setTimeout(async () => {
        isSearching.value = true
        showResults.value = true
        try {
            searchResults.value = await searchSongs(searchQuery.value)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            isSearching.value = false
        }
    }, 300)
}

const handleSearchSubmit = () => {
    if (searchQuery.value) {
        router.push(`/discovery?q=${encodeURIComponent(searchQuery.value)}`)
        showResults.value = false
    }
}

const goToSong = (id: string) => {
    router.push(`/songs/${id}`)
    showResults.value = false
}

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
    <div :class="[
        'relative w-full overflow-hidden text-white font-sans flex flex-col',
        'pt-20 min-h-[max(80dvh,680px)] h-auto',
        'md:pt-0 md:h-[80dvh] md:min-h-0 md:max-h-[1080px] md:block',
        'lg:h-dvh'
    ]">

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
                <div class="absolute inset-0 bg-linear-to-br from-[#1a1a2e] via-[#0a0a0f] to-[#16213e] opacity-80">
                </div>

                <!-- Particles Effect -->
                <div class="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <div v-for="i in 35" :key="i"
                        class="absolute rounded-full animate-float shadow-[0_0_10px_currentColor]" :class="[
                            i % 3 === 0 ? 'bg-blue-400 text-blue-400' :
                                i % 3 === 1 ? 'bg-purple-400 text-purple-400' :
                                    'bg-white text-white'
                        ]" :style="{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            opacity: 0,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 8 + 10}s`
                        }"></div>
                </div>

                <!-- Stage lights effect -->
                <div
                    class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-sway-slow">
                </div>
                <div class="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] animate-sway-slow"
                    style="animation-delay: 1s;"></div>
                <div class="absolute top-10 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] animate-pulse-slow"
                    style="animation-delay: 2s;"></div>

                <!-- Smoke/fog effect at bottom -->
                <div
                    class="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-[#0a0a0f]/90 via-[#0a0a0f]/50 to-transparent">
                </div>

                <!-- Subtle grid/noise texture -->
                <div class="absolute inset-0"
                    style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0); background-size: 32px 32px;">
                </div>
            </div>

            <!-- Gradient Overlay for Text Area (end side) -->
            <div :class="[
                'absolute inset-y-0 end-0 z-5 hero-text-gradient',
                'hidden lg:block lg:w-1/2'
            ]"></div>

            <!-- Mobile Content Wrapper (flex column for mobile, removed on desktop) -->
            <div :class="[
                'flex-1 flex flex-col w-full pt-4 px-4 pb-16',
                'md:hidden'
            ]">
                <!-- Layer A: Search (Top) -->
                <div class="w-full mb-4 relative z-40 shrink-0 px-8 group">
                    <div class="relative">
                        <div
                            class="absolute start-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors pointer-events-none">
                            <Search class="w-5 h-5" />
                        </div>
                        <input type="text" v-model="searchQuery" @input="performSearch"
                            @keydown.enter="handleSearchSubmit" :placeholder="t('navbar.searchPlaceholder')"
                            class="w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-full py-3 px-6 ps-12 text-white placeholder-white/50 outline-none transition-all duration-300" />
                    </div>

                    <!-- Search Dropdown -->
                    <div v-if="showResults && searchQuery.length >= 2"
                        class="absolute top-full mt-2 left-0 right-0 bg-[#1F121D] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                        <div v-if="isSearching" class="p-4 flex justify-center text-gray-400">
                            <Loader2 class="w-6 h-6 animate-spin" />
                        </div>
                        <div v-else-if="searchResults.length > 0">
                            <div v-for="song in searchResults" :key="song._id" @click="song._id && goToSong(song._id)"
                                class="p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0 flex items-center gap-3">
                                <div class="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0">
                                    <Music v-if="!song.image" class="w-5 h-5 text-gray-400" />
                                    <img v-else :src="getImageUrl(song.image)"
                                        class="w-full h-full object-cover rounded" />
                                </div>
                                <div>
                                    <div class="font-bold text-sm text-white text-left">{{ song.title }}</div>
                                    <div class="text-xs text-gray-400 text-left">{{ song.artists?.[0]?.name }}
                                    </div>
                                </div>
                            </div>
                            <div @click="handleSearchSubmit"
                                class="p-3 text-center text-xs font-bold text-primary cursor-pointer hover:bg-white/5">
                                {{ t('navbar.viewAllResults') }}
                            </div>
                        </div>
                        <div v-else class="p-4 text-center text-gray-400 text-sm">
                            {{ t('navbar.noResults', { query: searchQuery }) }}
                        </div>
                    </div>
                </div>

                <!-- Layer B: Artist Stage (Middle) -->
                <div class="flex-1 flex flex-col justify-center min-h-0 gap-6">
                    <!-- Artist Image -->
                    <div :class="[
                        'z-10 flex items-center justify-center pointer-events-none px-4',
                        'relative w-full shrink-0',
                        'h-40 sm:h-56'
                    ]">
                        <div :class="[
                            'relative w-full flex items-center justify-center overflow-hidden',
                            'h-full'
                        ]">
                            <Transition name="fade" mode="out-in">
                                <img v-if="getArtistImage(activeSong)" :src="getArtistImage(activeSong)!"
                                    :alt="getArtistName(activeSong)" :class="[
                                        'rounded-md',
                                        'h-auto w-auto max-h-full max-w-[90%] object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out'
                                    ]" :key="activeSong._id" />
                                <!-- Fallback silhouette when no image -->
                                <div v-else :class="[
                                    'bg-linear-to-t from-gray-800/50 to-gray-700/30 rounded-t-full opacity-40',
                                    'h-40 w-40'
                                ]" :key="'fallback-' + activeSong._id">
                                </div>
                            </Transition>
                        </div>
                    </div>

                    <!-- Song Info & Chords -->
                    <div :class="[
                        'z-20 flex items-center shrink-0',
                        'relative w-full px-2',
                        'text-center'
                    ]">
                        <div :class="[
                            'w-full',
                            'space-y-2',
                            'max-w-lg mx-auto'
                        ]">
                            <Transition name="slide-fade" mode="out-in">
                                <div :key="activeSong._id" :class="[
                                    'space-y-2'
                                ]">
                                    <!-- Title (Large, Bold, White) -->
                                    <h1 :class="[
                                        'font-black text-white leading-[1.1] tracking-tight animate-fade-in-up',
                                        'text-2xl sm:text-3xl'
                                    ]">
                                        {{ activeSong.title }}
                                    </h1>

                                    <!-- Artist Info & Badges -->
                                    <div :class="[
                                        'flex items-center gap-2 flex-wrap animate-fade-in-up delay-50',
                                        'justify-center'
                                    ]">
                                        <span :class="[
                                            'text-gray-300 font-medium',
                                            'text-sm'
                                        ]">
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
                                    <div :class="[
                                        'font-mono space-y-1 text-gray-200 animate-fade-in-up delay-100',
                                        'text-sm',
                                        'bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5 mt-2'
                                    ]">
                                        <template v-if="getChordPreview(activeSong).length > 0">
                                            <div v-for="(line, idx) in getChordPreview(activeSong)" :key="idx"
                                                class="leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
                                                <span class="text-base font-bold" v-if="line.chords">[{{ line.chords
                                                    }}]</span>
                                                <span class="text-gray-100 ms-1">{{ line.text }}</span>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="text-gray-200">
                                                <span class="text-base font-bold">[Cm]</span>
                                                <span class="text-basems-1">Ewa disan baran bari...</span>
                                            </div>
                                            <div class="text-gray-200">
                                                <span class="text-base font-bold">[Gm]</span>
                                                <span class="text-basems-1">Firmesk la chawm...</span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>

                    <!-- Layer C: Action Buttons (Bottom) -->
                    <div class="shrink-0 z-30">
                        <Transition name="slide-fade" mode="out-in">
                            <div :key="activeSong._id" :class="[
                                'flex items-center gap-3 animate-fade-in-up delay-150',
                                'justify-center'
                            ]">
                                <Button variant="secondary" size="md" to="/discovery" :class="[
                                    'rounded-full', 'px-4 py-2',
                                    'border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm',
                                    'transition-all hover:scale-105',
                                    'flex items-center justify-center font-bold'
                                ]">
                                    <span>{{ t('navbar.explore') }}</span>
                                </Button>

                                <Button variant="primary" size="md" :class="[
                                    'rounded-full', 'px-4 py-2',
                                    'shadow-lg shadow-primary/30 hover:shadow-primary/50',
                                    'transition-all hover:scale-105',
                                    'bg-linear-to-r! from-primary! to-pink-600!',
                                    'flex items-center space-x-1 font-bold'
                                ]">
                                    <span>{{ $t('hero.startPlaying') }}</span>
                                    <Play class="w-3 h-3 me-2 fill-current rtl:rotate-180" />
                                </Button>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>

            <!-- Tablet Content Wrapper (medium screens only) -->
            <div :class="[
                'hidden md:flex lg:hidden flex-col items-center justify-center h-full',
                'absolute inset-0 z-20 px-24 py-12'
            ]">
                <Transition name="slide-fade" mode="out-in">
                    <div :key="activeSong._id" class="flex flex-col justify-center w-full h-full max-w-2xl space-y-8">
                        <!-- Top Row: Title/Artist (Left) | Image (Right) -->
                        <div class="w-full grid grid-cols-12 items-start gap-6 rtl:grid-cols-reverse">
                            <!-- Left: Text Info (8/12 cols) -->
                            <div class="col-span-9 text-start space-y-2 rtl:order-last">
                                <h1 class="font-black text-white text-4xl leading-tight tracking-tight">
                                    {{ activeSong.title }}
                                </h1>
                                <div class="flex items-center gap-3 flex-wrap">
                                    <span class="text-gray-300 font-medium text-xl">
                                        {{ getArtistName(activeSong) }}
                                    </span>
                                    <span v-if="activeSong.chords?.keySignature"
                                        class="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                                        {{ activeSong.chords.keySignature }}
                                    </span>
                                </div>
                            </div>

                            <!-- Right: Artist Image (3/12 cols) -->
                            <div class="col-span-3 flex justify-end rtl:order-first">
                                <div class="relative w-32 h-32 shrink-0">
                                    <img v-if="getArtistImage(activeSong)" :src="getArtistImage(activeSong)!"
                                        :alt="getArtistName(activeSong)"
                                        class="rounded-xl h-full w-full object-cover shadow-2xl border border-white/10" />
                                    <div v-else
                                        class="h-full w-full bg-linear-to-t from-gray-800 to-gray-700 rounded-xl opacity-40">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Middle Row: Chords Preview -->
                        <div
                            class="w-full text-center bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/5">
                            <div class="font-mono space-y-2 text-gray-200 text-base">
                                <template v-if="getChordPreview(activeSong).length > 0">
                                    <div v-for="(line, idx) in getChordPreview(activeSong)" :key="idx"
                                        class="leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span class="text-base font-bold" v-if="line.chords">[{{ line.chords
                                        }}]</span>
                                        <span class="text-gray-100 ms-1">{{ line.text }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="text-gray-200">
                                        <span class="text-base font-bold">[Cm]</span>
                                        <span class="text-base ms-1">Ewa disan baran bari...</span>
                                    </div>
                                    <div class="text-gray-200">
                                        <span class="text-base font-bold">[Gm]</span>
                                        <span class="text-base ms-1">Firmesk la chawm...</span>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- Bottom Row: Play Button -->
                        <div class="w-full flex justify-end pt-10">
                            <Button variant="primary" size="lg" :class="[
                                'rounded-full', 'px-10 py-4',
                                'shadow-lg', 'shadow-primary/30', 'hover:shadow-primary/50',
                                'transition-all', 'hover:scale-105',
                                'bg-linear-to-r!', 'from-primary!', 'to-pink-600!',
                                'flex items-center space-x-2 text-lg font-bold'
                            ]">
                                <span>{{ $t('hero.startPlaying') }}</span>
                                <Play class="w-6 h-6 me-2 fill-current rtl:rotate-180" />
                            </Button>
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- Artist Image - Desktop: Positioned in the image area (start side, fixed 50% width) -->
            <div :class="[
                'z-10 hidden lg:flex items-center justify-center pointer-events-none px-4',
                'absolute top-16 bottom-8 w-[45%] start-[5%] h-auto'
            ]">
                <div class="relative h-full w-full flex items-center justify-center overflow-hidden">
                    <Transition name="fade" mode="out-in">
                        <img v-if="getArtistImage(activeSong)" :src="getArtistImage(activeSong)!"
                            :alt="getArtistName(activeSong)" :class="[
                                'rounded-md',
                                'h-auto w-auto object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out',
                                'max-h-[50%] max-w-[75%]',
                                'md:max-h-[55%] md:max-w-[78%]',
                                'lg:max-h-[60%] lg:max-w-[80%]',
                                'xl:max-h-[65%] xl:max-w-[85%]'
                            ]" :key="activeSong._id" />
                        <!-- Fallback silhouette when no image -->
                        <div v-else
                            class="h-[60%] w-48 bg-linear-to-t from-gray-800/50 to-gray-700/30 rounded-t-full opacity-40"
                            :key="'fallback-' + activeSong._id">
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Content Container - Desktop: Positioned in the text area (end side, fixed 50% width) -->
            <div :class="[
                'z-20 hidden lg:flex items-center',
                'absolute inset-y-0 w-[45%] end-[5%] px-8 pb-20',
                'rtl:text-right ltr:text-left'
            ]">
                <div class="w-full max-w-lg space-y-5">
                    <Transition name="slide-fade" mode="out-in">
                        <div :key="activeSong._id" class="space-y-5">
                            <!-- Title (Large, Bold, White) -->
                            <h1 :class="[
                                'font-black text-white leading-[1.1] tracking-tight animate-fade-in-up',
                                'text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
                            ]">
                                {{ activeSong.title }}
                            </h1>

                            <!-- Artist Info & Badges -->
                            <div :class="[
                                'flex items-center gap-3 flex-wrap animate-fade-in-up delay-50',
                                'justify-start'
                            ]">
                                <span :class="[
                                    'text-gray-300 font-medium',
                                    'text-base md:text-lg lg:text-xl'
                                ]">
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
                            <div :class="[
                                'font-mono space-y-1 text-gray-200 animate-fade-in-up delay-100',
                                'text-lg md:text-xl lg:text-2xl xl:text-3xl',
                                'bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/5'
                            ]">
                                <template v-if="getChordPreview(activeSong).length > 0">
                                    <div v-for="(line, idx) in getChordPreview(activeSong)" :key="idx"
                                        class="leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span class="text-base font-bold" v-if="line.chords">[{{ line.chords
                                        }}]</span>
                                        <span class="text-gray-100 ms-1">{{ line.text }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="text-gray-200">
                                        <span class="text-base font-bold">[Cm]</span>
                                        <span class="text-base ms-1">Ewa disan baran bari...</span>
                                    </div>
                                    <div class="text-gray-200">
                                        <span class="text-base font-bold">[Gm]</span>
                                        <span class="text-base ms-1">Firmesk la chawm...</span>
                                    </div>
                                </template>
                            </div>

                            <!-- Actions - Matching reference style -->
                            <div :class="[
                                'flex items-center gap-3 pt-10 animate-fade-in-up delay-150',
                                'justify-center md:justify-end'
                            ]">
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
                    </Transition>
                </div>
            </div>

            <!-- Navigation Arrows (Desktop) -->

            <!-- Previous Slide Button (Start Side) -->
            <button :class="[
                'absolute top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-xl cursor-pointer',
                'hidden md:flex h-14 w-14 start-8'
            ]" @click="prevSlide" aria-label="Previous slide">
                <!-- Icon: LTR show < (Left), RTL show > (Right) -->
                <ChevronRight :class="[
                    'text-white rtl:block ltr:hidden',
                    'w-7 h-7'
                ]" />
                <ChevronLeft :class="[
                    'text-white ltr:block rtl:hidden',
                    'w-7 h-7'
                ]" />
            </button>

            <!-- Next Slide Button (End Side) -->
            <button :class="[
                'absolute top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-xl cursor-pointer',
                'hidden md:flex h-14 w-14 end-8'
            ]" @click="nextSlide" aria-label="Next slide">
                <!-- Icon: LTR show > (Right), RTL show < (Left) -->
                <ChevronLeft :class="[
                    'text-white rtl:block ltr:hidden',
                    'w-7 h-7'
                ]" />
                <ChevronRight :class="[
                    'text-white ltr:block rtl:hidden',
                    'w-7 h-7'
                ]" />
            </button>

            <!-- Pagination Dots -->
            <div :class="[
                'absolute left-1/2 -translate-x-1/2 z-30 flex items-center gap-2',
                'bottom-4 md:bottom-8'
            ]">
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

.animate-float {
    animation: float 15s linear infinite;
}

@keyframes float {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }

    10% {
        opacity: 0.8;
    }

    90% {
        opacity: 0.6;
    }

    100% {
        transform: translateY(-150px) translateX(30px);
        opacity: 0;
    }
}

.animate-sway-slow {
    animation: sway-slow 8s ease-in-out infinite;
}

@keyframes sway-slow {

    0%,
    100% {
        transform: translateX(0) scale(1);
        opacity: 0.3;
    }

    50% {
        transform: translateX(30px) scale(1.1);
        opacity: 0.5;
    }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

/* RTL Adjustments for Slide Fade */
[dir="rtl"] .slide-fade-enter-from {
    transform: translateX(-30px);
}

[dir="rtl"] .slide-fade-leave-to {
    transform: translateX(30px);
}
</style>
