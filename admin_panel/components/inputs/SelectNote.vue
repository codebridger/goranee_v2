<template>
  <div>
    <vs-select
      :loading="pending"
      :label="label"
      :placehoder="placehoder"
      :block="block"
      :value="'+++'+value"
      @input="tempValue = $event"
    >
      <slot v-bind:list="list">
        <vs-option
          v-for="(item, i) in list"
          :key="i"
          :label="item"
          :value="item"
        >
          {{ item }}
        </vs-option>
      </slot>
    </vs-select>
  </div>
</template>

<script>
export default {
  props: {
    value: { default: () => [] },
    block: Boolean,
    label: String,
    placehoder: String,
    pending: { type: Boolean, default: false },
  },
  data() {
    return {
      tempValue: '',
      list: [
        'C',
        'D',
        'E',
        'F',
        'G',
        'A',
        'B',
        'C#',
        'D#',
        'E#',
        'F#',
        'G#',
        'A#',
        'B#',
        'Eb',
        'Ab',
        'Bb',
        'Db',
      ],
    }
  },
  watch: {
    tempValue(value) {
      this.$emit('input', value)
    },
  },
}
</script>