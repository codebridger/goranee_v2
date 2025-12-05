<template>
  <vs-card class="card-artist" @click="push">
    <template #title>
      <NuxtLink :to="to">
        <h2>{{ "آکورد های " + artist.name }}</h2>
      </NuxtLink>
    </template>
    <template #text>
      <div class="flex justify-between">
        <!-- <div class="flex flex-wrap">
          <span v-for="(artist, i) in artist.artists" :key="i">{{
            artist.name
          }}</span>
        </div> -->
        <!-- <div class="flex flex-wrap">
          <span v-for="(genre, i) in artist.genres" :key="i">{{
            genre.title
          }}</span>
        </div> -->
      </div>
    </template>
    <template #img>
      <div
        class="w-full"
        :style="{
          background: getRandomColor(),
          height: '250px',
          width: '250px',
        }"
      >
        <img v-if="artist.image" :src="thumbnailLink" />
      </div>
    </template>
    <template #interactions>
      <!-- <vs-button
        v-if="allowRemove"
        icon
        danger
        tranparent
        @click="$emit('remove')"
      >
        <i class="bx bx-trash-alt"></i>
      </vs-button> -->
    </template>
  </vs-card>
</template>

<script>
import { fileProvider } from "@modular-rest/client";
import { BASE_URL_ON_ClIENT } from "~/config";

export default {
  name: "card-artist",
  props: {
    artist: Object,
    allowRemove: Boolean,
    to: String,
  },
  computed: {
    thumbnailLink() {
      return fileProvider.getFileLink(this.artist.image, BASE_URL_ON_ClIENT);
    },
  },
  methods: {
    getRandomColor() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    push() {
      if (this.to) this.$router.push(this.to);
    },
  },
};
</script>

<style lang="scss">
.card-artist {
  /* width: 250px; */
  margin: 10px;

  .vs-card {
    background: none !important;
  }
}
</style>
