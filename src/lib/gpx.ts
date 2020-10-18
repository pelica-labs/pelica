import { Position } from "@turf/turf";

export const parseGpx = (xml: string): Position[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  return Array.from(doc.querySelectorAll("trkpt")).map((node) => {
    return [parseFloat(node.getAttribute("lon") as string), parseFloat(node.getAttribute("lat") as string)];
  });
};
