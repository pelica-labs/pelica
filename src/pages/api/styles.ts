import MapboxStyles from "@mapbox/mapbox-sdk/services/styles";
import { NextApiHandler } from "next";

import { getEnv } from "~/lib/config";
import { Style } from "~/lib/style";

const accessToken = getEnv("MAPBOX_SECRET_TOKEN", process.env.MAPBOX_SECRET_TOKEN);

const mapboxStyles = MapboxStyles({ accessToken });

export const fetchStyles = async (): Promise<Style[]> => {
  const styles = await mapboxStyles.listStyles({}).send();

  return styles.body;
};

const Styles: NextApiHandler = async (req, res) => {
  const styles = await fetchStyles();

  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  res.json({ styles });
};

export default Styles;
