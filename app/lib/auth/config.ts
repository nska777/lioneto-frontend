export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  "http://localhost:1337";

export const APP_SESSION_COOKIE = "lioneto_user_token";

export const SESSION_SECRET =
  process.env.SESSION_SECRET || "change-me-super-secret";

export const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";