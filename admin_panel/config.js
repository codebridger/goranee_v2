function setBaseURL() {
  let baseURL = process.env.BASE_URL;

  if (!process.client) {
    baseURL = process.env.BASE_URL_ON_SERVER;
    return baseURL;
  }

  if (typeof baseURL === "undefined") {
    // Default to /api which will be proxied by nginx to the server
    baseURL = "/api";
  }

  if (!baseURL.startsWith("http")) {
    baseURL = location.origin + baseURL;
  }

  if (baseURL.endsWith("/")) {
    baseURL = baseURL.slice(0, -1);
  }

  return baseURL;
}

export const BASE_URL = setBaseURL();
export const BASE_URL_ON_ClIENT = setBaseURL();
