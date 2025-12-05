<template>
  <div>
    <card class="p-16">
      <!-- <template>
              <div class="text-muted text-center mb-3">
                <small>Sign in with</small>
              </div>
              <div class="btn-wrapper text-center">
                <base-button type="neutral">
                  <img slot="icon" src="img/icons/common/github.svg" />
                  Github
                </base-button>

                <base-button type="neutral">
                  <img slot="icon" src="img/icons/common/google.svg" />
                  Google
                </base-button>
              </div>
            </template> -->
      <template>
        <div class="text-center text-muted mb-4">
          <small>{{ $t('auth.with-credentials') }}</small>
        </div>
        <div>
          <vs-input
            alternative
            class="mb-3"
            addon-left-icon="ni ni-email-83"
            :placeholder="$t('auth.accountID')"
            v-model="form.id"
          >
            <template #icon>
              <i class="bx bx-user" />
            </template>
          </vs-input>

          <vs-input
            alternative
            type="password"
            addon-left-icon="ni ni-lock-circle-open"
            :placeholder="$t('auth.password')"
            v-model="form.password"
          >
            <template #icon>
              <i class="bx bx-lock-open-alt"></i>
            </template>
          </vs-input>

          <!-- <base-checkbox v-model="rememberMe">
            {{ $t('auth.remember-me') }}
          </base-checkbox> -->
          <div class="mt-4">
            <vs-button block :loading="pending" @click="login">
              {{ $t('auth.sign-in') }}
            </vs-button>
          </div>
        </div>
      </template>
    </card>
    <div class="flex flex-row-reverse justify-between items-end mt-2 px-2">
      <div>
        <NuxtLink to="/auth/forgot-password">
          <small>{{ $t('auth.forgot-password') }}</small>
        </NuxtLink>
      </div>
      <div>
        <NuxtLink to="/auth/register">
          <small>{{ $t('auth.create-new-account') }}</small>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  layout: 'hero',
  data() {
    return {
      form: {
        idType: 'email',
        id: '',
        password: '',
      },
      pending: false,
      rememberMe: false,
    }
  },
  methods: {
    login() {
      this.pending = true

      this.$store
        .dispatch('auth/login', this.form)
        .then(() => {
          this.$router.push('/')
        })
        .finally(() => this.pending = false)
    },
  },
}
</script>

<style>
</style>