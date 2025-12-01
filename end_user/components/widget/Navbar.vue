<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Menu, X, ArrowRight, Loader2, Music } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import Input from '../base/Input.vue'
import { useTabService } from '~/composables/useTabService'
import type { SongWithPopulatedRefs } from '~/types/song.type'

export interface NavLink {
  label: string
  to: string
}

const props = withDefaults(
  defineProps<{
    logo?: string
    searchPlaceholder?: string
    links?: NavLink[]
    loginText?: string
    exploreText?: string
    isTransparent?: boolean
  }>(),
  {
    logo: 'Goranee',
    searchPlaceholder: 'Search for songs, artists...',
    loginText: 'Log In',
    exploreText: 'Explore',
    isTransparent: false,
  },
)

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const tabService = useTabService()

const navLinks = computed(() => props.links || [])
const isMenuOpen = ref(false)

// Search State
const searchQuery = ref('')
const searchResults = ref<SongWithPopulatedRefs[]>([])
const isSearching = ref(false)
const showResults = ref(false)

// Watch route change to close menu
watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
    showResults.value = false
  }
)

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
      searchResults.value = await tabService.searchSongs(searchQuery.value)
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
    isMenuOpen.value = false
  }
}

const goToSong = (id: string) => {
  router.push(`/songs/${id}`)
  showResults.value = false
  isMenuOpen.value = false
}

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav :class="[
    'z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 relative',
    isTransparent
      ? 'bg-transparent border-b border-transparent'
      : 'backdrop-blur-md bg-surface-glass border-b border-border-subtle'
  ]">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2 group">
      <div
        class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
        G
      </div>
      <span :class="['text-2xl font-black tracking-tighter', isTransparent ? 'text-white' : 'text-text-primary']">{{
        logo }}</span>
    </NuxtLink>

    <!-- Search (Desktop) -->
    <div class="hidden md:block w-96 relative group">
      <div v-if="isTransparent" class="relative">
        <div
          class="absolute start-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors pointer-events-none">
          <Search class="w-5 h-5" />
        </div>
        <input type="text" v-model="searchQuery" @input="performSearch" @keydown.enter="handleSearchSubmit"
          :placeholder="searchPlaceholder"
          class="w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-full py-3 px-6 ps-12 text-white placeholder-white/50 outline-none transition-all duration-300" />
      </div>
      <div v-else class="relative">
        <Input v-model="searchQuery" @input="performSearch" @keydown.enter="handleSearchSubmit"
          :placeholder="searchPlaceholder" :icon="Search" />
      </div>

      <!-- Search Dropdown -->
      <div v-if="showResults && searchQuery.length >= 2"
        class="absolute top-full mt-2 left-0 right-0 bg-surface-card border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
        <div v-if="isSearching" class="p-4 flex justify-center text-text-secondary">
          <Loader2 class="w-6 h-6 animate-spin" />
        </div>
        <div v-else-if="searchResults.length > 0">
          <div v-for="song in searchResults" :key="song._id" @click="song._id && goToSong(song._id)"
            class="p-3 hover:bg-surface-base cursor-pointer border-b border-border-subtle last:border-0 flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-surface-base flex items-center justify-center shrink-0">
              <Music v-if="!song.image" class="w-5 h-5 text-text-secondary" />
              <img v-else :src="tabService.getImageUrl(song.image)" class="w-full h-full object-cover rounded" />
            </div>
            <div>
              <div class="font-bold text-sm text-text-primary">{{ song.title }}</div>
              <div class="text-xs text-text-secondary">{{ song.artists?.[0]?.name }}</div>
            </div>
          </div>
          <div @click="handleSearchSubmit"
            class="p-3 text-center text-xs font-bold text-text-accent cursor-pointer hover:bg-surface-base">
            {{ t('navbar.viewAllResults') }}
          </div>
        </div>
        <div v-else class="p-4 text-center text-text-secondary text-sm">
          {{ t('navbar.noResults', { query: searchQuery }) }}
        </div>
      </div>
    </div>

    <!-- Navigation Links (Desktop) -->
    <div :class="['hidden lg:flex gap-6 text-sm font-bold', isTransparent ? 'text-white' : 'text-text-primary']">
      <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="transition-colors relative py-1" :class="[
        isActive(link.to) ? 'text-text-accent' : 'hover:text-text-accent'
      ]">
        {{ link.label }}
        <span v-if="isActive(link.to)"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-text-accent rounded-full"></span>
      </NuxtLink>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/login"
        :class="['hidden md:block text-sm font-semibold hover:text-text-accent transition cursor-pointer', isTransparent ? 'text-white' : 'text-text-primary']">
        {{ loginText }}
      </NuxtLink>
      <Button variant="primary" size="sm" to="/discovery">{{ exploreText }}</Button>
      <button :class="['md:hidden cursor-pointer', isTransparent ? 'text-white' : 'text-text-primary']"
        @click="isMenuOpen = !isMenuOpen">
        <Menu class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile Menu Drawer -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isMenuOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-60" @click="isMenuOpen = false">
        </div>
      </Transition>

      <Transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="ltr:-translate-x-full rtl:translate-x-full" enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in" leave-from-class="translate-x-0"
        leave-to-class="ltr:-translate-x-full rtl:translate-x-full">
        <div v-if="isMenuOpen"
          class="fixed top-0 bottom-0 start-0 w-[80%] max-w-sm bg-surface-card shadow-2xl z-70 p-6 flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold">G
              </div>
              <span class="text-xl font-black tracking-tighter text-text-primary">{{ logo }}</span>
            </div>
            <button @click="isMenuOpen = false" class="text-text-secondary hover:text-text-primary">
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Mobile Search -->
          <div class="mb-8 relative">
            <Input v-model="searchQuery" @input="performSearch" @keydown.enter="handleSearchSubmit"
              :placeholder="searchPlaceholder" :icon="Search" />
            <!-- Mobile Search Results -->
            <div v-if="showResults && searchQuery.length >= 2"
              class="absolute top-full mt-2 left-0 right-0 bg-surface-base border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              <div v-if="isSearching" class="p-4 flex justify-center text-text-secondary">
                <Loader2 class="w-5 h-5 animate-spin" />
              </div>
              <div v-else-if="searchResults.length > 0">
                <div v-for="song in searchResults" :key="song._id" @click="song._id && goToSong(song._id)"
                  class="p-3 hover:bg-surface-card cursor-pointer border-b border-border-subtle last:border-0 text-sm font-medium text-text-primary">
                  {{ song.title }}
                </div>
                <div @click="handleSearchSubmit"
                  class="p-3 text-center text-xs font-bold text-text-accent cursor-pointer hover:bg-surface-card">
                  {{ t('navbar.viewAllResults') }}
                </div>
              </div>
              <div v-else class="p-4 text-center text-text-secondary text-sm">
                {{ t('navbar.noResults', { query: searchQuery }) }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
              class="text-lg font-bold px-4 py-3 rounded-xl transition-colors flex justify-between items-center" :class="[
                isActive(link.to) ? 'bg-surface-base text-text-accent' : 'text-text-primary hover:bg-surface-base'
              ]">
              {{ link.label }}
              <ArrowRight v-if="isActive(link.to)" class="w-4 h-4 rtl:rotate-180" />
            </NuxtLink>
          </div>

          <div class="mt-auto pt-8 border-t border-border-subtle">
            <Button variant="primary" block to="/discovery">{{ exploreText }}</Button>
            <NuxtLink to="/login" class="block text-center mt-4 font-bold text-text-secondary hover:text-text-primary">
              {{ loginText }}
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>
