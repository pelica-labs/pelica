import { MapLayerMouseEvent } from "mapbox-gl";

import { app, getState } from "~/core/app";
import { getMap } from "~/core/selectors";
import { ID } from "~/lib/id";

export const applyHoverInteractions = (): void => {
  const map = getMap();

  const onMouseLeave = () => {
    setTimeout(() => {
      const state = getState();
      if (state.editor.mode === "draw") {
        app.routes.updateNextPoint(null);
      } else if (state.editor.mode === "text") {
        app.texts.updateNextPoint(null);
      } else if (state.editor.mode === "pin") {
        app.pins.updateNextPoint(null);
      }
    }, 50);
  };

  const onFeatureHover = (event: MapLayerMouseEvent) => {
    const state = getState();

    if (!event.features?.length) {
      return;
    }

    if (state.editor.mode !== "select") {
      return;
    }

    // remove previous hover if it changed
    if (
      state.dragAndDrop.hoveredEntityId &&
      state.dragAndDrop.hoveredEntityId !== event.features[0].id &&
      state.dragAndDrop.hoveredEntitySource
    ) {
      const feature = { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource };

      map.setFeatureState(feature, {
        hover: false,
      });
    }

    app.dragAndDrop.startHover(event.features[0].id as ID, event.features[0].source);

    map.setFeatureState(event.features[0], {
      hover: true,
    });
  };

  const onFeatureHoverEnd = (event: MapLayerMouseEvent) => {
    const state = getState();

    if (!state.dragAndDrop.hoveredEntityId || !state.dragAndDrop.hoveredEntitySource) {
      return;
    }

    const features = map.queryRenderedFeatures(event.point);

    const stillHovering = features.find((feature) => feature.state.hover);
    if (!stillHovering) {
      app.dragAndDrop.endHover();
    }

    const feature = { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource };
    map.setFeatureState(feature, {
      hover: false,
    });
  };

  ["pinsInteractions", "pins", "routesInteractions", "routesStop", "texts"].forEach((layer: string) => {
    map.on("mousemove", layer, onFeatureHover);
    map.on("mouseleave", layer, onFeatureHoverEnd);
  });

  map.getCanvas().addEventListener("mouseleave", onMouseLeave);
};
