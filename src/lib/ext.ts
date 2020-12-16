/**
 * Exposes external modules made available through /public/scripts/ext.js
 */

type Ext = {
  simd: () => Promise<boolean>;

  loadEncoder: (opts: { simd: boolean }) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

declare global {
  interface Window {
    extLoaded: boolean;
    simd: Ext["simd"];
    loadEncoder: Ext["loadEncoder"];
  }
}

export const loadExt = async (): Promise<Ext> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!window.extLoaded) {
        return;
      }

      clearInterval(interval);

      resolve({
        simd: window.simd,
        loadEncoder: window.loadEncoder,
      });
    });
  });
};
