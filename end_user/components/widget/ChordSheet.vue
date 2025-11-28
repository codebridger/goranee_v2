<script setup lang="ts">
export interface ChordLine {
	chord?: string;
	lyrics: string;
}

const props = defineProps<{
	lines: ChordLine[];
	chordColor?: string;
}>();

const chordColorClass = props.chordColor || 'text-[#FF2E93]';
</script>

<template>
	<div class="rounded-2xl p-6 border bg-surface-base border-border-subtle">
		<span class="text-xs text-text-accent font-bold uppercase mb-4 block">Chord Sheet Preview</span>
		<div class="font-mono text-lg space-y-4">
			<div v-for="(line, index) in lines" :key="index">
				<span v-if="line.chord" class="font-bold" :class="chordColorClass">[{{ line.chord }}]</span>
				<span class="text-text-primary"> {{ line.lyrics }}</span>
			</div>
		</div>
	</div>
</template>
