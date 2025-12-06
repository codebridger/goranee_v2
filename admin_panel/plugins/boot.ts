import { GlobalOptions, authentication } from "@modular-rest/client";

// Styles
import "~/assets/style/style.scss";
import "~/assets/style/fonts.css";
import "boxicons/css/boxicons.min.css";

import { BASE_URL } from "@/config";

export default async function () {
  /**
   * Setup mrest-web module
   */

  GlobalOptions.set({
    host: BASE_URL as string,
  });

  // Skip API calls during static generation
  if (process.server) {
    return;
  }

  localStorage.removeItem("token");
  await authentication.loginAsAnonymous();
}
