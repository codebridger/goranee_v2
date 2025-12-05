function setBaseURL() {
  let baseURL = process.env.BASE_URL;

  if (!process.client) {
    baseURL = process.env.BASE_URL_ON_SERVER;
    return baseURL;
  }

  if (typeof baseURL === "undefined") {
    baseURL = "http://localhost:8081";
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
export const BASE_URL_ON_ClIENT = process.env.BASE_URL;
