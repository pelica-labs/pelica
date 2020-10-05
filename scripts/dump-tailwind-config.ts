import fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tailwindConfig from "tailwind-config";

import config from "../tailwind.config.js";

const tailwind = tailwindConfig.config(config);

fs.writeFileSync(`${__dirname}/../src/styles/tailwind.json`, JSON.stringify(tailwind, null, 2));
