<template>
  <Select
    database="tab"
    collection="genre"
    optionLabelKey="title"
    :multiple="multiple"
    :block="block"
    :label="label"
    :placehoder="$t('genre.select-genre')"
    :value="value"
    @input="tempValue = $event"
  />
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
}
</script>