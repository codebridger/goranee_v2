<script setup lang="ts">
import { Share2, Mic } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    description?: string
    discoverTitle?: string
    discoverLinks?: {
      newArrivals?: string
      trendingCharts?: string
      featuredArtists?: string
      songRequests?: string
    }
    communityTitle?: string
    communityLinks?: {
      signUpLogin?: string
      submitChord?: string
      topContributors?: string
      discordServer?: string
    }
    legalTitle?: string
    legalLinks?: {
      privacyPolicy?: string
      termsOfService?: string
      dmcaGuidelines?: string
    }
    copyright?: string
    designSystem?: string
  }>(),
  {
    description: 'The ultimate platform for Kurdish music chords, lyrics, and community connections.',
    discoverTitle: 'Discover',
    discoverLinks: () => ({
      newArrivals: 'New Arrivals',
      trendingCharts: 'Trending Charts',
      featuredArtists: 'Featured Artists',
      songRequests: 'Song Requests',
    }),
    communityTitle: 'Community',
    communityLinks: () => ({
      signUpLogin: 'Sign Up / Login',
      submitChord: 'Submit Chord',
      topContributors: 'Top Contributors',
      discordServer: 'Discord Server',
    }),
    legalTitle: 'Legal',
    legalLinks: () => ({
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      dmcaGuidelines: 'DMCA Guidelines',
    }),
    copyright: '© 2025 Goranee.ir. All rights reserved.',
    designSystem: 'Design System: NeoBeat v1.1',
  },
)
</script>

<template>
	<footer class="bg-[#2A1B28] text-white pt-16 pb-8 px-6 mt-10 rounded-t-[3rem]">
		<div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
			<div>
				<div class="flex items-center gap-2 mb-4">
					<div
						class="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold">
						G</div>
					<h4 class="font-black text-2xl tracking-tighter">Goranee</h4>
				</div>
				<p class="text-gray-400 text-sm leading-relaxed">
					{{ description }}
				</p>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ discoverTitle }}</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">{{ discoverLinks.newArrivals }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ discoverLinks.trendingCharts }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ discoverLinks.featuredArtists }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ discoverLinks.songRequests }}</li>
				</ul>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ communityTitle }}</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">{{ communityLinks.signUpLogin }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ communityLinks.submitChord }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ communityLinks.topContributors }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ communityLinks.discordServer }}</li>
				</ul>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ legalTitle }}</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">{{ legalLinks.privacyPolicy }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ legalLinks.termsOfService }}</li>
					<li class="hover:text-white cursor-pointer transition">{{ legalLinks.dmcaGuidelines }}</li>
				</ul>
			</div>
		</div>
		<div
			class="text-center text-gray-600 text-xs border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
			<span>{{ copyright }}</span>
			<div class="flex gap-4">
				<div
					class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
					<Share2 class="w-4 h-4" />
				</div>
				<div
					class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
					<Mic class="w-4 h-4" />
				</div>
			</div>
			<span class="md:mt-0">{{ designSystem }}</span>
		</div>
	</footer>
</template>
