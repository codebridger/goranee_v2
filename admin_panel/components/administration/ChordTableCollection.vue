<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">Created Tables</h2>
      <vs-button @click="showAddForm">{{ $t('add') }}</vs-button>
    </div>

    <!-- Content -->
    <div class="p-8 mt-4 flex justify-between flex-wrap space-y-4">
      <card-chord-table
        v-for="(table, i) in list"
        allowEdite
        :key="i"
        :table="table"
        @edit="showEditForm(table)"
        @remove="showRemoveDialog(table)"
      />
    </div>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../utilities/notifier'
import CollectionForm from './ChordTableCollectionForm'

export default {
  props: {
    title: String,
  },

  data() {
    return {
      database: 'chord',
      collection: 'table',
      list: [],
      pending: false,
    }
  },

  created() {
    this.find()
  },

  computed: {
    findOption() {
      return {
        database: this.database,
        collection: this.collection,
        query: {},
        options: { sort: '-_id' },
        populates: [
          'keySignature',
          'type',
          'rows.major',
          'rows.naturalMinor',
          'rows.harmonicMinor',
          'rows.melodicMinor',
          'chromaticRows.one',
          'chromaticRows.two',
          'chromaticRows.three',
          'chromaticRows.four',
        ],
      }
    },
  },

  methods: {
    find() {
      this.pending = true
      dataProvider
        .find(this.findOption)
        .then((list) => (this.list = list))
        .finally(() => (this.pending = false))
    },
    showAddForm() {
      notifier.showDialog({
        component: CollectionForm,
        props: {
          database: this.database,
          collection: this.collection,
          fields: this.fields,
        },
        events: {
          created: this.find,
        },
        modal: {
          'prevent-close': true,
        },
      })
    },
    showEditForm(row) {
      notifier.showDialog({
        component: CollectionForm,
        props: {
          database: this.database,
          collection: this.collection,
          fields: this.fields,
          id: row._id,
          edit: true,
        },
        events: {
          updated: this.find,
        },
        modal: {
          'prevent-close': true,
        },
      })
    },
    showRemoveDialog(row) {
      let find = this.find
      let database = this.database
      let collection = this.collection

      notifier.showAlertDialog({
        title: this.$t('database.remove-title'),
        description: this.$t('database.remove-question'),
        actions: ['yes', 'no'],
        onAction(label, action, close) {
          if (label == 'no') {
            close()
            return
          }
          action.pending = true
          dataProvider
            .removeOne({
              database: database,
              collection: collection,
              query: { _id: row._id },
            })
            .then(find)
            .catch((result) => {
              notifier.toast({
                label: `Update ${collection} error`,
                description: result.error,
                type: 'error',
              })
            })
            .finally(close)
        },
      })
    },
  },
}
</script>

<style>
</style>