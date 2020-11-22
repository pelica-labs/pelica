export type Style = {
  id: string;
  owner: string;
  name: string;
  hash?: string | null;
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
    name: "Dark",
    hash: "L03]AnozIAozogj[j@a}Mxof%Nt7",
  },
  {
    id: "ckh91q78b3qms19qe41fjrea3",
    owner: "bstnfrmry",
    name: "Mineral",
    hash: "L9FZD?NH01WBOY%1WVs.01XT~Un$",
  },
  {
    id: "ckfgw9p0i2kzi19p8pt32p7c5",
    owner: "bstnfrmry",
    name: "Outdoors",
    hash: "L1P?{qxp0vR$?vkXNHWA0cxK^TNG",
  },
  {
    id: "ckht5xjig0kf219rmehk064f5",
    owner: "bstnfrmry",
    name: "Retro (SamanBB)",
    hash: "LBQc9cofpfWBxtWAj?WCcHt7eRV@",
  },
  {
    id: "ckfgvw2oq2m6b19mrlz2bei4l",
    owner: "bstnfrmry",
    name: "Satellite",
    hash: "L2BDQ49bJ4WE~nIqtQNH0exp?Hah",
  },
  {
    id: "ckee9ewyn0p3b19ntk1blm5wc",
    owner: "bstnfrmry",
    name: "Navigation",
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
  },
  {
    id: "ckfs2tqt33lgm1arh4yqkqbql",
    owner: "bstnfrmry",
    name: "North Star",
  },
  {
    id: "ckgz0ard77h9v19pa5otqzbig",
    owner: "bstnfrmry",
    name: "Le Shine",
  },
  {
    id: "ckht4trv31rup19o8sl2eyvh3",
    owner: "bstnfrmry",
    name: "Golden",
    hash: "L1SE~N-.ws-i~SfkWBoJw@WAR:WC",
  },
  {
    id: "ckht4x7ic0jiu19mrpit6lvbl",
    owner: "bstnfrmry",
    name: "Glacial",
    hash: "L1R3p5-;-roy_Nj]Rjof-rWBITNF",
  },
  {
    id: "ckhtc1jj92a8x19p3bu6ma9kf",
    owner: "bstnfrmry",
    name: "Slopes",
    hash: "L3SPb4%L~qM{?bRkNGof?HRjD$M|",
  },
  {
    id: "ckgcic5yl0sfu1ap3d89uu5jm",
    owner: "bstnfrmry",
    name: "Decimal",
  },
  {
    id: "ckht65lu40kq619mr5dxz1zie",
    owner: "bstnfrmry",
    name: "Frank (Clare Trainor)",
    hash: "L2RypS%M?wt7?bayWBoL?wWCDiM{",
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
  {
    id: "ckht5azzc3gyp19qtlovfydsc",
    owner: "bstnfrmry",
    name: "Anodyne",
    hash: "L1Ss50-;~qt7~qj[Rjof_3WB9EM{",
  },
  {
    id: "ckht65lu40kq619mr5dxz1zie",
    owner: "bstnfrmry",
    name: "Frank (Clare Trainor)",
    hash: "L2RypS%M?wt7?bayWBoL?wWCDiM{",
  },
  {
    id: "ckht6c5bc39s319ozi0cleeq0",
    owner: "bstnfrmry",
    name: "Bubble",
    hash: "L0IF=D#ro~.m?JaKZ$njVsk=kqjF",
  },
];

export const defaultStyle = availableStyles[0];

export const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};
