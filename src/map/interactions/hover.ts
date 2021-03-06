import mapboxgl, { FeatureIdentifier, MapLayerMouseEvent } from "mapbox-gl";

import { app, getState } from "~/core/app";
import { RouteEdge } from "~/core/routes";
import { canSelect, getEntity } from "~/core/selectors";
import { ID } from "~/lib/id";
import { MapLayer } from "~/map/layers";
import { MapSource } from "~/map/sources";

const hoverableLayers = [
  MapLayer.PinInteraction,
  MapLayer.Pin,
  MapLayer.PinCluster,
  MapLayer.PinClusterText,
  MapLayer.RouteInteraction,
  MapLayer.RouteStop,
  MapLayer.RouteStart,
  MapLayer.Text,
  MapLayer.RouteVertexInteraction,
  MapLayer.RouteEdge,
  MapLayer.RouteEdgeCenterInteraction,
];

const selectOnlyHoverableLayers = [
  MapLayer.PinInteraction,
  MapLayer.Pin,
  MapLayer.PinCluster,
  MapLayer.PinClusterText,
  MapLayer.RouteInteraction,
  MapLayer.Text,
  MapLayer.RouteVertex,
  MapLayer.RouteEdge,
  MapLayer.RouteEdgeCenter,
];

const toggleHover = (map: mapboxgl.Map, feature: FeatureIdentifier | mapboxgl.MapboxGeoJSONFeature, value: boolean) => {
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

export const applyHoverInteractions = (map: mapboxgl.Map): void => {
  const onMouseLeave = () => {
    setTimeout(() => {
      const state = getState();
      if (state.editor.mode === "route") {
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

    // do not change hover state if we're still dragging
    if (state.dragAndDrop.dragMoved) {
      return;
    }

    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: hoverableLayers,
    });

    // remove hover
    if (!feature) {
      if (state.dragAndDrop.hoveredEntityId && state.dragAndDrop.hoveredEntitySource) {
        toggleHover(
          map,
          { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource },
          false
        );
        app.dragAndDrop.endHover();
      }
      return;
    }

    if (selectOnlyHoverableLayers.indexOf(feature.layer.id as MapLayer) >= 0 && !canSelect(state)) {
      return;
    }

    // remove previous hover if it changed
    if (
      state.dragAndDrop.hoveredEntityId &&
      state.dragAndDrop.hoveredEntityId !== feature.id &&
      state.dragAndDrop.hoveredEntitySource
    ) {
      toggleHover(map, { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource }, false);
      app.dragAndDrop.endHover();
    }

    if (state.selection.ids.find((id) => id === feature.id)) {
      return;
    }

    app.dragAndDrop.startHover(feature.id as ID, feature.source);

    toggleHover(map, feature, true);
  };

  map.on("mousemove", onFeatureHover);

  map.getCanvas().addEventListener("mouseleave", onMouseLeave);
};
