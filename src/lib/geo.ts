import { MarkerState, PinState, RouteState } from "~/lib/state";

export const routesToFeatures = (routes: RouteState[]): GeoJSON.Feature<GeoJSON.Geometry>[] => {
  return routes.flatMap((route) => markersToFeatures(route.markers));
};

export const markersToFeatures = (markers: MarkerState[]): GeoJSON.Feature<GeoJSON.Geometry>[] => {
  if (markers.length < 2) {
    return [];
  }

  const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [];
  for (let i = 1; i < markers.length; i++) {
    const previousMarker = markers[i - 1];
    const marker = markers[i];

    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [previousMarker.coordinates.longitude, previousMarker.coordinates.latitude],
          [marker.coordinates.longitude, marker.coordinates.latitude],
        ],
      },
      properties: {
        color: marker.strokeColor,
        strokeWidth: marker.strokeWidth,
      },
    });
  }

  return features;
};

export const pinsToFeatures = (pins: PinState[]): GeoJSON.Feature<GeoJSON.Geometry>[] => {
  return pins.map((pin) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [pin.coordinates.longitude, pin.coordinates.latitude],
      },
      properties: {
        strokeColor: pin.strokeColor,
        strokeWidth: pin.strokeWidth,
      },
    };
  });
};
