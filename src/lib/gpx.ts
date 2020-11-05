import { Position } from "@turf/turf";

import { Route } from "~/core/routes";

export const parseGpx = (xml: string): Position[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  return Array.from(doc.querySelectorAll("trkpt")).map((node) => {
    return [parseFloat(node.getAttribute("lon") as string), parseFloat(node.getAttribute("lat") as string)];
  });
};

export const exportGpx = (name: string, route: Route): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <gpx creator="Pelica" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>
      ${route.points
        .map((point) => {
          return `<trkpt lat="${point[1]}" lon="${point[0]}"></trkpt>`;
        })
        .join("\n")}
    </trkseg>
  </trk>
  `;
};
