/**
 * Exposes external modules made available through /public/scripts/ext.js
 */

type Ext = {
  simd: () => Promise<boolean>;

  loadEncoder: (opts: { simd: boolean }) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

declare global {
  interface Window {
    ext: Ext;
  }
}

export const loadExt = async (): Promise<Ext> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!window.ext) {
        return;
      }

      clearInterval(interval);

      resolve(window.ext);
    });
  });
};
