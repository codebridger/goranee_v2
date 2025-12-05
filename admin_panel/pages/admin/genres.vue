<template>
  <collection-viewer
    database="tab"
    collection="genre"
    :fields="fields"
    :title="$t('genre.genres')"
  />
</template>

<script>
export default {
  middleware: ['auth'],
  data() {
    return {
      fields: [
        {
          key: 'title',
          label: this.$t('genre.title'),
          type: 'string',
        },
        {
          key: 'title_seo',
          type: 'seo',
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