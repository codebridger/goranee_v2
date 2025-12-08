<template>
  <Select
    database="chord"
    collection="type"
    optionLabelKey="title"
    :multiple="multiple"
    :block="block"
    :label="label"
    :placehoder="$t('chord.select-type')"
    :value="value"
    @input="tempValue = $event"
  >
    <template v-slot="{ list }">
      <vs-option
        v-for="(item, i) in list"
        :key="i"
        :label="item.title"
        :value="item._id"
      >
        <div style="line-height:10px">
          <span class="text-xs">{{ item.title }}</span
          >
          <span style="font-size:9px">{{ item.description | '' }}</span>
        </div>
      </vs-option>
    </template>
  </Select>
</template>

<script>
export default {
  props: {
    multiple: { type: Boolean, default: false },
    block: { type: Boolean, default: true },
    value: { default: () => '' },
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