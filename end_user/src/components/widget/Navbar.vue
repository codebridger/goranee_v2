<script setup lang="ts">
import { ref } from 'vue'
import { Search, Menu } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import Input from '../base/Input.vue'

export interface NavLink {
  label: string
  to: string
}

const props = defineProps<{
  links?: NavLink[]
}>()

const defaultLinks: NavLink[] = [
  { label: 'Discovery', to: '/discovery' },
  { label: 'Artists', to: '/artists' },
  { label: 'Community', to: '/community' },
]

const navLinks = props.links || defaultLinks
const isMenuOpen = ref(false)
</script>

<template>
  <nav
    class="sticky top-0 z-50 backdrop-blur-md bg-surface-glass border-b border-border-subtle px-6 py-4 flex justify-between items-center transition-all duration-300"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold shadow-lg"
      >
        G
      </div>
      <span class="text-2xl font-black tracking-tighter text-text-primary">Goranee</span>
    </div>

    <!-- Search (Desktop) -->
    <div class="hidden md:block w-96">
      <Input placeholder="Search for songs, artists..." :icon="Search" />
    </div>

    <!-- Navigation Links (Desktop) -->
    <div class="hidden lg:flex gap-6 text-sm font-bold text-text-primary">
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
        class="hidden md:block text-sm font-semibold text-text-primary hover:text-text-accent transition cursor-pointer"
      >
        Log In
      </button>
      <Button variant="primary" size="sm">Explore</Button>
      <button class="md:hidden text-text-primary cursor-pointer" @click="isMenuOpen = !isMenuOpen">
        <Menu class="w-6 h-6" />
      </button>
    </div>
  </nav>
</template>
