<template>
  <transition name="fade">
    <div class="toast">
      <div v-if="rtl">
        <span class="toast-close-container" @click="onClose">
          <i class="gg-close" />
        </span>
      </div>
      <div>
        <span>{{ label }}</span>
        <p>{{ description }}</p>
      </div>
      <div v-if="!rtl">
        <span class="toast-close-container" @click="onClose">
          <i class="gg-close" />
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    label: String,
    description: String,
    id: {},
    lifeTime: { type: Number, default: 2 },
    rtl: { type: Boolean, default: true },
  },
  created() {
    setTimeout(this.onClose, this.lifeTime * 1000)
  },
  methods: {
    onClose() {
      this.$emit('remove', this.id)
    },
  },
}
</script>

<style lang="scss" scoped>
.toast {
  @apply w-full bg-gray-700 text-white p-16 mb-8 flex justify-between items-center rounded-lg relative cursor-pointer;

  &.error {
    @apply bg-red-500;
    // background: lightcoral;
  }

  &.success {
    @apply bg-green-500;
    // background: lightgreen;
  }

  &.warning {
    @apply bg-yellow-600;
    // background: yellow;
  }

  &-close-container {
    @apply w-32 h-32 rounded-full inline-flex bg-transparent items-center justify-center mb-0 absolute;
    transform: translateY(-50%);
    top: 50%;
    transition: background 0.3s ease-in;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
