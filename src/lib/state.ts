import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import chunk from "lodash/chunk";
import { GetState } from "zustand";

import { Action, BrushAction } from "~/lib/actions";
import { Coordinates } from "~/lib/geometry";
import { parseGpx } from "~/lib/gpx";
import { mapboxMapMatching } from "~/lib/mapbox";
import { createStore, immer } from "~/lib/zustand";

export type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place: GeocodeFeature | null;
  style: Style | null;
  editor: {
    strokeColor: string;
    strokeWidth: number;
    mode: EditorMode;
    pane: EditorPane | null;
    isPainting: boolean;
    matchMap: boolean;
  };
  traceStart: Coordinates | null;
  currentBrush: BrushAction | null;
  actions: Action[];
};

export type EditorMode = "move" | "trace" | "brush" | "pin";

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

    place: null as GeocodeFeature | null,
    style: null as Style | null,

    actions: [] as Action[],
    currentBrush: null as BrushAction | null,
    traceStart: null as Coordinates | null,

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
          state.editor.mode = mode;
        });
      },

      toggleMatchMap() {
        set((state) => {
          state.editor.matchMap = !state.editor.matchMap;
        });
      },

      startBrush() {
        const editor = get().editor;

        set((state) => {
          state.editor.isPainting = true;
          state.currentBrush = {
            name: "brush",
            line: {
              points: [],
              style: {
                strokeColor: editor.strokeColor,
                strokeWidth: editor.strokeWidth,
              },
            },
          };
        });
      },

      brush(latitude: number, longitude: number) {
        set((state) => {
          if (state.currentBrush?.name !== "brush") {
            return;
          }

          state.currentBrush.line.points.push({ latitude, longitude });
        });
      },

      async endBrush() {
        const currentAction = get().currentBrush;
        const matchMap = get().editor.matchMap;

        if (currentAction?.name !== "brush") {
          return;
        }

        if (currentAction.line.points.length === 0) {
          return;
        }

        set((state) => {
          state.editor.isPainting = false;
          state.currentBrush = null;
        });

        if (!matchMap) {
          set((state) => {
            state.actions.push(currentAction);
          });
          return;
        }

        const chunks = await Promise.all(
          chunk(currentAction.line.points, 100).map(async (points) => {
            if (points.length < 2) {
              return points;
            }

            const res = await mapboxMapMatching
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .getMatch({
                profile: "walking",
                points: points.map((point) => {
                  return {
                    coordinates: [point.longitude, point.latitude],
                  };
                }),
              })
              .send();

            if (!res.body.tracepoints) {
              return points;
            }

            return (res.body.tracepoints as Tracepoint[])
              .filter((tracepoint) => tracepoint !== null)
              .map((tracepoint) => {
                return {
                  longitude: tracepoint.location[0],
                  latitude: tracepoint.location[1],
                };
              });
          })
        );

        set((state) => {
          state.actions.push({
            ...currentAction,
            line: {
              ...currentAction.line,
              points: chunks.flat(),
            },
          });
        });
      },

      trace(latitude: number, longitude: number) {
        const editor = get().editor;
        const traceStart = get().traceStart;

        if (!traceStart) {
          set((state) => {
            state.traceStart = { latitude, longitude };
          });
          return;
        }

        set((state) => {
          state.traceStart = { latitude, longitude };

          state.actions.push({
            name: "trace",
            line: {
              from: traceStart,
              to: { latitude, longitude },
              style: {
                strokeColor: editor.strokeColor,
                strokeWidth: editor.strokeWidth,
              },
            },
          });
        });
      },

      pin(latitude: number, longitude: number) {
        const editor = get().editor;

        set((state) => {
          state.actions.push({
            name: "pin",
            point: {
              coordinates: { latitude, longitude },
              style: {
                strokeColor: editor.strokeColor,
                strokeWidth: editor.strokeWidth,
              },
            },
          });
        });
      },

      undo() {
        set((state) => {
          if (!state.actions.length) {
            return;
          }

          state.actions.pop();
        });
      },

      clear() {
        set((state) => {
          state.actions = [];
          state.currentBrush = null;
          state.traceStart = null;
        });
      },

      closePanes() {
        set((state) => {
          state.editor.pane = null;
        });
      },

      importGpx(file: File) {
        const editor = get().editor;

        const reader = new FileReader();
        reader.onload = (file) => {
          const xml = file.target?.result as string;
          if (!xml) {
            return;
          }

          const points = parseGpx(xml);

          set((state) => {
            state.actions.push({
              name: "importGpx",
              line: {
                points,
                style: {
                  strokeColor: editor.strokeColor,
                  strokeWidth: editor.strokeWidth,
                },
              },
            });
          });
          this.move(points[0].latitude, points[0].longitude, 6);
        };

        reader.readAsText(file);
      },

      downloadImage() {
        const canvas = document.querySelector("canvas");
        if (!canvas) {
          return;
        }

        const a = document.createElement("a");
        a.href = canvas.toDataURL();
        a.download = "pelica";
        a.click();
      },

      downloadGpx() {
        const routes = get().routes;
        if (!routes.length) {
          return;
        }

        // const gpx = generateGpx(routes);

        // const a = document.createElement("a");
        // a.href = "data:application/gpx+xml," + encodeURIComponent(gpx);
        // a.download = "pelica.gpx";
        // a.click();
      },
    },
  };
};

export const useStore = createStore<MapStore>(
  immer((set, get) => {
    return makeStore(set, get);
  })
);
