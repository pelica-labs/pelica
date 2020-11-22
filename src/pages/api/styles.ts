import MapboxStyles, { Style as MapboxStyle } from "@mapbox/mapbox-sdk/services/styles";
import { intersectionBy } from "lodash";
import { NextApiHandler } from "next";

import { getEnv } from "~/lib/config";
import { availableStyles, Style } from "~/map/style";

const accessToken = getEnv("MAPBOX_SECRET_TOKEN", process.env.MAPBOX_SECRET_TOKEN);

const mapboxStyles = MapboxStyles({ accessToken });

export const fetchStyles = async (): Promise<Style[]> => {
  const styles = await new Promise<MapboxStyle[]>((resolve, reject) => {
    let tempStyles: MapboxStyle[] = [];

    // the mapbox sdk types are all messed up.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const pageCallback: any = (error: any, response: any, next: any) => {
      if (error) {
        return reject(error);
      }

      tempStyles = tempStyles.concat(response.body);

      if (!response.hasNextPage()) {
        resolve(tempStyles);
      } else {
        next();
      }
    };
    mapboxStyles.listStyles({}).eachPage(pageCallback);
  });

  return intersectionBy(availableStyles, styles as Style[], (style) => style.id).map((style) => {
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
