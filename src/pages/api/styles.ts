import MapboxStyles from "@mapbox/mapbox-sdk/services/styles";
import { NextApiHandler } from "next";

import { defaultStyle } from "~/lib/mapbox";

const accessToken = process.env.MAPBOX_SECRET_TOKEN;
if (!accessToken) {
  throw new Error("Missing Mapbox secret token");
}

const mapboxStyles = MapboxStyles({ accessToken });

const Styles: NextApiHandler = async (req, res) => {
  const styles = await mapboxStyles.listStyles({}).send();

  res.json({
    styles: [defaultStyle, ...styles.body],
  });
};

export default Styles;
