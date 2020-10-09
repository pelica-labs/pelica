import MapboxStyles from "@mapbox/mapbox-sdk/services/styles";
import { NextApiHandler } from "next";

const accessToken = process.env.MAPBOX_SECRET_TOKEN;
if (!accessToken) {
  throw new Error("Missing Mapbox secret token");
}

const mapboxStyles = MapboxStyles({ accessToken });

const Styles: NextApiHandler = async (req, res) => {
  const styles = await mapboxStyles.listStyles({}).send();

  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  res.json({
    styles: styles.body,
  });
};

export default Styles;
