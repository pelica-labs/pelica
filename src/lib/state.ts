import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import produce from "immer";
import { chunk } from "lodash";
import { useEffect } from "react";
import create, { GetState, State, StateCreator, StateSelector } from "zustand";
import { devtools } from "zustand/middleware";
import shallow from "zustand/shallow";

import { Action, BrushAction } from "~/lib/actions";
import { Coordinates } from "~/lib/geometry";
import { parseGpx } from "~/lib/gpx";
import { defaultStyle, mapboxMapMatching } from "~/lib/mapbox";
import { isServer } from "~/lib/ssr";

export type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  bearing: number;
  pitch: number;

  style: Style;
  aspectRatio: AspectRatio;

  place: GeocodeFeature | null;

  editor: {
    strokeColor: string;
    strokeWidth: number;
    mode: EditorMode;
    pane: EditorPane | null;
    smartMatching: boolean;
  };

  traceStart: Coordinates | null;
  currentBrush: BrushAction | null;
  actions: Action[];

  keyboard: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };

  screen: ScreenDimensions;
};

export type EditorMode = "move" | "trace" | "brush" | "pin";

export type EditorPane = "styles" | "aspectRatio";

export type AspectRatio = "square" | "fill";

export type ScreenDimensions = {
  width: number;
  height: number;
};

const initialState: MapState = {
  coordinates: {
    latitude: 40,
    longitude: -74.5,
  },
  zoom: 9,
  bearing: 0,
  pitch: 0,

  editor: {
    strokeColor: "#1824a2",
    strokeWidth: 2,
    mode: "move",
    pane: null,
    smartMatching: true,
  },

  place: null,
  style: defaultStyle as Style,
  aspectRatio: "fill",

  actions: [],
  currentBrush: null,
  traceStart: null,

  keyboard: {
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  },

  screen: {
    width: isServer ? 0 : window.innerWidth,
    height: isServer ? 0 : window.innerHeight,
  },
};

const makeStore = (set: (fn: (draft: MapState) => void) => void, get: GetState<MapState>) => {
  return {
    ...initialState,

    dispatch: {
      move(latitude: number, longitude: number, zoom: number, bearing: number, pitch: number) {
        set((state) => {
          state.coordinates.latitude = latitude;
          state.coordinates.longitude = longitude;
          state.zoom = zoom;
          state.bearing = bearing;
          state.pitch = pitch;
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

      resetOrientation() {
        set((state) => {
          state.bearing = 0;
        });

        setTimeout(() => {
          set((state) => {
            state.pitch = 0;
          });
        });
      },

      setAspectRatio(aspectRatio: AspectRatio) {
        set((state) => {
          state.aspectRatio = aspectRatio;
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

      toggleSmartMatching() {
        set((state) => {
          state.editor.smartMatching = !state.editor.smartMatching;
        });
      },

      startBrush() {
        const editor = get().editor;

        set((state) => {
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
        const matchMap = get().editor.smartMatching;

        if (currentAction?.name !== "brush") {
          return;
        }

        if (currentAction.line.points.length === 0) {
          return;
        }

        set((state) => {
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
        // const routes = get().routes;
        // if (!routes.length) {
        //   return;
        // }
        // const gpx = generateGpx(routes);
        // const a = document.createElement("a");
        // a.href = "data:application/gpx+xml," + encodeURIComponent(gpx);
        // a.download = "pelica.gpx";
        // a.click();
      },

      updateKeyboard(event: MapState["keyboard"]) {
        set((state) => {
          state.keyboard = event;
        });
      },

      updateScreen(width: number, height: number) {
        set((state) => {
          state.screen.width = width;
          state.screen.height = height;
        });
      },
    },
  };
};

type MapStore = ReturnType<typeof makeStore>;

const immer = <T extends State>(config: StateCreator<T, (fn: (draft: T) => void) => void>): StateCreator<T> => (
  set,
  get,
  api
) => config((fn) => set(produce(fn) as (state: T) => T), get, api);

export const useStore = create<MapStore>(devtools(immer(makeStore)));

export const useStoreSubscription = <T extends MapState, StateSlice>(
  selector: StateSelector<T, StateSlice>,
  listener: (state: StateSlice) => void
): void => {
  return useEffect(() => {
    return useStore.subscribe(
      (state) => {
        if (state !== null) {
          listener(state);
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      selector,
      shallow
    );
  }, []);
};

export const getState = (): MapState => useStore.getState();
