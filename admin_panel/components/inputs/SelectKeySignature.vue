<template>
  <Select
    database="chord"
    collection="keysignature"
    optionLabelKey="title"
    :multiple="false"
    :block="block"
    :label="label"
    :placehoder="$t('chord.select-keySignature')"
    :value="value"
    @input="tempValue = $event"
  >
    <template v-slot="{ list }">
      <vs-option
        v-for="(item, i) in list"
        :key="i"
        :label="item.major + ' ' + item.minor"
        :value="item._id"
      >
        {{ item.major + ' ' + item.minor }}
      </vs-option>
    </template>
  </Select>
</template>

<script>
export default {
  props: {
    block: Boolean,
    value: { default: () => [] },
    label: String,
  },
  data() {
    return { tempValue: '' }
  },
  watch: {
    tempValue(value) {
      this.$emit('input', value)
    },
  },
}
</script>