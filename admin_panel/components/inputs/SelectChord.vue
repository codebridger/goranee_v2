<template>
  <div>
    <vs-select
      :loading="pending"
      :key="list.length"
      :label="label"
      :placehoder="placehoder"
      :block="block"
      :value="value"
      filter
      @input="tempValue = $event"
    >
      <slot v-bind:list="list">
        <vs-option
          v-for="(item, i) in list"
          :key="i"
          :label="item.title"
          :value="item._id"
        >
          {{ item.title }}
        </vs-option>
      </slot>
    </vs-select>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../utilities/notifier'

export default {
  props: {
    value: { default: () => [] },
    block: Boolean,
    label: String,
    placehoder: String,
    list: { type: Array, default: () => [] },
    pending: { type: Boolean, default: false },
  },
  data() {
    return {
      tempValue: '',
    }
  },
  watch: {
    // value: {
    //   immediate: true,
    //   deep: true,
    //   handler(newValue) {
    //     this.tempValue = newValue
    //   },
    // },
    tempValue(value) {
      if (this.multiple) {
        this.$emit(
          'input',
          value.filter((item) => item.length > 0)
        )
      } else this.$emit('input', value)
    },
  },
}
</script>