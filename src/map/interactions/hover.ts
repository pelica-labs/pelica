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

    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: [
        "pinsInteractions",
        "pins",
        "routesInteractions",
        "routesStop",
        "texts",
        "routesVertices",
        "routesEdges",
      ],
    });

    if (!feature) {
      return;
    }

    if (state.editor.mode !== "select") {
      return;
    }

    // remove previous hover if it changed
    if (
      state.dragAndDrop.hoveredEntityId &&
      state.dragAndDrop.hoveredEntityId !== feature.id &&
      state.dragAndDrop.hoveredEntitySource
    ) {
      const feature = { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource };

      map.setFeatureState(feature, {
        hover: false,
      });
    }

    if (state.selection.ids.find((id) => id === feature.id)) {
      return;
    }

    app.dragAndDrop.startHover(feature.id as ID, feature.source);

    map.setFeatureState(feature, {
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

  ["pinsInteractions", "pins", "routesInteractions", "routesStop", "texts", "routesVertices", "routesEdges"].forEach(
    (layer) => {
      map.on("mousemove", layer, onFeatureHover);
      map.on("mouseleave", layer, onFeatureHoverEnd);
    }
  );

  map.getCanvas().addEventListener("mouseleave", onMouseLeave);
};
