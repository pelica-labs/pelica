import { MAX_PIN_SIZE } from "~/core/pins";
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE } from "~/core/texts";
import { defaultStyles, Style } from "~/lib/style";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map, style: Style): void => {
  const styles = Object.assign({}, defaultStyles, style.overrides);

  addLayer(map, {
    id: "watermark",
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
    id: "selectionAreaFill",
    type: "fill",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: "selectionAreaContour",
    type: "line",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: "overlaysBackground",
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: "overlaysPoint",
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
    id: "overlaysUnderline",
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
    id: "overlaysContour",
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: "routes",
    before: "waterway-label",
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
    id: "routesOutlines",
    before: "routes",
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
    id: "routesHover",
    before: "routes",
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
    id: "routesInteractions",
    before: "routes",
    type: "line",
    source: MapSource.Routes,
    paint: {
      "line-width": ["+", ["get", "width"], 15],
      "line-opacity": 0,
    },
  });

  addLayer(map, {
    id: "routesStop",
    before: "waterway-label",
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
    id: "routeNextPoint",
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
    id: "pins",
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["*", 1 / MAX_PIN_SIZE, ["get", "width"]],
      "icon-offset": [0, -72],
      "icon-allow-overlap": true,

      "text-field": ["get", "label"],
      "text-offset": [
        "interpolate",
        ["linear"],
        ["get", "width"],
        0,
        ["literal", [0, -2.5]],
        MAX_PIN_SIZE,
        ["literal", [0, -6]],
      ],
      "text-font": styles.textFont,
      "text-size": ["interpolate", ["linear"], ["get", "width"], 0, ["literal", 10], MAX_PIN_SIZE, ["literal", 24]],
      "text-transform": ["get", "textTransform"],
      "text-anchor": "bottom",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": ["get", "textColor"],
      "text-halo-color": ["get", "textHaloColor"],
      "text-halo-width": 1,
    },
  });

  addLayer(map, {
    id: "pinsInteractions",
    type: "circle",
    source: MapSource.Pins,
    paint: {
      "circle-radius": ["+", ["get", "width"], 5],
      "circle-opacity": 0,
    },
  });

  addLayer(map, {
    id: "pinsHover",
    before: "pins",
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
    id: "pinsHoverCenter",
    before: "pins",
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
    id: "texts",
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
      "text-transform": ["get", "textTransform"],
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
};

const addLayer = (map: mapboxgl.Map, layer: mapboxgl.Layer & { before?: string }) => {
  if (map.getLayer(layer.id)) {
    return;
  }

  map.addLayer(layer, layer.before && map.getLayer(layer.before) ? layer.before : undefined);
};
