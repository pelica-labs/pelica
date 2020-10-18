import { State } from "~/core/app";
import { Geometry, Line, Point } from "~/core/geometries";

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

export const getSelectedRoutes = (state: State) => {
  return getSelectedGeometries(state).filter((geometry: Geometry): geometry is Line => {
    return geometry.type === "Line";
  });
};

export const getSelectedPins = (state: State) => {
  return getSelectedGeometries(state).filter((geometry: Geometry): geometry is Point => {
    return geometry.type === "Point";
  });
};
