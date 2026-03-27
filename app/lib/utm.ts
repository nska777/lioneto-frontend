export type UtmData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
};

const STORAGE_KEY = "lioneto_utm";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readUtmFromUrl(): UtmData {
  if (!isBrowser()) return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
    referrer: document.referrer || undefined,
    landing_page: window.location.href,
  };
}

export function saveUtmIfExists() {
  if (!isBrowser()) return;

  const data = readUtmFromUrl();

  const hasAnyUtm =
    data.utm_source ||
    data.utm_medium ||
    data.utm_campaign ||
    data.utm_content ||
    data.utm_term;

  if (!hasAnyUtm) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSavedUtm(): UtmData {
  if (!isBrowser()) return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}