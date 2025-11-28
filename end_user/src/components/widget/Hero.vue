<script setup lang="ts">
import { Music, Play } from 'lucide-vue-next';
import Typography from '../base/Typography.vue';
import Button from '../base/Button.vue';

const props = withDefaults(
  defineProps<{
    badge?: string
    title?: string
    titleHighlight?: string
    titleLine2?: string
    description?: string
    startPlayingText?: string
    submitChordText?: string
    featuredArtistLabel?: string
    featuredArtistName?: string
    trendingNowLabel?: string
    trendingSongTitle?: string
  }>(),
  {
    badge: 'The #1 Kurdish Chords Platform',
    title: 'Play the',
    titleHighlight: 'Melody',
    titleLine2: 'Feel the Rhythm.',
    description: 'Access thousands of chords, lyrics, and authentic Kurdish rhythms. Join the community of musicians today.',
    startPlayingText: 'Start Playing',
    submitChordText: 'Submit Chord',
    featuredArtistLabel: 'Featured Artist',
    featuredArtistName: 'Zakaria',
    trendingNowLabel: 'Trending Now',
    trendingSongTitle: 'Bo Kurdistan',
  },
)
</script>

<template>
	<header
		class="relative px-6 py-12 md:py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-hidden">
		<div class="flex-1 space-y-6 z-10">
			<div
				class="inline-block px-4 py-1 rounded-full bg-text-accent/10 dark:bg-text-accent/20 text-text-accent dark:text-text-accent/90 text-xs font-bold tracking-wide uppercase mb-2 animate-fade-in-up">
				{{ badge }}
			</div>
			<Typography variant="h1" class="leading-tight">
				{{ title }} <span class="text-transparent bg-clip-text bg-grad-primary">{{ titleHighlight }}</span> <br />
				{{ titleLine2 }}
			</Typography>
			<Typography variant="body" class="text-text-secondary max-w-md">
				{{ description }}
			</Typography>
			<div class="flex gap-4 pt-4">
				<Button variant="primary" size="lg" class="flex items-center gap-2 hover:scale-105 transition">
					<Music class="w-5 h-5" /> {{ startPlayingText }}
				</Button>
				<Button variant="secondary" size="lg"
					class="shadow-md border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm">
					{{ submitChordText }}
				</Button>
			</div>
		</div>

		<!-- Visual: Featured Artist Cutout Style -->
		<div class="flex-1 relative w-full h-80 md:h-[500px] flex items-center justify-center">
			<!-- Background Glow -->
			<div
				class="absolute inset-0 bg-gradient-to-tr from-text-accent/20 to-purple-200 dark:from-text-accent/20 dark:to-purple-900/20 rounded-full blur-3xl opacity-50 animate-pulse">
			</div>

			<!-- Artist Cutout Representation -->
			<div class="relative z-10 w-full max-w-md h-full flex items-end justify-center">
				<div
					class="w-64 h-80 md:w-80 md:h-96 bg-gray-900 rounded-t-[10rem] rounded-b-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-text-accent">
					<div class="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900"></div>
					<!-- Simulated Image -->
					<div
						class="absolute inset-0 flex items-center justify-center text-white/10 font-black text-9xl select-none overflow-hidden">
						ARTIST
					</div>
					<div
						class="absolute bottom-0 start-0 end-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pt-20">
						<p class="text-xs text-text-accent/80 font-bold uppercase tracking-wider mb-1">{{ featuredArtistLabel }}</p>
						<h3 class="text-3xl font-bold">{{ featuredArtistName }}</h3>
					</div>
				</div>
			</div>

			<!-- Floating 'Now Playing' Card -->
			<div class="absolute bottom-10 -start-4 md:start-0 bg-surface-glass backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border border-white/50 dark:border-white/10"
				style="animation-duration: 3s">
				<div
					class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
					<Play class="w-5 h-5 fill-current" />
				</div>
				<div>
					<p class="text-[10px] text-text-secondary font-bold uppercase tracking-wide">{{ trendingNowLabel }}</p>
					<p class="text-sm font-bold text-text-primary">{{ trendingSongTitle }}</p>
				</div>
			</div>
		</div>
	</header>
</template>
