<script setup lang="ts">
import type { Artist } from '~/types/song.type';
import { ROUTES } from '~/constants/routes';

interface Props {
  title: string
  artist?: Artist
  rhythm?: string
  originalKey?: string
  image?: string
  difficulty?: string
}

defineProps<Props>()

// Helper for safe image URL
const getArtistImage = (artist?: Artist) => {
  // In a real app, we'd resolve the file URL properly
  return 'https://placehold.co/1200x400/130A12/FF2E93?text=' + (artist?.name || 'Artist')
}
</script>

<template>
  <div class="relative w-full h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center">
    <!-- Background Image with Blur -->
    <div 
      class="absolute inset-0 bg-cover bg-center z-0 blur-xl opacity-60 scale-110"
      :style="{ backgroundImage: `url(${image || getArtistImage(artist)})` }"
    ></div>
    
    <!-- Dark Overlay -->
    <div class="absolute inset-0 bg-black/50 z-10"></div>

    <!-- Content -->
    <div class="relative z-20 text-center px-4 max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
        {{ title }}
      </h1>
      
      <NuxtLink 
        v-if="artist" 
        :to="ROUTES.ARTIST.DETAIL(artist._id)"
        class="text-xl md:text-2xl text-gray-200 hover:text-primary transition-colors mb-6 inline-block"
      >
        {{ artist.name }}
      </NuxtLink>

      <div class="flex flex-wrap justify-center gap-3 mb-8">
        <span v-if="rhythm" class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white">
          {{ rhythm }}
        </span>
        <span v-if="originalKey" class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white">
          Key: {{ originalKey }}
        </span>
         <span v-if="difficulty" class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white">
          {{ difficulty }}
        </span>
      </div>

      <div class="flex justify-center gap-4">
        <button class="transition-transform active:scale-95 font-medium bg-[#FF2E93] hover:bg-[#ff5ca6] text-white border-none shadow-[0_0_15px_rgba(255,46,147,0.5)] rounded-full px-8 py-3 flex items-center gap-2">
          <span>▶ Play Audio</span>
        </button>
        <button class="transition-transform active:scale-95 font-medium rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-3">
          ♥
        </button>
      </div>
    </div>
  </div>
</template>

