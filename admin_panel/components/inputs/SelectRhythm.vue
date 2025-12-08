<template>
  <Select
    database="chord"
    collection="rhythm"
    optionLabelKey="title"
    :multiple="multiple"
    :block="block"
    :label="label"
    :placehoder="$t('rhythm.select-rhythm')"
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
      tempValue: [],
    }
  },
  watch: {
    tempValue(value) {
      this.$emit('input', value)
    },
  },
}
</script>

