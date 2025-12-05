<template>
  <vs-dialog
    prevent-close
    :value="isActive"
    @input="destroyModalContent"
    v-bind="modalOptions"
  >
    <component
      v-if="currentModalContent"
      :is="currentModalContent"
      v-bind="props"
      v-on="events"
      @close="destroyModalContent"
    />
  </vs-dialog>
</template>

<script>
import EventBus from '../../utilities/event-bus'
import AlertDialog from './AlertDialog'

export default {
  name: 'dialog-presentor',
  data() {
    return {
      isActive: false,
      pending: false,
      currentModalContent: null,
      props: {},
      events: {},
      modalOptions: {},
    }
  },
  created() {
    EventBus.listen('show-alert-dialog', this.onAlertDialog)
    EventBus.listen('show-dialog', this.onDialog)
  },
  destroyed() {
    EventBus.remove('show-alert-dialog', this.onAlertDialog)
    EventBus.remove('show-dialog', this.onDialog)
  },
  methods: {
    onAlertDialog({ title, description, actions = [], onAction }) {
      this.isActive = true

      // normalize actions
      let normalizedActions = actions.map((item) => {
        if (typeof item == 'string') {
          return {
            label: item,
            button: { shadow: true, transparent: true },
            pending: false,
          }
        } else {
          item['pending'] = false
          return item
        }
      })

      this.currentModalContent = AlertDialog

      this.props = {
        title,
        description,
        actions: normalizedActions,
        pending: this.pending,
      }

      let destroyModalContent = this.destroyModalContent
      this.events = {
        actionClick(action) {
          onAction(action.label, action, destroyModalContent)
        },
      }
    },

    onDialog({ component, props = {}, events = {}, modal = {} }) {
      this.isActive = true

      this.currentModalContent = component
      this.props = {
        ...props,
        closeModal: this.destroyModalContent,
      }
      this.events = events
      this.modalOptions = modal
    },

    destroyModalContent() {
      this.isActive = false
      this.currentModalContent = null
      this.modalOptions = {}
      this.props = {}
      this.events = {}
    },
  },
}
</script>

<style>
</style>