// ────────────────────────────────────────────────────────────────────────────
// Feature flags — fetched from /api/config/features on app load.
// Each flag controls whether a feature is shown in the UI.
// When false, the feature shows a "Coming soon" badge instead of a broken UI.
// ────────────────────────────────────────────────────────────────────────────

export interface FeatureFlags {
  AI_SEARCH: boolean;
  LIVE_TRACKING: boolean;
  PAYMENTS: boolean;
  CLOUD_UPLOADS: boolean;
}

export const DEFAULT_FEATURES: FeatureFlags = {
  AI_SEARCH: true,
  LIVE_TRACKING: true,
  PAYMENTS: true,
  CLOUD_UPLOADS: true,
};

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  try {
    const res = await fetch(`${API_BASE}/api/config/features`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.features ?? DEFAULT_FEATURES;
  } catch {
    // If the backend is unreachable, assume everything is available
    // so the app doesn't hide features unnecessarily.
    console.warn("[FeatureFlags] Could not fetch feature flags — using defaults");
    return DEFAULT_FEATURES;
  }
}
