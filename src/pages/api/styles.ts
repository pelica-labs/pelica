import MapboxClient from "@mapbox/mapbox-sdk";
import MapboxStyles from "@mapbox/mapbox-sdk/services/styles";
import { NextApiHandler } from "next";

const mapbox = MapboxClient({ accessToken: process.env.MAPBOX_SECRET_TOKEN });

const mapboxStyles = MapboxStyles(mapbox);

const Styles: NextApiHandler = async (req, res) => {
  const styles = await mapboxStyles.listStyles({}).send();

  res.json({
    styles: styles.body,
  });
};

export default Styles;
