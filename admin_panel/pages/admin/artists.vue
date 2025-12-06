<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t('artist.artists') }}</h2>
      <vs-button to="/admin/artist/new">{{ $t('add') }}</vs-button>
    </div>

    <collection-viewer database="tab" collection="artist" :fields="fields" :title="''" :allow-add="false"
      :custom-edit-route="(id) => `/admin/artist/${id}`" />
  </div>
</template>

<script>
export default {
  middleware: ['auth'],
  data() {
    return {
      fields: [
        {
          key: 'name',
          label: this.$t('artist.artists'),
          type: 'string',
          mutate: (row) => {
            // Extract name from content object (new structure)
            if (row.content) {
              const defaultLang = row.defaultLang || 'ckb-IR'
              return row.content[defaultLang]?.name || row.content['ckb-IR']?.name || ''
            }
            // Fallback to old structure
            return row.name || ''
          },
        },
        {
          key: 'name_seo',
          type: 'seo',
          mutate: (row) => {
            // Extract name_seo from content object (new structure)
            if (row.content) {
              const defaultLang = row.defaultLang || 'ckb-IR'
              return row.content[defaultLang]?.name_seo || row.content['ckb-IR']?.name_seo || ''
            }
            // Fallback to old structure
            return row.name_seo || ''
          },
        },
        {
          key: 'songs',
          label: this.$t('artist.songs'),
          type: 'string',
          disable: true,
        },
        {
          key: 'image',
          label: this.$t('image-cover'),
          type: 'image'
        }
      ],
    }
  },
}
</script>