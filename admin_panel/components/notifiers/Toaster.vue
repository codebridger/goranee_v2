<template>
  <div class="toast-container flex flex-col justify-end">
    <ToastMessage
      v-for="stackMember in toastStack"
      :key="stackMember.id"
      :id="stackMember.id"
      :label="stackMember.toast"
      :description="stackMember.description"
      :lifeTime="lifeTime"
      :class="[stackMember.type]"
      @remove="onRemoveToast"
    />
  </div>
</template>

<script>
import ToastMessage from './Toast.vue'
import EventBus from '../../utilities/event-bus';

export default {
  name: 'Toaster',
  components: { ToastMessage },
  props: {
    /**
     * toast life time, unit is second.
     */
    lifeTime: { type: Number, default: 5 }
  },
  data() {
    return {
      toastStack: []
    }
  },
  created() {
    EventBus.listen('toast', this.onRecievedToast)
  },

  methods: {
    onRecievedToast({ label, description, type = null }) {
      // add recieved toast into stack
      this.toastStack.push({
        id: new Date().getMilliseconds(),
        toast: label,
        description: description.toString(),
        type: type
      })
    },

    onRemoveToast(id) {
      let index = this.toastStack.findIndex(stackItem => stackItem.id == id)
      this.toastStack.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  @apply absolute bottom-0 right-0 pr-20;
  // position: absolute;
  bottom: 0;
  right: 0;
  padding-right: 20px;
  z-index: 9999;
  width: 400px;
}

.rtl {
  .toast-container {
    left: unset;
    right: 0;
  }
}

.ltr {
  .toast-container {
    right: unset;
    left: 0;
  }
}
</style>
