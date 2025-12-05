<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t('song.songs') }}</h2>
      <vs-button to="/admin/song/new">{{ $t('song.new-song') }}</vs-button>
    </div>

    <!-- Content -->
    <div class="mt-8 flex flex-wrap justify-between">
      <card-song
        v-for="(song, i) in list"
        allowRemove
        :key="i"
        :song="song"
        :to="'/admin/song/' + song._id"
        @remove="showRemoveDialog(song)"
      />
    </div>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../../utilities/notifier'

export default {
  name: 'Songs',
  middleware: ['auth'],
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
      return {
        database: 'tab',
        collection: 'song',
        query: {},
        populates: ['genres', { path: 'artists', select: 'name' }],
        options: {
          sort: '-_id',
        },
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

    showRemoveDialog(song) {
      let find = this.find
      let database = 'tab'
      let collection = 'song'

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
              query: { _id: song._id },
            })
            .then(find)
            .catch(({ error }) => {
              notifier.toast({
                label: `Update ${collection} error`,
                description: JSON.stringify(error),
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