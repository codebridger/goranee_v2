<script setup lang="ts">
import { Clock, ArrowRight } from 'lucide-vue-next';
import Typography from './Typography.vue';
import Button from './Button.vue';
</script>

<template>
	<section class="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
		<!-- Comments/Activity -->
		<div
			class="bg-surface-card rounded-[2rem] p-8 shadow-lg border border-border-subtle relative overflow-hidden group hover:shadow-2xl transition duration-500">
			<div
				class="absolute top-0 right-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-pink-200 dark:group-hover:bg-pink-900/30 transition">
			</div>
			<Typography variant="h3" class="mb-6 flex items-center gap-2">
				<div class="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
					<Clock class="w-5 h-5" />
				</div>
				Just Happened
			</Typography>
			<div class="space-y-6">
				<div v-for="i in 3" :key="i"
					class="flex gap-4 items-start p-2 rounded-xl hover:bg-surface-base transition">
					<div
						class="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 border-2 border-white dark:border-white/10 shadow-sm">
					</div>
					<div>
						<p class="text-sm text-text-primary"><span class="font-bold">Alan88</span> commented on <span
								class="font-bold text-text-accent hover:underline cursor-pointer">Nazdar - Baran</span>
						</p>
						<div
							class="bg-surface-base p-2 rounded-tr-xl rounded-br-xl rounded-bl-xl mt-1 text-xs text-text-secondary italic border border-border-subtle">
							"The bridge chords sound perfect! Thanks for the update."
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div
			class="rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center bg-grad-primary shadow-2xl shadow-pink-500/20">
			<div class="relative z-10">
				<h3 class="text-3xl font-black mb-4">Join the Community</h3>
				<p class="text-pink-100 mb-8 max-w-sm leading-relaxed">
					Upload your own chords, request songs, and connect with other Kurdish musicians.
					<span class="block mt-2 font-bold text-white">Join 15,000+ members today.</span>
				</p>
				<button
					class="bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-pink-50 transition shadow-lg flex items-center gap-2 group">
					Create Free Account
					<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition" />
				</button>
			</div>
			<!-- Decorative circles -->
			<div
				class="absolute top-1/2 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-sm animate-pulse">
			</div>
			<div class="absolute bottom-0 right-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
		</div>
	</section>
</template>
