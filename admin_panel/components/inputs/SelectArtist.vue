<template>
  <Select
    database="tab"
    collection="artist"
    optionLabelKey="name"
    :multiple="multiple"
    :block="block"
    :label="label"
    :placehoder="$t('artist.select-artist')"
    :value="value"
    @input="tempValue = $event"
  >
    <template slot-scope="{ list }">
      <vs-option
        v-for="(item, i) in list"
        :key="i"
        :label="getArtistName(item)"
        :value="item._id"
      >
        {{ getArtistName(item) }}
      </vs-option>
    </template>
  </Select>
</template>

<script>
export default {
  props: {
    multiple: { type: Boolean, default: true },
    block: Boolean,
    value: { default: () => [] },
    label: String,
  },
  data() {
    return {
      tempValue: '',
    }
  },
  watch: {
    tempValue(value) {
      this.$emit('input', value)
    },
  },
  methods: {
    getArtistName(artist) {
      // Extract name from content object (new structure)
      if (artist && artist.content) {
        const defaultLang = artist.defaultLang || 'ckb-IR'
        return artist.content[defaultLang]?.name || artist.content['ckb-IR']?.name || ''
      }
      // Fallback to old structure
      return artist?.name || ''
    },
  },
}
</script>