import { State } from "~/core/app";

export const getSelectedGeometries = (state: State) => {
  return state.geometries.items.filter((geometry) => {
    return state.selection.ids.includes(geometry.id);
  });
};

export const getSelectedGeometry = (state: State) => {
  const geometries = getSelectedGeometries(state);

  if (geometries.length !== 1) {
    return null;
  }

  return geometries[0];
};

export const getSelectedItinerary = (state: State) => {
  const geometry = getSelectedGeometry(state);

  if (geometry?.type !== "Line") {
    return null;
  }

  return geometry.itinerary ?? null;
};
