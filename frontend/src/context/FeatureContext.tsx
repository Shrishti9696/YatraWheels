import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchFeatureFlags, DEFAULT_FEATURES, type FeatureFlags } from "@/config/features";

interface FeatureContextValue {
  features: FeatureFlags;
  loading: boolean;
}

const FeatureContext = createContext<FeatureContextValue>({
  features: DEFAULT_FEATURES,
  loading: true,
});

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureFlags()
      .then(setFeatures)
      .finally(() => setLoading(false));
  }, []);

  return (
    <FeatureContext.Provider value={{ features, loading }}>
      {children}
    </FeatureContext.Provider>
  );
}

/**
 * Hook to access feature flags anywhere in the app.
 *
 * @example
 * const { features } = useFeatures();
 * if (!features.AI_SEARCH) return <ComingSoonBadge label="AI Planner" />;
 */
export function useFeatures(): FeatureContextValue {
  return useContext(FeatureContext);
}
