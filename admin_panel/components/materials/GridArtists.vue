<template>
  <div :style="{width:'100%'}">
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ this.title }}</h2>
    </div>

    <!-- Content -->
    <div class="mt-8 flex flex-wrap space-x-4 space-y-4 justify-end items-center">
      <card-artist
        v-for="(artist, i) in list"
        :key="i"
        :artist="artist"
        :to="'/artist/' + artist._id"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "GridArtists",

  props: {
    title: String,
    list: Array,
    pending: Boolean,
  },
};
</script>

<style>
</style>