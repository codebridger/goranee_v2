<template>
  <div>
    <div
      class="sequence-page"
      v-for="(slotName, i) in slots"
      :key="i"
      :class="[{'actived-page' : isSlotAllowToShow(slotName)}]"
    >
      <!-- <transition name="fade"> -->
        <div v-if="isSlotAllowToShow(slotName)">
          <!-- each slot of slots -->
          <slot :name="slotName" />
        </div>
      <!-- </transition> -->
    </div>
  </div>
</template>

<script>
/**
 * This is a component that you can present a sequece of slots
 * by give a list of slot and make one of theme active.
 * this is useful for forms which has several pages.
 */
export default {
  name: "SequencePresentor",
  props: {
    /**
     * Define a list of custom slots.
     */
    slots: { type: Array, default: () => [] },
    /**
     * Define which custom slot must be shown currently.
     */
    active: { default: "" }
  },
  methods: {
    isSlotAllowToShow(slot) {
      return this.active == slot ? true : false;
    }
  }
};
</script>

<style lang="scss" scoped>
.sequence-page {
  @apply transition-all duration-700;
  opacity: 0;
}

.actived-page {
  opacity: 1;
}
</style>
