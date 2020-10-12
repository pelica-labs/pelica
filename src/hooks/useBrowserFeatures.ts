import { useEffect, useState } from "react";

type BrowserFeatures = {
  shareFeature: boolean;
};

export const useBrowserFeatures = (): BrowserFeatures => {
  const [shareFeature, setShare] = useState(true);

  useEffect(() => {
    setShare(!!window.navigator.share);
  }, []);

  return {
    shareFeature,
  };
};
