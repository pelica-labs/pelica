import MapboxStyles, { Style as MapboxStyle } from "@mapbox/mapbox-sdk/services/styles";
import { intersectionBy } from "lodash";
import { NextApiHandler } from "next";

import { getEnv } from "~/lib/config";
import { availableStyles, Style } from "~/lib/style";

const accessToken = getEnv("MAPBOX_SECRET_TOKEN", process.env.MAPBOX_SECRET_TOKEN);

const mapboxStyles = MapboxStyles({ accessToken });

export const fetchStyles = async (): Promise<Style[]> => {
  const styles = await mapboxStyles.listStyles({}).send();

  return intersectionBy(availableStyles, styles.body as MapboxStyle[], (style) => style.id).map((style) => {
    return {
      id: style.id,
      owner: style.owner,
      name: style.name,
      hash: style.hash || null,
    };
  });
};

const Styles: NextApiHandler = async (req, res) => {
  const styles = await fetchStyles();

  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  res.json({ styles });
};

export default Styles;
