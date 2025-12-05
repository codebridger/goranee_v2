<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ title }}</h2>
      <vs-button v-if="allowAdd" @click="showAddForm">{{
        $t('add')
      }}</vs-button>
    </div>

    <!-- Content -->
    <card class="p-8 mt-4">
      <vs-table striped :key="list.length">
        <!-- Search -->
        <template slot="header">
          <vs-input border block placeholder="Search" type="search" />
        </template>

        <!-- THead -->
        <template slot="thead">
          <vs-tr>
            <vs-th v-for="(field, i) in fields" :key="i">
              {{ field.label || field.key }}
            </vs-th>
          </vs-tr>
        </template>

        <!-- TBody -->
        <template slot="tbody">
          <vs-tr v-for="(row, i) in list" :key="i">
            <vs-td v-for="(field, i) in fields" :key="i">
              <span v-if="field.type == 'string' || field.type == 'seo'">
                {{ field.mutate ? field.mutate(row) : row[field.key] }}
              </span>

              <image-viewer
                v-if="field.type == 'image'"
                :fileDoc="row[field.key]"
              />
            </vs-td>

            <!-- Row Actions -->
            <template #expand>
              <div class="flex items-center justify-between">
                <span class="text-gray-300">_id: {{ row._id }}</span>
                <div class="flex">
                  <vs-button
                    warn
                    border
                    v-if="allowEdit"
                    @click="showEditForm(row)"
                    >{{ $t('edit') }}</vs-button
                  >
                  <vs-button
                    danger
                    border
                    v-if="allowRemove"
                    @click="showRemoveDialog(row)"
                    >{{ $t('remove') }}</vs-button
                  >
                </div>
              </div>
            </template>
          </vs-tr>
        </template>
      </vs-table>
    </card>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../utilities/notifier'
import CollectionForm from './CollectionForm'
import ImageViewer from '../materials/ImageViewer.vue'

export default {
  components: { ImageViewer },
  props: {
    title: String,
    database: { type: String, required: true },
    collection: { type: String, required: true },
    populates: Array,
    sort: {},
    /**
     * An array of
     * {type, title, key, placeholder, icon, disable, mutate, inputComponent}
     */
    fields: { type: Array, default: () => [] },
    allowAdd: { type: Boolean, default: true },
    allowEdit: { type: Boolean, default: true },
    allowRemove: { type: Boolean, default: true },
  },

  data() {
    return {
      list: [],
      pending: false,
    }
  },

  created() {
    this.find()
  },

  computed: {
    findOption() {
      let query = {
        database: this.database,
        collection: this.collection,
        query: {},
        options: { sort: this.sort || '-_id' },
      }

      if (this.populates) query['populates'] = this.populates

      return query
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
      let props = {
        database: this.database,
        collection: this.collection,
        fields: this.fields,
        edit: true,
      }

      if (this.populates) props['docId'] = row._id
      else props['document'] = row

      notifier.showDialog({
        component: CollectionForm,
        props: props,
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