<template>
  <div>
    <div class="flex">
      <div class="thumbnail bg-gray-300">
        <img :src="thumbnailLink" />
      </div>
      <div>
        <vs-button @click="activeModal = true">Select Image</vs-button>
        <vs-button @click="removeImage" :loading="uploadPending" danger>Remove</vs-button>
      </div>
    </div>

    <vs-dialog :value="activeModal" :loading="uploadPending" not-close>
      <template #header>
        <h4 class="not-margin">Image uploader</h4>
      </template>
      <croppa v-model="image" :width="width" :height="height" :initial-image="thumbnailLink"
        :prevent-white-space="true" />
      <div class="flex">
        <vs-button @click="uploadImage">Upload</vs-button>
        <vs-button @click="removeImage" danger>Remove</vs-button>
        <vs-button @click="activeModal = false" danger>Close</vs-button>
      </div>
    </vs-dialog>
  </div>
</template>

<script>
import { fileProvider } from "@modular-rest/client";
import { BASE_URL_ON_ClIENT } from "~/config";
import notifier from "../../utilities/notifier";

export default {
  props: {
    width: { type: Number, default: 256 },
    height: { type: Number, default: 256 },
    fileDoc: { type: Object, default: () => { } },
    tag: String,
  },
  model: {
    prop: "fileDoc",
  },
  data() {
    return {
      activeModal: false,
      image: null,
      uploadPending: false,
      removePending: false,
    };
  },
  computed: {
    thumbnailLink() {
      return fileProvider.getFileLink(this.fileDoc || {}, BASE_URL_ON_ClIENT);
    },
  },
  methods: {
    extractImage() {
      return new Promise((done) => {
        this.image.generateBlob(
          (blob) => {
            done(blob);
          },
          // Extention
          "image/jpeg",
          // 80% compressed jpeg file
          0.8
        );
      });
    },
    async uploadImage() {
      let file = await this.extractImage();
      this.uploadPending = true;

      // If there's an existing image, remove it first without triggering updates
      if (this.fileDoc != null && this.fileDoc._id) {
        try {
          await fileProvider.removeFile(this.fileDoc._id);
        } catch (err) {
          console.error("Error removing old image before upload:", err);
        }
      }

      fileProvider
        .uploadFile(
          file,
          (loaded) => {
            console.log("uploading: " + loaded);
          },
          this.tag
        )
        .then((fileDoc) => {
          this.$emit("input", fileDoc);
          this.$emit("changed");
          this.activeModal = false;
          if (!this.$listeners.changed) {
            notifier.toast({
              label: "Success",
              description: "Image uploaded successfully",
              type: "success",
            });
          }
        })
        .catch((err) => {
          notifier.toast({
            label: "Upload error",
            description: err.message || "Failed to upload image",
            type: "error",
          });
        })
        .finally(() => {
          this.uploadPending = false;
        });
    },
    async removeImage() {
      if (!this.fileDoc || !this.fileDoc._id) {
        this.$emit("input", null);
        this.$emit("changed");
        return;
      }

      this.uploadPending = true;
      return fileProvider
        .removeFile(this.fileDoc._id)
        .then((fileDoc) => {
          this.$emit("input", null);
          this.$emit("changed");
          if (!this.$listeners.changed) {
            notifier.toast({
              label: "Success",
              description: "Image removed successfully",
              type: "success",
            });
          }
        })
        .catch((err) => {
          notifier.toast({
            label: "Remove error",
            description: err.message || "Failed to remove image",
            type: "error",
          });
        })
        .finally(() => (this.uploadPending = false));
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
