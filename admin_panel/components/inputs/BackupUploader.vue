<template>
  <div>
    <vs-button @click="activeModal = true">Upload backup file</vs-button>

    <vs-dialog :value="activeModal" :loading="uploadPending" not-close>
      <template #header>
        <h4 class="not-margin">Backup uploader</h4>
      </template>

      <p>Please select a zip file that you downloaded before from here</p>

      <input :key="key" accept="application/zip" class="mt-2" type="file" ref="fileInput" />

      <div class="flex mt-4">
        <vs-button @click="uploadFile">Upload</vs-button>
        <vs-button @click="activeModal = false" danger>Close</vs-button>
      </div>
    </vs-dialog>
  </div>
</template>

<script>
import { fileProvider } from "@modular-rest/client";

export default {
  data() {
    return {
      activeModal: false,
      uploadPending: false,
      removePending: false,
      key : new Date().getTime()
    };
  },

  methods: {
    getFiles() {
      return this.$refs.fileInput.files;
    },

    uploadFile() {
      let [file] = this.getFiles();
      debugger
      if(!file) return;

      this.uploadPending = true

      fileProvider
        .uploadFileToURL(
          '/backup',
          file,
          {},
          (loaded) => {
            console.log('uploading: ' + loaded)
          },
        )
        .then((fileDoc) => {
          this.$emit('uploaded', fileDoc)
        })
        .finally(() => {
          this.uploadPending = false
          this.activeModal = false
          this.key = new Date().getTime()
        })
    },
  },
};
</script>

<style lang="scss">
.thumbnail {
  width: 120px;
  height: 120px;
  .img {
    width: 100%;
    height: 100%;
  }
}
</style>