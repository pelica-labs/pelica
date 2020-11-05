import { FeatureIdentifier, MapLayerMouseEvent } from "mapbox-gl";

import { app, getState } from "~/core/app";
import { RouteEdge } from "~/core/routes";
import { getEntity, getMap } from "~/core/selectors";
import { ID } from "~/lib/id";
import { MapLayer } from "~/map/layers";
import { MapSource } from "~/map/sources";

const hoverableLayers = [
  MapLayer.PinsInteractions,
  MapLayer.Pins,
  MapLayer.RoutesInteractions,
  MapLayer.RoutesStop,
  MapLayer.RoutesStart,
  MapLayer.Texts,
  MapLayer.RoutesVertices,
  MapLayer.RoutesEdges,
  MapLayer.RoutesEdgeCenters,
];

const toggleHover = (feature: FeatureIdentifier | mapboxgl.MapboxGeoJSONFeature, value: boolean) => {
  const map = getMap();

  map.setFeatureState(feature, {
    hover: value,
  });

  if (feature.source === MapSource.RouteEdge) {
    const edge = getEntity(feature.id as ID) as RouteEdge;
    if (!edge) {
      return;
    }

    const centerFeature = {
      id: edge.centerId,
      source: MapSource.RouteEdgeCenter,
    };

    map.setFeatureState(centerFeature, {
      groupHover: value,
    });
  }
};

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
      layers: hoverableLayers,
    });

    if (!feature) {
      return;
    }

    // if (state.editor.mode !== "select") {
    //   return;
    // }

    // remove previous hover if it changed
    if (
      state.dragAndDrop.hoveredEntityId &&
      state.dragAndDrop.hoveredEntityId !== feature.id &&
      state.dragAndDrop.hoveredEntitySource
    ) {
      const feature = { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource };

      toggleHover(feature, false);
    }

    if (state.selection.ids.find((id) => id === feature.id)) {
      return;
    }

    app.dragAndDrop.startHover(feature.id as ID, feature.source);

    toggleHover(feature, true);
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
    toggleHover(feature, false);
  };

  hoverableLayers.forEach((layer) => {
    map.on("mousemove", layer, onFeatureHover);
    map.on("mouseleave", layer, onFeatureHoverEnd);
  });

  map.getCanvas().addEventListener("mouseleave", onMouseLeave);
};
