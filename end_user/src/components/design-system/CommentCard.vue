<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	username: string;
	timestamp: string;
	comment: string;
	avatarUrl?: string;
}>();

const avatarStyle = computed(() => {
	if (props.avatarUrl) {
		return {
			backgroundImage: `url(${props.avatarUrl})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		};
	}
	return {};
});
</script>

<template>
	<div class="rounded-3xl p-6 shadow-sm border flex gap-4 items-start bg-surface-card border-border-subtle">
		<div class="w-10 h-10 rounded-full flex-shrink-0 border-2 shadow-sm bg-gray-200 dark:bg-gray-700 border-white dark:border-gray-600"
			:style="avatarStyle">
		</div>
		<div>
			<div class="flex items-baseline gap-2 mb-1">
				<span class="font-bold text-sm text-text-primary">{{ username }}</span>
				<span class="text-xs text-text-secondary">{{ timestamp }}</span>
			</div>
			<div
				class="p-3 rounded-te-2xl rounded-be-2xl rounded-bs-2xl text-sm leading-snug border bg-surface-base border-border-subtle text-text-secondary">
				{{ comment }}
			</div>
		</div>
	</div>
</template>
