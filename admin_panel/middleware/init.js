import { GlobalOptions, authentication } from "@modular-rest/client";

import { BASE_URL } from "@/config";

export default function({ fetch }) {
  /**
   * Setup mrest-web module
   */
  GlobalOptions.set({
    host: BASE_URL
  });

  // Skip API calls during static generation
  if (process.server) {
    return;
  }

  if (!authentication.isLogin) return authentication.loginAsAnonymous();
}
