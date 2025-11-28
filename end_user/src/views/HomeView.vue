<script setup lang="ts">
import { ref } from 'vue'
import { Play, ArrowRight, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-vue-next'
import Typography from '../components/design-system/Typography.vue'
import Button from '../components/design-system/Button.vue'
import Card from '../components/design-system/Card.vue'
import Navbar from '../components/design-system/Navbar.vue'
import Hero from '../components/design-system/Hero.vue'
import TabFilter from '../components/design-system/TabFilter.vue'
import SkeletonCard from '../components/design-system/SkeletonCard.vue'
import CommunitySection from '../components/design-system/CommunitySection.vue'
import Footer from '../components/design-system/Footer.vue'

const isDark = ref(false)
const isRTL = ref(false)
const isLoading = ref(false)
const activeTab = ref('All')

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
}

const toggleDirection = () => {
  isRTL.value = !isRTL.value
  document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
}

const featuredSongs = [
  { title: 'Xam', artist: 'Zakaria', key: 'Cm', rhythm: 'Slow 6/8', img: 'purple' },
  { title: 'Gule', artist: 'Hassan', key: 'Am', rhythm: 'Kurdish 7/8', img: 'pink' },
  { title: 'Baran', artist: 'Nazdar', key: 'Gm', rhythm: '4/4 Pop', img: 'blue' },
  { title: 'Dlem', artist: 'Kamaran', key: 'Dm', rhythm: 'Georgina', img: 'orange' },
]

const artists = [
  { name: 'Zakaria', color: 'from-pink-500 to-rose-500' },
  { name: 'Dashni', color: 'from-purple-500 to-indigo-500' },
  { name: 'Hassan', color: 'from-blue-500 to-cyan-500' },
  { name: 'Chopy', color: 'from-orange-500 to-red-500' },
  { name: 'Navid', color: 'from-emerald-500 to-teal-500' },
]

const tabs = ['All', 'Pop', 'Folklore', 'Slow', 'Halparke']
</script>

<template>
  <div
    class="min-h-screen bg-surface-base text-text-primary transition-colors duration-300 font-sans relative"
  >
    <!-- Dev Tool: Toggle Loading State -->
    <div
      class="fixed bottom-4 left-4 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-xs cursor-pointer flex items-center gap-2 hover:bg-black"
      @click="isLoading = !isLoading"
    >
      <ToggleRight v-if="isLoading" class="text-green-400" />
      <ToggleLeft v-else class="text-gray-400" />
      {{ isLoading ? 'View Content' : 'Preview Loading State' }}
    </div>

    <!-- Theme/Direction Controls -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <button
        @click="toggleTheme"
        class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition cursor-pointer"
      >
        <Moon v-if="!isDark" class="w-6 h-6" />
        <Sun v-else class="w-6 h-6" />
      </button>
      <button
        @click="toggleDirection"
        class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition font-bold text-xs cursor-pointer"
      >
        {{ isRTL ? 'LTR' : 'RTL' }}
      </button>
    </div>

    <Navbar />

    <Hero />

    <!-- --- SONG DISCOVERY --- -->
    <section class="px-6 py-16 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <Typography variant="h2" class="font-bold">Discovery</Typography>
          <Typography variant="body" class="text-text-secondary"
            >Fresh chords added this week</Typography
          >
        </div>
        <TabFilter :tabs="tabs" :activeTab="activeTab" @change="activeTab = $event" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <template v-if="isLoading">
          <SkeletonCard v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <Card v-for="(song, i) in featuredSongs" :key="i" variant="song" hoverable>
            <div
              class="h-48 rounded-2xl bg-gradient-to-br mb-4 relative overflow-hidden shadow-inner group"
              :class="`from-${song.img}-400 to-${song.img}-600`"
            >
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm"
              >
                <div
                  class="w-14 h-14 rounded-full bg-grad-primary flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300"
                >
                  <Play class="w-6 h-6 text-white fill-current ml-1" />
                </div>
              </div>
            </div>
            <div class="flex justify-between items-start">
              <div>
                <Typography variant="h3" class="mb-1">{{ song.title }}</Typography>
                <Typography variant="caption" class="text-text-secondary normal-case"
                  >{{ song.artist }}
                </Typography>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div
                  class="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 min-w-[30px] text-center"
                >
                  {{ song.key }}
                </div>
                <div
                  class="bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-900/30"
                >
                  {{ song.rhythm }}
                </div>
              </div>
            </div>
          </Card>
        </template>
      </div>
    </section>

    <!-- --- ARTIST SCROLL (Snap Scrolling) --- -->
    <section
      class="py-16 bg-surface-card/50 backdrop-blur-sm border-y border-white dark:border-white/5"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <Typography variant="h2" class="font-bold">Featured Artists</Typography>
          <a
            href="#"
            class="text-text-accent font-bold text-sm flex items-center hover:underline group"
          >
            View All
            <ArrowRight
              class="w-4 h-4 ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition rtl:rotate-180"
            />
          </a>
        </div>

        <div class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          <div
            v-for="(artist, i) in artists"
            :key="i"
            class="flex flex-col items-center flex-shrink-0 group cursor-pointer snap-center"
          >
            <div
              class="w-28 h-28 rounded-full bg-gradient-to-br p-[3px] mb-3 group-hover:scale-110 transition duration-300 shadow-lg relative"
              :class="artist.color"
            >
              <div
                class="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden relative"
              >
                <!-- Placeholder for Avatar Image -->
                <div class="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
              </div>
              <!-- Online Status Dot -->
              <div
                class="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"
              ></div>
            </div>
            <span
              class="font-bold text-text-primary group-hover:text-text-accent transition text-lg"
              >{{ artist.name }}</span
            >
            <span
              class="text-xs text-text-secondary font-medium bg-surface-card px-2 py-0.5 rounded-full shadow-sm mt-1"
              >12 Songs</span
            >
          </div>
        </div>
      </div>
    </section>

    <CommunitySection />

    <Footer />
  </div>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
