import { app } from "~/core/app";
import { getMap } from "~/core/selectors";

export const applyMoveInteractions = (): void => {
  const map = getMap();

  const onMoveEnd = () => {
    app.map.move(map.getCenter().toArray(), map.getZoom(), map.getBearing(), map.getPitch());
    app.map.updateFeatures(map.getCenter().toArray());
  };

  map.on("moveend", onMoveEnd);

  // Call it straight away to have an up to date state.
  onMoveEnd();
};
