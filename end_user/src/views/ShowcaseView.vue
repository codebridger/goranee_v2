<script setup lang="ts">
import { ref } from 'vue';
import { Play, Heart, User, Music, ArrowRight, ToggleLeft, ToggleRight, Moon, Sun } from 'lucide-vue-next';
import Typography from '../components/design-system/Typography.vue';
import Button from '../components/design-system/Button.vue';
import Input from '../components/design-system/Input.vue';
import Card from '../components/design-system/Card.vue';
import Navbar from '../components/design-system/Navbar.vue';

const isDark = ref(false);
const isRTL = ref(false);

const toggleTheme = () => {
	isDark.value = !isDark.value;
	if (isDark.value) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
};

const toggleDirection = () => {
	isRTL.value = !isRTL.value;
	document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr';
};

const featuredSongs = [
	{ title: "Xam", artist: "Zakaria", key: "Cm", rhythm: "Slow 6/8", img: "purple" },
	{ title: "Gule", artist: "Hassan", key: "Am", rhythm: "Kurdish 7/8", img: "pink" },
];

const artists = [
	{ name: "Zakaria", color: "from-pink-500 to-rose-500" },
	{ name: "Dashni", color: "from-purple-500 to-indigo-500" },
];
</script>

<template>
	<div class="min-h-screen bg-surface-base text-text-primary transition-colors duration-300 font-sans">
		<Navbar />

		<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
			<button @click="toggleTheme"
				class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition">
				<Moon v-if="!isDark" class="w-6 h-6" />
				<Sun v-else class="w-6 h-6" />
			</button>
			<button @click="toggleDirection"
				class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition font-bold text-xs">
				{{ isRTL ? 'LTR' : 'RTL' }}
			</button>
		</div>

		<main class="max-w-7xl mx-auto px-6 py-12 space-y-16">
			<!-- Typography Section -->
			<section class="space-y-6">
				<div class="border-b border-border-subtle pb-4">
					<Typography variant="h2">Typography</Typography>
				</div>
				<div class="space-y-4">
					<Typography variant="h1">Heading 1 (Hero)</Typography>
					<Typography variant="h2">Heading 2 (Section)</Typography>
					<Typography variant="h3">Heading 3 (Card)</Typography>
					<Typography variant="body">Body text: The quick brown fox jumps over the lazy dog. Multi-script
						support is mandatory.</Typography>
					<Typography variant="caption">Caption Text</Typography>
				</div>
			</section>

			<!-- Buttons Section -->
			<section class="space-y-6">
				<div class="border-b border-border-subtle pb-4">
					<Typography variant="h2">Buttons</Typography>
				</div>
				<div class="flex flex-wrap gap-4 items-center">
					<Button variant="primary" size="lg">Primary Large</Button>
					<Button variant="primary" size="md">Primary Medium</Button>
					<Button variant="primary" size="sm">Primary Small</Button>
					<Button variant="secondary">Secondary Button</Button>
					<Button variant="primary" disabled>Disabled</Button>
				</div>
			</section>

			<!-- Inputs Section -->
			<section class="space-y-6">
				<div class="border-b border-border-subtle pb-4">
					<Typography variant="h2">Inputs</Typography>
				</div>
				<div class="grid md:grid-cols-2 gap-6">
					<Input label="Username" placeholder="Enter your username" :icon="User" />
					<Input label="Search" placeholder="Search songs..." :icon="Music" />
				</div>
			</section>

			<!-- Cards Section -->
			<section class="space-y-6">
				<div class="border-b border-border-subtle pb-4">
					<Typography variant="h2">Cards</Typography>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					<!-- Song Cards -->
					<Card v-for="(song, i) in featuredSongs" :key="i" variant="song" hoverable>
						<div
							class="h-48 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 mb-4 relative overflow-hidden shadow-inner group">
							<div
								class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm">
								<div
									class="w-14 h-14 rounded-full bg-grad-primary flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300">
									<Play class="w-6 h-6 text-white fill-current ml-1" />
								</div>
							</div>
						</div>
						<div class="flex justify-between items-start">
							<div>
								<Typography variant="h3" class="mb-1">{{ song.title }}</Typography>
								<Typography variant="caption" class="text-text-secondary normal-case">{{ song.artist }}
								</Typography>
							</div>
							<div class="flex flex-col items-end gap-1">
								<div
									class="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 min-w-[30px] text-center">
									{{ song.key }}
								</div>
							</div>
						</div>
					</Card>

					<!-- Artist Cards -->
					<div v-for="(artist, i) in artists" :key="i" class="flex flex-col items-center">
						<div
							class="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[3px] mb-3 hover:scale-110 transition duration-300 shadow-lg relative cursor-pointer">
							<div
								class="w-full h-full bg-gray-200 rounded-full border-4 border-white overflow-hidden relative">
								<div class="absolute inset-0 bg-gray-300 animate-pulse"></div>
							</div>
						</div>
						<Typography variant="h3" class="text-center">{{ artist.name }}</Typography>
					</div>
				</div>
			</section>
		</main>
	</div>
</template>
