/*
 * There modules won't properly build with webpack,
 * so we fetch them through the network and expose them globally.
 *
 * @see loadExt()
 */

import loadEncoder from "https://unpkg.com/mp4-h264@1.0.7/build/mp4-encoder.js";
import { simd } from "https://unpkg.com/wasm-feature-detect?module";

window.ext = {
  loadEncoder,
  simd,
};
