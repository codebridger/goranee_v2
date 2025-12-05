import { GlobalOptions, authentication } from "@modular-rest/client";

import { BASE_URL } from "@/config";

export default function ({ fetch }) {
  /**
   * Setup mrest-web module
   */
  GlobalOptions.set({
    host: BASE_URL,
  });

  if (!authentication.isLogin) return authentication.loginAsAnonymous();
}
