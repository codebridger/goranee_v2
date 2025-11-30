<script setup lang="ts">
import { ref } from 'vue'
import { Search, Menu } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import Input from '../base/Input.vue'

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

const navLinks = props.links || []
const isMenuOpen = ref(false)
</script>

<template>
  <nav
    :class="[
      'z-50 px-6 py-4 flex justify-between items-center transition-all duration-300',
      isTransparent 
        ? 'bg-transparent border-b border-transparent' 
        : 'sticky top-0 backdrop-blur-md bg-surface-glass border-b border-border-subtle'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold shadow-lg"
      >
        G
      </div>
      <span :class="['text-2xl font-black tracking-tighter', isTransparent ? 'text-white' : 'text-text-primary']">{{ logo }}</span>
    </div>

    <!-- Search (Desktop) -->
    <div class="hidden md:block w-96">
      <div v-if="isTransparent" class="relative group">
        <div class="absolute start-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors">
          <Search class="w-5 h-5" />
        </div>
        <input
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-full py-3 px-6 ps-12 text-white placeholder-white/50 outline-none transition-all duration-300"
        />
      </div>
      <Input v-else :placeholder="searchPlaceholder" :icon="Search" />
    </div>

    <!-- Navigation Links (Desktop) -->
    <div :class="['hidden lg:flex gap-6 text-sm font-bold', isTransparent ? 'text-white' : 'text-text-primary']">
      <a
        v-for="link in navLinks"
        :key="link.to"
        :href="link.to"
        class="hover:text-text-accent transition-colors cursor-pointer"
      >
        {{ link.label }}
      </a>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <button
        :class="['hidden md:block text-sm font-semibold hover:text-text-accent transition cursor-pointer', isTransparent ? 'text-white' : 'text-text-primary']"
      >
        {{ loginText }}
      </button>
      <Button variant="primary" size="sm">{{ exploreText }}</Button>
      <button :class="['md:hidden cursor-pointer', isTransparent ? 'text-white' : 'text-text-primary']" @click="isMenuOpen = !isMenuOpen">
        <Menu class="w-6 h-6" />
      </button>
    </div>
  </nav>
</template>
