// Analytics is optional on this site. Keep event calls behind the same
// runtime check as the layout's measurement script so local builds and
// deployments without a GA id remain completely inert.
export function getAnalyticsMeasurementId(value) {
  const id = (value ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)?.trim();
  return id && /^G-[A-Z0-9]+$/i.test(id) ? id : null;
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params);
}
