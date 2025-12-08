export default async function({ store, redirect, route, error }) {
  // Skip auth checks during static generation
  if (process.server) {
    return;
  }

  const isLogin = store.getters["auth/isLogin"];
  const user = store.state.auth.user;
  const path = route.path;

  // check login state
  if (!isLogin) {
    if (process.client) {
      await store.dispatch("auth/loginWithLastSession");
    }

    redirect(302, "/auth/login");
    return;
  }

  // check permission
  if (
    path.startsWith("/admin") &&
    user &&
    user.permissionGroup &&
    user.permissionGroup.title != "administrator"
  ) {
    error({ statusCode: 403, message: "Permission denied!" });
  }
}
