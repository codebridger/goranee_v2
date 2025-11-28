<script setup lang="ts">
import Typography from './Typography.vue';
</script>

<template>
	<div class="rounded-3xl p-6 shadow-sm border flex gap-4 items-start bg-surface-card border-border-subtle">
		<div
			class="w-10 h-10 rounded-full flex-shrink-0 border-2 shadow-sm bg-gray-200 dark:bg-gray-700 border-white dark:border-gray-600">
		</div>
		<div>
			<div class="flex items-baseline gap-2 mb-1">
				<span class="font-bold text-sm text-text-primary">MusicLover99</span>
				<span class="text-xs text-text-secondary">2h ago</span>
			</div>
			<div
				class="p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-sm leading-snug border bg-surface-base border-border-subtle text-text-secondary">
				"This is the most accurate version I've found! The bridge chords are spot on."
			</div>
		</div>
	</div>
</template>
