import { MAX_PIN_SIZE } from "~/core/pins";
import { getMap } from "~/core/selectors";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export enum MapLayer {
  Watermark = "watermark",

  SelectionAreaFill = "selection-area-fill",
  SelectionAreaContour = "selection-area-contour",

  OverlayFill = "overlay-fill",
  OverlayPoint = "overlay-point",
  OverlayUnderline = "overlay-underline",
  OverlayContour = "overlay-contour",

  Route = "route",
  RouteFill = "route-fill",
  RouteOutline = "route-outline",
  RouteHover = "route-hover",
  RouteVertex = "route-vertex",
  RouteVertexInteraction = "route-vertex-interaction",
  RouteEdge = "route-edge",
  RouteEdgeCenter = "route-edge-center",
  RouteEdgeCenterInteraction = "route-edge-center-interaction",
  RouteEdgeCenterPlus = "route-edge-center-plus",
  RouteInteraction = "route-interaction",
  RouteStop = "route-stop",
  RouteStart = "route-start",
  RouteNextPointLine = "route-next-point-line",
  RouteNextPoint = "route-next-point",

  Pin = "pin",
  PinCluster = "pin-cluster",
  PinClusterText = "pin-cluster-text",
  PinPreview = "pin-preview",
  PinInteraction = "pin-interaction",
  PinHover = "pin-hover",
  PinHoverCenter = "pin-hover-center",

  Text = "text",
  TextPreview = "text-preview",

  // Mapbox
  WaterwayLabel = "waterway-label",
  Sky = "sky",
}

