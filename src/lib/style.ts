export type Style = {
  id: string;
  owner: string;
  name: string;
};

export const defaultStyle: Style = {
  // make this configurable
  id: "ckfy50y250eq019qwbenxy5b0",
  owner: "bstnfrmry",
  name: "Default",
};

export const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};
