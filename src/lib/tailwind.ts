// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tailwindConfig from "tailwind-config";

import config from "../../tailwind.config.js";

const tailwind = tailwindConfig.config(config);

export const theme = tailwind.theme;
