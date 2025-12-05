<template>
  <div class="rtl">
    <!-- NAVBAR -->
    <vs-navbar>
      <vs-button
        slot="left"
        flat
        v-if="!isLogin"
        :loading="pending"
        to="/auth/login"
      >
        {{ $t("auth.sign-in") }}
      </vs-button>

      <vs-button
        slot="left"
        v-if="isLogin"
        @click="activeSidebar = !activeSidebar"
        flat
        icon
      >
        <i class="bx bx-menu"></i>
      </vs-button>

      <NuxtLink to="/search" class="mx-2">
        {{ $t("search.label") }}
      </NuxtLink>

      <NuxtLink to="/about-us" class="mx-2">
        {{ $t("aboutus") }}
      </NuxtLink>

      <NuxtLink to="/artist/all" class="mx-2">
        {{ $t("artist.artists") }}
      </NuxtLink>

      <NuxtLink to="/" class="mx-2">
        {{ $t("navbar.home") }}
      </NuxtLink>
    </vs-navbar>

    <!-- SIDEBAR -->
    <vs-sidebar :open.sync="activeSidebar" absolute>
      <!-- Admin section -->
      <vs-sidebar-group v-if="user && user.type == 'administrator'">
        <template #header>
          <vs-sidebar-item arrow>
            <template #icon>
              <i class="bx bx-terminal"></i>
            </template>
            {{ $t("navbar.admin.title") }}
          </vs-sidebar-item>
        </template>

        <vs-sidebar-item to="/admin/artists">
          {{ $t("navbar.admin.artists") }}
        </vs-sidebar-item>

        <vs-sidebar-item to="/admin/genres">
          {{ $t("navbar.admin.genres") }}
        </vs-sidebar-item>

        <vs-sidebar-item to="/admin/song/list">
          {{ $t("navbar.admin.songs") }}
        </vs-sidebar-item>

        <!-- Chord Settings -->
        <vs-sidebar-item to="/admin/chords">
          {{ $t("navbar.admin.chords") }}
        </vs-sidebar-item>
      </vs-sidebar-group>

      <!-- Settings -->
      <vs-sidebar-group v-if="user && user.type == 'administrator'">
        <template #header>
          <vs-sidebar-item arrow>
            <template #icon>
              <i class="bx bx-terminal"></i>
            </template>
            {{ $t("navbar.settings.title") }}
          </vs-sidebar-item>
        </template>

        <!-- Backup -->
        <vs-sidebar-item to="/settings/backup">
          {{ $t("navbar.settings.backup") }}
        </vs-sidebar-item>
      </vs-sidebar-group>

      <vs-sidebar-item to="/about-us">
        {{ $t("aboutus") }}
      </vs-sidebar-item>
    </vs-sidebar>

    <!-- CONTENT -->
    <div class="page-content">
      <Nuxt />
    </div>

    <dialog-presentor />
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeSidebar: false,
      pending: false,
    };
  },
  created() {
    if (!this.isLogin) {
      this.pending = true;
      this.$store.dispatch("auth/loginWithLastSession").finally((_) => {
        this.pending = false;
      });
    }
  },
  computed: {
    isLogin() {
      // return authService.isLogin
      return this.$store.getters["auth/isLogin"];
    },
    user() {
      return this.$store.state.auth.user;
    },
  },
};
</script>

<style lang="scss">
.page-content {
  @apply px-4 pt-16;
}
// html {
//   font-family:
//     'Source Sans Pro',
//     -apple-system,
//     BlinkMacSystemFont,
//     'Segoe UI',
//     Roboto,
//     'Helvetica Neue',
//     Arial,
//     sans-serif;
//   font-size: 16px;
//   word-spacing: 1px;
//   -ms-text-size-adjust: 100%;
//   -webkit-text-size-adjust: 100%;
//   -moz-osx-font-smoothing: grayscale;
//   -webkit-font-smoothing: antialiased;
//   box-sizing: border-box;
// }

// *,
// *::before,
// *::after {
//   box-sizing: border-box;
//   margin: 0;
// }

// .button--green {
//   display: inline-block;
//   border-radius: 4px;
//   border: 1px solid #3b8070;
//   color: #3b8070;
//   text-decoration: none;
//   padding: 10px 30px;
// }

// .button--green:hover {
//   color: #fff;
//   background-color: #3b8070;
// }

// .button--grey {
//   display: inline-block;
//   border-radius: 4px;
//   border: 1px solid #35495e;
//   color: #35495e;
//   text-decoration: none;
//   padding: 10px 30px;
//   margin-left: 15px;
// }

// .button--grey:hover {
//   color: #fff;
//   background-color: #35495e;
// }
</style>
