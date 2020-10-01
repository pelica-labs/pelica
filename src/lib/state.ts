import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import chunk from "lodash/chunk";
import { GetState } from "zustand";

import { mapboxMapMatching } from "~/lib/mapbox";
import { createStore, immer } from "~/lib/zustand";

export type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place?: GeocodeFeature | null;
  style?: Style | null;
  editor: {
    strokeColor: string;
    strokeWidth: number;
    mode: EditorMode;
    pane: EditorPane | null;
    isPainting: boolean;
    matchMap: boolean;
  };
  currentRoute: RouteState | null;
  routes: RouteState[];
  pins: PinState[];
};

export type RouteState = {
  markers: MarkerState[];
};

export type MarkerState = {
  strokeColor: string;
  strokeWidth: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type PinState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  strokeColor: string;
  strokeWidth: number;
};

export type EditorMode = "move" | "trace" | "freeDraw" | "pin";

export type EditorPane = "styles" | "colors" | "strokeWidth";

type MapStore = ReturnType<typeof makeStore> & MapState;

const makeStore = (set: (fn: (draft: MapState) => void) => void, get: GetState<MapState>) => {
  return {
    coordinates: {
      latitude: 40,
      longitude: -74.5,
    },
    zoom: 9,

    editor: {
      strokeColor: "black",
      strokeWidth: 3,
      mode: "move" as EditorMode,
      isPainting: false,
      pane: null,
      matchMap: true,
    },

    currentRoute: null as RouteState | null,
    routes: [],
    pins: [] as PinState[],

    dispatch: {
      move(latitude: number, longitude: number, zoom: number) {
        set((state) => {
          state.coordinates.latitude = latitude;
          state.coordinates.longitude = longitude;
          state.zoom = zoom;
        });
      },

      setPlace(place: GeocodeFeature | null) {
        set((state) => {
          state.place = place;
        });
      },

      setStyle(style: Style) {
        set((state) => {
          state.style = style;
        });
      },

      setStrokeColor(strokeColor: string) {
        set((state) => {
          state.editor.strokeColor = strokeColor;
        });
      },

      setStrokeWidth(strokeWidth: number) {
        set((state) => {
          state.editor.strokeWidth = strokeWidth;
        });
      },

      togglePane(pane: EditorPane) {
        set((state) => {
          state.editor.pane = state.editor.pane !== pane ? pane : null;
        });
      },

      setEditorMode(mode: EditorMode) {
        set((state) => {
          if (state.editor.mode === "trace" && state.currentRoute) {
            state.routes.push(state.currentRoute);
            state.currentRoute = null;
          }

          state.editor.mode = mode;
        });
      },

      togglePainting(painting?: boolean) {
        set((state) => {
          state.editor.isPainting = painting ?? !state.editor.isPainting;
        });
      },

      toggleMatchMap() {
        set((state) => {
          state.editor.matchMap = !state.editor.matchMap;
        });
      },

      pushRoute(route: RouteState) {
        set((state) => {
          state.routes.push(route);
        });
      },

      startRoute() {
        set((state) => {
          state.currentRoute = {
            markers: [],
          };
        });
      },

      async endRoute() {
        const currentRoute = get().currentRoute;
        const matchMap = get().editor.matchMap;

        if (!currentRoute || currentRoute.markers.length === 0) {
          return;
        }

        set((state) => {
          state.currentRoute = null;
        });

        if (!matchMap) {
          set((state) => {
            state.routes.push(currentRoute);
          });
          return;
        }

        const chunks = await Promise.all(
          chunk(currentRoute.markers, 100).map(async (markers) => {
            if (markers.length < 2) {
              return markers;
            }

            const res = await mapboxMapMatching
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .getMatch({
                profile: "walking",
                points: markers.map((marker) => {
                  return {
                    coordinates: [marker.coordinates.longitude, marker.coordinates.latitude],
                  };
                }),
              })
              .send();

            if (!res.body.tracepoints) {
              return markers;
            }

            return (res.body.tracepoints as Tracepoint[])
              .filter((tracepoint) => tracepoint !== null)
              .map((tracepoint, i) => {
                return {
                  strokeWidth: markers[i].strokeWidth,
                  strokeColor: markers[i].strokeColor,
                  coordinates: {
                    longitude: tracepoint.location[0],
                    latitude: tracepoint.location[1],
                  },
                };
              });
          })
        );

        set((state) => {
          state.routes.push({
            markers: chunks.flat(),
          });
        });
      },

      addMarker(latitude: number, longitude: number) {
        set((state) => {
          if (!state.currentRoute) {
            return;
          }

          state.currentRoute.markers.push({
            coordinates: {
              latitude,
              longitude,
            },
            strokeColor: state.editor.strokeColor,
            strokeWidth: state.editor.strokeWidth,
          });
        });
      },

      addPin(latitude: number, longitude: number) {
        const editor = get().editor;

        set((state) => {
          state.pins.push({
            coordinates: {
              latitude,
              longitude,
            },
            strokeColor: editor.strokeColor,
            strokeWidth: editor.strokeWidth,
          });
        });
      },

      clear() {
        set((state) => {
          state.routes = [];
          state.pins = [];
          state.currentRoute = null;
        });
      },

      closePanes() {
        set((state) => {
          state.editor.pane = null;
        });
      },

      importRoute(file: File) {
        const editor = get().editor;

        const reader = new FileReader();
        reader.onload = (file) => {
          const xml = file.target?.result as string;
          if (!xml) {
            return;
          }
          const parser = new DOMParser();
          const doc = parser.parseFromString(xml, "application/xml");
          const markers = Array.from(doc.querySelectorAll("trkpt")).map((node) => {
            return {
              strokeColor: editor.strokeColor,
              strokeWidth: editor.strokeWidth,
              coordinates: {
                latitude: parseFloat(node.getAttribute("lat") as string),
                longitude: parseFloat(node.getAttribute("lon") as string),
              },
            };
          });

          this.pushRoute({
            markers,
          });
          this.move(markers[0].coordinates.latitude, markers[0].coordinates.longitude, 6);
        };

        reader.readAsText(file);
      },

      export() {
        const canvas = document.querySelector("canvas");
        if (!canvas) {
          return;
        }

        const tag = document.createElement("a");
        tag.href = canvas.toDataURL();
        tag.download = "pelica";
        tag.click();
      },
    },
  };
};

export const useStore = createStore<MapStore>(
  immer((set, get) => {
    return makeStore(set, get);
  })
);
