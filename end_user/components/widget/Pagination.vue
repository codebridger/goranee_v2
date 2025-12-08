<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '~/components/base/Button.vue'
import Typography from '~/components/base/Typography.vue'

const props = defineProps<{
	currentPage: number
	totalPages: number
}>()

const emit = defineEmits<{
	'page-change': [page: number]
}>()

const { t } = useI18n()

// Get page numbers for pagination UI
const pageNumbers = computed((): (number | string)[] => {
	const pages: (number | string)[] = []
	const maxVisible = 5

	if (props.totalPages <= maxVisible) {
		// Show all pages if total is less than max visible
		for (let i = 1; i <= props.totalPages; i++) {
			pages.push(i)
		}
	} else {
		// Always show first page
		pages.push(1)

		if (props.currentPage > 3) {
			pages.push('...')
		}

		// Show pages around current page
		const start = Math.max(2, props.currentPage - 1)
		const end = Math.min(props.totalPages - 1, props.currentPage + 1)

		for (let i = start; i <= end; i++) {
			if (i !== 1 && i !== props.totalPages) {
				pages.push(i)
			}
		}

		if (props.currentPage < props.totalPages - 2) {
			pages.push('...')
		}

		// Always show last page
		pages.push(props.totalPages)
	}

	return pages
})

const handlePageChange = (page: number) => {
	if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
		emit('page-change', page)
	}
}
</script>

<template>
	<div v-if="totalPages > 1" class="mt-8 flex flex-col items-center gap-4">
		<div class="flex items-center gap-2">
			<Button variant="secondary" size="sm" :disabled="currentPage === 1"
				@click="handlePageChange(currentPage - 1)">
				{{ t('pages.discovery.previous') }}
			</Button>

			<!-- Page Numbers -->
			<div class="flex items-center gap-1">
				<button v-for="page in pageNumbers" :key="page" :class="[
					'px-3 py-1.5 rounded-lg text-sm font-bold transition-colors',
					page === currentPage
						? 'bg-text-accent text-white'
						: 'bg-surface-card text-text-secondary hover:bg-surface-base hover:text-text-primary',
				]" :disabled="page === '...'" @click="typeof page === 'number' && handlePageChange(page)">
					{{ page }}
				</button>
			</div>

			<Button variant="secondary" size="sm" :disabled="currentPage >= totalPages"
				@click="handlePageChange(currentPage + 1)">
				{{ t('pages.discovery.next') }}
			</Button>
		</div>
		<Typography variant="caption" class="text-text-secondary">
			{{ t('pages.discovery.page') }} {{ currentPage }} {{ t('common.of') }} {{ totalPages }}
		</Typography>
	</div>
</template>
