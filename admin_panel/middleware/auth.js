export default function({ store, redirect, route, error }) {
  const isLogin = store.getters["auth/isLogin"];
  const user = store.state.auth.user;
  const path = route.path;

  // check login state
  if (!isLogin) {
    redirect(302, "/auth/login");
    return;
  }

  // check permission
  if (
    path.startsWith("/admin") &&
    user.permissionGroup.title != "administrator"
  ) {
    error("Permission denied!s");
  }
}
