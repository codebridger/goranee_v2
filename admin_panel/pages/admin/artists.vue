<template>
  <collection-viewer
    database="tab"
    collection="artist"
    :fields="fields"
    :title="$t('artist.artists')"
  />
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
        },
        {
          key: 'name_seo',
          type: 'seo',
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