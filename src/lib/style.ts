export type Style = {
  id: string;
  owner: string;
  name: string;
  hash?: string | null;
  overrides?: Partial<StyleOverrides>;
};

export type StyleOverrides = {
  textFont: string[];
  textTransform: "none" | "uppercase" | "lowercase";
};

export const defaultStyles: StyleOverrides = {
  textFont: ["Roboto Regular"],
  textTransform: "none",
};

/**
 * List of available styles.
 * They will be checked for existence against Mapbox API to ensure they're actually usable.
 */
export const availableStyles: Style[] = [
  {
    id: "ckfy50y250eq019qwbenxy5b0",
    owner: "bstnfrmry",
    name: "Default",
    hash: "L0Q+[]~n_}Xo~qo}Ipog_}IX6AEi",
  },
  {
    id: "ckfh6lvnu2wg619mh4kga4vc0",
    owner: "bstnfrmry",
    name: "Basic",
    hash: "L03]AnozIAozogj[j@a}Mxof%Nt7",
  },
  {
    id: "ckfgw9p0i2kzi19p8pt32p7c5",
    owner: "bstnfrmry",
    name: "Outdoors",
    hash: "L1P?{qxp0vR$?vkXNHWA0cxK^TNG",
  },
  {
    id: "ckfgvw2oq2m6b19mrlz2bei4l",
    owner: "bstnfrmry",
    name: "Satellite Streets",
    hash: "L2BDQ49bJ4WE~nIqtQNH0exp?Hah",
  },
  {
    id: "ckee9ewyn0p3b19ntk1blm5wc",
    owner: "bstnfrmry",
    name: "Navigation",
  },
  {
    id: "ckgcic5yl0sfu1ap3d89uu5jm",
    owner: "bstnfrmry",
    name: "Decimal",
  },
  {
    id: "ckgchqgiiafj51as4cvslzvkx",
    owner: "bstnfrmry",
    name: "Plany",
  },
  {
    id: "ckgchoht11nzt19pgjjny8xyh",
    owner: "bstnfrmry",
    name: "Whaam!",
  },
  {
    id: "ckfs2xnc51k7019pm8f1wpgnc",
    owner: "bstnfrmry",
    name: "Scenic",
  },
  {
    id: "ckfs2x9kt1qk619t8fy34voej",
    owner: "bstnfrmry",
    name: "Cali Terrain",
    overrides: {
      textFont: ["Overpass Bold"],
      textTransform: "uppercase",
    },
  },
  {
    id: "ckfs2tqt33lgm1arh4yqkqbql",
    owner: "bstnfrmry",
    name: "North Star",
  },
  {
    id: "ckfs2skk31k2519pm37a42aeo",
    owner: "bstnfrmry",
    name: "Too blue",
  },
  {
    id: "ckfs2r5rk1qip1amm368nqet0",
    owner: "bstnfrmry",
    name: "Bubblegum",
  },
];

export const defaultStyle = availableStyles[0];

export const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};
