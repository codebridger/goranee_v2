<template>
  <collection-viewer database="chord" collection="rhythm" :fields="fields" :title="$t('rhythm.rhythms')" />
</template>

<script>
import TextareaField from '~/components/inputs/TextareaField.vue'

export default {
  components: { TextareaField },
  middleware: ['auth'],
  data() {
    return {
      fields: [
        {
          key: 'title',
          label: this.$t('rhythm.title'),
          type: 'string',
        },
        // {
        //   key: 'description',
        //   label: this.$t('rhythm.description'),
        //   type: 'string',
        //   inputComponent: TextareaField,
        //   placeholder: this.$t('rhythm.description') || 'Description',
        // },
      ],
    }
  },
}
</script>
