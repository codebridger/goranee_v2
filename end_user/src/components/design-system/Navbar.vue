<script setup lang="ts">
import { ref } from 'vue';
import { Search, Menu, User } from 'lucide-vue-next';
import Button from './Button.vue';
import Input from './Input.vue';

const isMenuOpen = ref(false);
</script>

<template>
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-surface-glass border-b border-border-subtle px-6 py-4 flex justify-between items-center transition-all duration-300">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold shadow-lg">G</div>
      <span class="text-2xl font-black tracking-tighter text-text-primary">Goranee</span>
    </div>

    <!-- Search (Desktop) -->
    <div class="hidden md:block w-96">
      <Input placeholder="Search for songs, artists..." :icon="Search" />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <button class="hidden md:block text-sm font-semibold text-text-primary hover:text-text-accent transition">Log In</button>
      <Button variant="primary" size="sm">Explore</Button>
      <button class="md:hidden text-text-primary" @click="isMenuOpen = !isMenuOpen">
        <Menu class="w-6 h-6" />
      </button>
    </div>
  </nav>
</template>
