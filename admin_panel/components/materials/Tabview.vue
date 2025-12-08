<template>
  <div class="tab-content" v-if="sections">
    <div v-for="(section, i) in sections" :key="i" class="mb-4 section">
      <h3 class="my-2" :dir="section.direction">{{ section.title }}</h3>
      <tabview-section-lines
        :lines="section.lines"
        :direction="section.direction"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    sections: Array,
  },
}
</script>

<style lang="scss" scoed>
.tab-content {
  p {
    margin-bottom: 1.5rem;
  }

  .section:nth-child(odd) {
    background-color: rgba(167, 232, 255, 0.2);
    margin: 0 -1rem;
    margin-top: -1rem;
    padding: .5rem 1rem;
  }

  // .section:nth-child(even) {
  //   background-color: green;
  // }
}
</style>