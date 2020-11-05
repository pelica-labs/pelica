import { getState } from "~/core/app";
import { MAX_PIN_SIZE } from "~/core/pins";
import { getMap } from "~/core/selectors";
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE } from "~/core/texts";
import { defaultStyles } from "~/lib/style";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export enum MapLayer {
  Watermark = "watermark",

  SelectionAreaFill = "selectionAreaFill",
  SelectionAreaContour = "selectionAreaContour",

  OverlaysBackground = "overlaysBackground",
  OverlaysPoint = "overlaysPoint",
  OverlaysUnderline = "overlaysUnderline",
  OverlaysContour = "overlaysContour",

  Routes = "routes",
  RoutesFill = "routesFill",
  RoutesOutlines = "routesOutlines",
  RoutesHover = "routesHover",
  RoutesVertices = "routesVertices",
  RoutesEdges = "routesEdges",
  RoutesEdgesOutlines = "routesEdgesOutlines",
  RoutesEdgeCenters = "routesEdgeCenters",
  RoutesEdgeCenterPlus = "routesEdgeCenterPlus",
  RoutesInteractions = "routesInteractions",
  RoutesStop = "routesStop",
  RoutesStart = "routesStart",
  RouteNextPointLine = "routeNextPointLine",
  RouteNextPoint = "routeNextPoint",

  Pins = "pins",
  PinPreview = "pinPreview",
  PinsInteractions = "pinsInteractions",
  PinsHover = "pinsHover",
  PinsHoverCenter = "pinsHoverCenter",

  Texts = "texts",
  TextPreview = "textPreview",

  // Mapbox
  WaterwayLabel = "waterway-label",
}

export const applyLayers = (): void => {
  const map = getMap();

  const style = getState().editor.style;
  const styles = Object.assign({}, defaultStyles, style.overrides);

  addLayer(map, {
    id: MapLayer.Watermark,
    type: "symbol",
    source: MapSource.Watermark,
    interactive: false,
    layout: {
      "icon-image": "watermark",
      "icon-anchor": "bottom-left",
      "icon-offset": [8, -6],
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
    id: MapLayer.OverlaysBackground,
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[200],
      "fill-opacity": 0.05,
    },
  });

  addLayer(map, {
    id: MapLayer.OverlaysPoint,
    type: "circle",
    source: MapSource.Overlays,
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
    id: MapLayer.OverlaysUnderline,
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    filter: ["==", ["get", "target"], "Text"],
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 2,
    },
  });

  addLayer(map, {
    id: MapLayer.OverlaysContour,
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: MapLayer.Routes,
    before: MapLayer.WaterwayLabel,
    type: "line",
    source: MapSource.Routes,
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
    id: MapLayer.RoutesFill,
    type: "fill",
    source: MapSource.Routes,
    interactive: false,
    filter: ["boolean", ["get", "closed"], false],
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: MapLayer.RoutesOutlines,
    before: MapLayer.Routes,
    type: "line",
    source: MapSource.Routes,
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
    id: MapLayer.RoutesHover,
    before: MapLayer.Routes,
    type: "line",
    interactive: false,
    source: MapSource.Routes,
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
    id: MapLayer.RoutesVertices,
    type: "circle",
    source: MapSource.RouteVertex,
    paint: {
      "circle-radius": ["+", ["get", "width"], 3],
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
    id: MapLayer.RoutesEdges,
    before: MapLayer.RoutesVertices,
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
    id: MapLayer.RoutesEdgesOutlines,
    before: MapLayer.RoutesVertices,
    type: "line",
    source: MapSource.RouteEdge,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": ["+", ["get", "width"], 3],
      "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.3],
    },
  });

  addLayer(map, {
    id: MapLayer.RoutesEdgeCenters,
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
      "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], ["get", "color"], theme.colors.white],
    },
  });

  addLayer(map, {
    id: MapLayer.RoutesEdgeCenterPlus,
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
      "text-color": ["case", ["boolean", ["feature-state", "hover"], false], theme.colors.white, ["get", "color"]],
    },
  });

  addLayer(map, {
    id: MapLayer.RoutesInteractions,
    before: MapLayer.RoutesEdges,
    type: "line",
    source: MapSource.Routes,
    paint: {
      "line-width": ["+", ["get", "width"], 15],
      "line-opacity": 0,
    },
  });

  addLayer(map, {
    id: MapLayer.RoutesStop,
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
    id: MapLayer.RoutesStart,
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
    id: MapLayer.Pins,
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["*", 1 / MAX_PIN_SIZE, ["get", "width"]],
      "icon-offset": [0, -72],
      "icon-allow-overlap": true,
    },
  });

  addLayer(map, {
    id: MapLayer.PinPreview,
    type: "symbol",
    source: MapSource.PinPreview,
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["*", 1 / MAX_PIN_SIZE, ["get", "width"]],
      "icon-offset": [0, -72],
      "icon-allow-overlap": true,
    },
    paint: {
      "icon-opacity": 0.5,
    },
  });

  addLayer(map, {
    id: MapLayer.PinsInteractions,
    type: "circle",
    source: MapSource.Pins,
    paint: {
      "circle-radius": ["+", ["get", "width"], 5],
      "circle-opacity": 0,
    },
  });

  addLayer(map, {
    id: MapLayer.PinsHover,
    before: MapLayer.Pins,
    type: "circle",
    interactive: false,
    source: MapSource.Pins,
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
    id: MapLayer.PinsHoverCenter,
    before: MapLayer.Pins,
    type: "circle",
    interactive: false,
    source: MapSource.Pins,
    paint: {
      "circle-radius": 2,
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0],
      "circle-color": theme.colors.orange[500],
    },
  });

  addLayer(map, {
    id: MapLayer.Texts,
    type: "symbol",
    source: MapSource.Texts,
    layout: {
      "text-field": ["get", "label"],
      "text-font": styles.textFont,

      "text-size": [
        "interpolate",
        ["linear"],
        ["get", "width"],
        MIN_TEXT_SIZE,
        ["literal", MIN_TEXT_SIZE],
        MAX_TEXT_SIZE,
        ["literal", MAX_TEXT_SIZE],
      ],
      "text-transform": styles.textTransform,
      "text-anchor": "bottom",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": ["get", "color"],
      "text-halo-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        theme.colors.orange[500],
        ["get", "outlineColor"],
      ],
      "text-halo-blur": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, ["get", "outlineBlur"]],
      "text-halo-width": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, ["get", "outlineWidth"]],
    },
  });

  addLayer(map, {
    id: MapLayer.TextPreview,
    type: "symbol",
    source: MapSource.TextPreview,
    layout: {
      "text-field": ["get", "label"],
      "text-font": styles.textFont,

      "text-size": [
        "interpolate",
        ["linear"],
        ["get", "width"],
        MIN_TEXT_SIZE,
        ["literal", MIN_TEXT_SIZE],
        MAX_TEXT_SIZE,
        ["literal", MAX_TEXT_SIZE],
      ],
      "text-transform": styles.textTransform,
      "text-anchor": "bottom",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": ["get", "color"],
      "text-halo-color": ["get", "outlineColor"],
      "text-halo-blur": ["get", "outlineBlur"],
      "text-halo-width": ["get", "outlineWidth"],
      "text-opacity": 0.5,
    },
  });
};

const addLayer = (map: mapboxgl.Map, layer: mapboxgl.Layer & { id: MapLayer; before?: MapLayer }) => {
  if (map.getLayer(layer.id)) {
    return;
  }

  map.addLayer(layer, layer.before && map.getLayer(layer.before) ? layer.before : undefined);
};
