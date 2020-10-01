import { PointState, RouteState } from "~/lib/state";

export const parseGpx = (xml: string): PointState[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  return Array.from(doc.querySelectorAll("trkpt")).map((node) => {
    return {
      coordinates: {
        latitude: parseFloat(node.getAttribute("lat") as string),
        longitude: parseFloat(node.getAttribute("lon") as string),
      },
    };
  });
};

const GPX_HEADER = `<?xml version="1.0" encoding="UTF-8"?><gpx creator="https://gps-viewer.com" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">`;
const GPX_FOOTER = `</gpx>`;

export const generateGpx = (routes: RouteState[]): string => {
  const trkSegments = routes.map((route) => {
    const segments = route.markers.map((marker) => {
      return `<trkpt lat="${marker.coordinates.latitude}" lon="${marker.coordinates.longitude}"></trkpt>`;
    });

    return `<trkseg>${segments}</trkseg>`;
  });

  return `${GPX_HEADER}
  <trk>${trkSegments}</trk>
  ${GPX_FOOTER}`;
};