export const applyLayers = (): void => {
  const map = getMap();

  addLayer(map, {
    id: MapLayer.Watermark,
    type: "symbol",
    source: MapSource.Watermark,
    interactive: false,
    layout: {
      "icon-image": "watermark",
      "icon-anchor": "bottom-left",
      "icon-offset": [30, -12],
      "icon-size": 0.25,
    },
  });

  addLayer(map, {
    id: MapLayer.SelectionAreaFill,
    type: "fill",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: MapLayer.SelectionAreaContour,
    type: "line",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.OverlayFill,
    type: "fill",
    source: MapSource.Overlay,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[200],
      "fill-opacity": 0.05,
    },
  });

  addLayer(map, {
    id: MapLayer.OverlayPoint,
    type: "circle",
    source: MapSource.Overlay,
    interactive: false,
    filter: ["==", ["get", "target"], "Pin"],
    paint: {
      "circle-radius": 10,
      "circle-opacity": 0.1,
      "circle-stroke-color": theme.colors.orange[500],
      "circle-stroke-width": 1,
      "circle-color": theme.colors.orange[500],
    },
  });

  addLayer(map, {
    id: MapLayer.OverlayUnderline,
    type: "line",
    source: MapSource.Overlay,
    interactive: false,
    filter: ["==", ["get", "target"], "Text"],
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 2,
    },
  });

  addLayer(map, {
    id: MapLayer.OverlayContour,
    type: "line",
    source: MapSource.Overlay,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.Route,
    before: MapLayer.WaterwayLabel,
    type: "line",
    source: MapSource.Route,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": ["get", "width"],
      "line-opacity": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.RouteFill,
    type: "fill",
    source: MapSource.Route,
    interactive: false,
    filter: ["boolean", ["get", "filled"], false],
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: MapLayer.RouteOutline,
    before: MapLayer.Route,
    type: "line",
    source: MapSource.Route,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "outlineColor"],
      "line-width": ["+", ["get", "width"], ["get", "outlineWidth"]],
      "line-blur": ["get", "outlineBlur"],
      "line-opacity": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.RouteHover,
    before: MapLayer.Route,
    type: "line",
    interactive: false,
    source: MapSource.Route,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-width": ["+", ["get", "width"], 5],
      "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0],
      "line-color": theme.colors.orange[500],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteInteraction,
    before: MapLayer.RouteEdge,
    type: "line",
    source: MapSource.Route,
    paint: {
      "line-width": ["+", ["get", "width"], 15],
      "line-opacity": 0,
    },
  });

  addLayer(map, {
    id: MapLayer.RouteEdge,
    type: "line",
    source: MapSource.RouteEdge,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-opacity": 0,
      "line-width": ["+", ["get", "width"], 20],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteEdgeCenterInteraction,
    type: "circle",
    source: MapSource.RouteEdgeCenter,
    paint: {
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.3, 0],
      "circle-radius": 15,
      "circle-color": ["get", "color"],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteEdgeCenter,
    type: "circle",
    source: MapSource.RouteEdgeCenter,
    paint: {
      "circle-opacity": [
        "case",
        ["boolean", ["feature-state", "groupHover"], false],
        1,
        ["boolean", ["feature-state", "hover"], false],
        1,
        0,
      ],
      "circle-stroke-opacity": [
        "case",
        ["boolean", ["feature-state", "groupHover"], false],
        1,
        ["boolean", ["feature-state", "hover"], false],
        1,
        0,
      ],
      "circle-radius": 7,
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.white,
        ["get", "color"],
      ],
      "circle-stroke-width": 1,
      "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], theme.colors.white, ["get", "color"]],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteVertexInteraction,
    type: "circle",
    source: MapSource.RouteVertex,
    paint: {
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.3, 0],
      "circle-radius": 15,
      "circle-color": ["get", "color"],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteVertex,
    type: "circle",
    source: MapSource.RouteVertex,
    paint: {
      "circle-radius": ["+", ["get", "width"], 2],
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0],
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.white,
        ["get", "color"],
      ],
      "circle-color": ["get", "color"],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteEdgeCenterPlus,
    type: "symbol",
    source: MapSource.RouteEdgeCenter,
    layout: {
      "text-field": "+",
    },
    paint: {
      "text-opacity": [
        "case",
        ["boolean", ["feature-state", "groupHover"], false],
        1,
        ["boolean", ["feature-state", "hover"], false],
        1,
        0,
      ],
      "text-color": ["case", ["boolean", ["feature-state", "hover"], false], ["get", "color"], theme.colors.white],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteStop,
    type: "circle",
    source: MapSource.RouteStop,
    paint: {
      "circle-radius": 10,
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], true], 0.5, 0.1],
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 1,
      "circle-color": ["get", "color"],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteStart,
    type: "circle",
    source: MapSource.RouteStart,
    paint: {
      "circle-radius": 7,
      "circle-stroke-width": 1,
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.white,
        ["get", "color"],
      ],
      "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], ["get", "color"], theme.colors.white],
    },
  });

  addLayer(map, {
    id: MapLayer.RouteNextPointLine,
    type: "line",
    source: MapSource.RouteNextPoint,
    paint: {
      "line-color": ["get", "color"],
      "line-width": 2,
      "line-dasharray": [2, 2],
      "line-opacity": 0.5,
    },
  });

  addLayer(map, {
    id: MapLayer.RouteNextPoint,
    type: "circle",
    source: MapSource.RouteNextPoint,
    paint: {
      "circle-color": ["get", "color"],
      "circle-opacity": 0.3,
      "circle-radius": 3,
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.Pin,
    type: "symbol",
    source: MapSource.Pin,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["*", 1 / MAX_PIN_SIZE, ["get", "width"]],
      "icon-offset": ["case", ["boolean", ["get", "offset"], false], ["literal", [0, -72]], ["literal", [0, 16]]],
      "icon-allow-overlap": true,
    },
  });

  addLayer(map, {
    id: MapLayer.PinCluster,
    type: "circle",
    source: MapSource.Pin,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.orange[500],
        theme.colors.white,
      ],

      "circle-radius": 16,
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.white,
        theme.colors.orange[500],
      ],
      "circle-stroke-width": 2,
    },
  });

  addLayer(map, {
    id: MapLayer.PinClusterText,
    type: "symbol",
    source: MapSource.Pin,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Roboto Regular"],
      "text-offset": [0, 0.1],
      "text-size": 18,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.white,
        theme.colors.gray[900],
      ],
    },
  });

  addLayer(map, {
    id: MapLayer.PinPreview,
    type: "symbol",
    source: MapSource.PinPreview,
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["*", 1 / MAX_PIN_SIZE, ["get", "width"]],
      "icon-offset": ["case", ["boolean", ["get", "offset"], false], ["literal", [0, -72]], ["literal", [0, 16]]],
      "icon-allow-overlap": true,
    },
    paint: {
      "icon-opacity": 0.5,
    },
  });

  addLayer(map, {
    id: MapLayer.PinInteraction,
    type: "circle",
    source: MapSource.Pin,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": ["+", ["get", "width"], 5],
      "circle-opacity": 0,
    },
  });

  addLayer(map, {
    id: MapLayer.PinHover,
    before: MapLayer.Pin,
    type: "circle",
    interactive: false,
    source: MapSource.Pin,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 8,
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0],
      "circle-color": theme.colors.orange[300],
      "circle-stroke-color": theme.colors.orange[500],
      "circle-stroke-width": 1,
      "circle-stroke-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0],
    },
  });

  addLayer(map, {
    id: MapLayer.PinHoverCenter,
    before: MapLayer.Pin,
    type: "circle",
    interactive: false,
    source: MapSource.Pin,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 2,
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0],
      "circle-color": theme.colors.orange[500],
    },
  });

  addLayer(map, {
    id: MapLayer.Text,
    type: "symbol",
    source: MapSource.Text,
    layout: {
      "icon-image": ["get", "image"],
      "icon-anchor": "bottom",
      "icon-offset": [0, -8],
      "icon-allow-overlap": true,
    },
  });

  addLayer(map, {
    id: MapLayer.TextPreview,
    type: "symbol",
    source: MapSource.TextPreview,
    layout: {
      "icon-image": ["get", "image"],
      "icon-anchor": "bottom",
      "icon-offset": [0, -8],
      "icon-allow-overlap": true,
    },
  });
};

export const addLayer = (map: mapboxgl.Map, layer: mapboxgl.Layer & { id: MapLayer; before?: MapLayer }): void => {
  if (map.getLayer(layer.id)) {
    map.removeLayer(layer.id);
  }

  map.addLayer(layer, layer.before && map.getLayer(layer.before) ? layer.before : undefined);
};
