<template>
  <div>
    <vs-select
      :loading="pending"
      :multiple="multiple"
      :key="list.length"
      :label="label"
      :placehoder="placehoder"
      :block="block"
      :value="value"
      @input="tempValue = $event"
    >
      <slot v-bind:list="list">
        <vs-option
          v-for="(item, i) in list"
          :key="i"
          :label="item[optionLabelKey]"
          :value="item._id"
        >
          {{ item[optionLabelKey] }}
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
    multiple: { type: Boolean, default: true },
    value: { default: () => [] },
    block: Boolean,
    label: String,
    placehoder: String,
    optionLabelKey: { type: String, default: '' },
    database: String,
    collection: String,
  },
  data() {
    return {
      list: [],
      pending: false,
      tempValue: '',
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newValue) {
        this.value = newValue
      },
    },
    tempValue(value) {
      if (this.multiple) {
        this.$emit(
          'input',
          value.filter((item) => item.length > 0)
        )
      } else this.$emit('input', value)
    },
  },
  created() {
    this.loadItems()
  },
  methods: {
    loadItems() {
      this.pending = true
      dataProvider
        .find({
          database: this.database,
          collection: this.collection,
          query: {},
        })
        .then((list) => (this.list = list))
        .catch(({ error }) => {
          notifier.toast({
            label: `Load ${this.collection} error`,
            description: error,
            type: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },
  },
}
</script>

<style>
</style>