<script setup lang="ts">
import { Minus, Plus, Play, Settings } from 'lucide-vue-next';
</script>

<template>
	<div
		class="px-2 py-2 rounded-full shadow-2xl flex items-center gap-1 border backdrop-blur-xl bg-surface-card border-border-subtle">
		<!-- Tool: Transpose -->
		<div class="flex items-center gap-2 px-3 border-e border-border-subtle">
			<span class="text-[10px] opacity-60 uppercase font-bold tracking-wider text-text-secondary">Key</span>
			<button
				class="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-surface-base text-text-primary cursor-pointer">
				<Minus class="w-4 h-4" />
			</button>
			<span class="font-mono font-bold text-text-accent w-6 text-center">Am</span>
			<button
				class="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-surface-base text-text-primary cursor-pointer">
				<Plus class="w-4 h-4" />
			</button>
		</div>

		<!-- Tool: Autoscroll -->
		<div class="flex items-center gap-2 px-3 border-e border-border-subtle">
			<span class="text-[10px] opacity-60 uppercase font-bold tracking-wider text-text-secondary">Scroll</span>
			<button
				class="w-8 h-8 rounded-full bg-text-accent hover:bg-text-accent/90 flex items-center justify-center shadow-lg transition cursor-pointer">
				<Play class="w-4 h-4 fill-white ms-0.5 text-white" />
			</button>
		</div>

		<!-- Tool: Settings -->
		<div class="px-2">
			<button
				class="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-surface-base text-text-secondary hover:text-text-primary cursor-pointer">
				<Settings class="w-4 h-4" />
			</button>
		</div>
	</div>
</template>
