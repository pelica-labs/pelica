import { MapboxProfile } from "@mapbox/mapbox-sdk/lib/classes/mapi-request";
import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import produce from "immer";
import { MercatorCoordinate } from "mapbox-gl";
import { useEffect } from "react";
import create, { GetState, State, StateCreator, StateSelector } from "zustand";
import { devtools } from "zustand/middleware";
import shallow from "zustand/shallow";

import { Action, DrawAction } from "~/lib/actions";
import { Geometry, nextGeometryId, Point, PolyLine, Position, smartMatch } from "~/lib/geometry";
import { parseGpx } from "~/lib/gpx";
import { defaultStyle } from "~/lib/mapbox";
import { MapSource } from "~/lib/sources";
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
    smartMatching: SmartMatching;
  };

  actions: Action[];
  geometries: Geometry[];
  currentDraw: DrawAction | null;
  selectedGeometry: Geometry | null;

  keyboard: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };

  screen: ScreenDimensions;
};

export type SmartMatching = {
  enabled: boolean;
  profile: SmartMatchingProfile | null;
};

export type SmartMatchingProfile = MapboxProfile;

export type EditorMode = "move" | "draw" | "pin";

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
    strokeWidth: 5,
    mode: "move",
    pane: null,
    smartMatching: {
      enabled: true,
      profile: "walking",
    },
  },

  place: null,
  style: defaultStyle as Style,
  aspectRatio: "fill",

  actions: [],
  geometries: [],
  currentDraw: null,
  selectedGeometry: null,

  keyboard: {
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  },

  screen: {
    width: isServer ? 1200 : window.innerWidth,
    height: isServer ? 800 : window.innerHeight,
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
          state.actions.push({
            name: "updateStyle",
            style,
          });
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

          if (state.editor.mode !== "move") {
            state.selectedGeometry = null;
          }
        });
      },

      setEditorSmartMatching(smartMatching: SmartMatching) {
        set((state) => {
          state.editor.smartMatching = smartMatching;
        });
      },

      startDrawing() {
        const editor = get().editor;

        set((state) => {
          state.currentDraw = {
            name: "draw",
            line: {
              type: "PolyLine",
              id: nextGeometryId(),
              source: MapSource.Routes,
              points: [],
              smartPoints: [],
              selected: false,
              smartMatching: editor.smartMatching,
              style: {
                strokeColor: editor.strokeColor,
                strokeWidth: editor.strokeWidth,
              },
            },
          };
        });
      },

      draw(latitude: number, longitude: number) {
        set((state) => {
          if (state.currentDraw?.name !== "draw") {
            return;
          }

          state.currentDraw.line.points.push({ latitude, longitude });
        });
      },

      async endDrawing() {
        const currentDraw = get().currentDraw;

        if (!currentDraw) {
          return;
        }

        if (currentDraw.line.points.length === 0) {
          return;
        }

        const smartPoints = currentDraw.line.smartMatching.enabled
          ? await smartMatch(currentDraw.line, currentDraw.line.smartMatching.profile as SmartMatchingProfile)
          : [];

        set((state) => {
          state.actions.push({
            ...currentDraw,
            line: {
              ...currentDraw.line,
              smartPoints,
            },
          });
          state.currentDraw = null;
        });
      },

      pin(latitude: number, longitude: number) {
        const editor = get().editor;

        set((state) => {
          state.actions.push({
            name: "pin",
            point: {
              type: "Point",
              id: nextGeometryId(),
              source: MapSource.Pins,
              coordinates: { latitude, longitude },
              selected: false,
              style: {
                strokeColor: editor.strokeColor,
                strokeWidth: editor.strokeWidth,
              },
            },
          });
        });
      },

      applyActions() {
        set((state) => {
          state.geometries = [];
          state.style = defaultStyle as Style;
          state.selectedGeometry = null;

          const allActions = [...state.actions];
          if (state.currentDraw) {
            allActions.push(state.currentDraw);
          }

          allActions.forEach((action) => {
            if (action.name === "draw") {
              state.geometries.push({ ...action.line });
            }

            if (action.name === "pin") {
              state.geometries.push({ ...action.point });
            }

            if (action.name === "importGpx") {
              state.geometries.push({ ...action.line });
            }

            if (action.name === "selectGeometry") {
              if (state.selectedGeometry) {
                state.selectedGeometry.selected = false;
              }

              state.selectedGeometry = state.geometries.find((geometry) => geometry.id === action.geometryId) as Point;
              if (state.selectedGeometry) {
                state.selectedGeometry.selected = true;
              }
            }

            if (action.name === "movePin") {
              const point = state.geometries.find((geometry) => geometry.id === action.pinId) as Point;

              const pointCoordinates = MercatorCoordinate.fromLngLat(
                { lng: point.coordinates.longitude, lat: point.coordinates.latitude },
                0
              );

              const base = 2 ** (-action.zoom - 1);
              pointCoordinates.x += base * action.direction.x;
              pointCoordinates.y += base * action.direction.y;

              const { lat, lng } = pointCoordinates.toLngLat();
              point.coordinates = { latitude: lat, longitude: lng };
            }

            if (action.name === "updatePin") {
              const point = state.geometries.find((geometry) => geometry.id === action.pinId) as Point;

              point.style = {
                strokeWidth: action.strokeWidth,
                strokeColor: action.strokeColor,
              };
            }

            if (action.name === "updateLine") {
              const line = state.geometries.find((geometry) => geometry.id === action.lineId) as PolyLine;

              line.style = {
                strokeWidth: action.strokeWidth,
                strokeColor: action.strokeColor,
              };
            }

            if (action.name === "updateLineSmartMatching") {
              const line = state.geometries.find((geometry) => geometry.id === action.lineId) as PolyLine;

              line.smartMatching = action.smartMatching;
              line.smartPoints = action.smartPoints;
            }

            if (action.name === "deleteGeometry") {
              const geometryIndex = state.geometries.findIndex((geometry) => geometry.id === action.geometryId);
              if (geometryIndex >= 0) {
                state.geometries.splice(geometryIndex, 1);
                state.selectedGeometry = null;
              }
            }

            if (action.name === "updateStyle") {
              state.style = action.style;
            }
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
          state.currentDraw = null;
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
                type: "PolyLine",
                id: nextGeometryId(),
                source: MapSource.Routes,
                smartMatching: { enabled: false, profile: null },
                selected: false,
                points,
                smartPoints: [],
                style: {
                  strokeColor: editor.strokeColor,
                  strokeWidth: editor.strokeWidth,
                },
              },
            });
          });
          this.move(points[0].latitude, points[0].longitude, 6, 0, 0);
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

      selectGeometry(feature: GeoJSON.Feature<GeoJSON.Geometry>) {
        set((state) => {
          state.actions.push({
            name: "selectGeometry",
            geometryId: feature.id as number,
          });
        });
      },

      moveSelectedPin(direction: Position) {
        set((state) => {
          if (!state.selectedGeometry) {
            return;
          }

          state.actions.push({
            name: "movePin",
            pinId: state.selectedGeometry.id,
            direction,
            zoom: state.zoom,
          });
        });
      },

      deleteSelectedGeometry() {
        set((state) => {
          if (!state.selectedGeometry) {
            return;
          }

          state.actions.push({
            name: "deleteGeometry",
            geometryId: state.selectedGeometry.id,
          });
        });
      },

      updateSelectedPin(strokeColor: string, strokeWidth: number) {
        set((state) => {
          if (!state.selectedGeometry) {
            return;
          }

          state.actions.push({
            name: "updatePin",
            pinId: state.selectedGeometry.id,
            strokeColor,
            strokeWidth,
          });
        });
      },

      updateSelectedLine(strokeColor: string, strokeWidth: number) {
        set((state) => {
          if (!state.selectedGeometry) {
            return;
          }

          state.actions.push({
            name: "updateLine",
            lineId: state.selectedGeometry.id,
            strokeColor,
            strokeWidth,
          });
        });
      },

      async updateSelectedLineSmartMatching(smartMatching: SmartMatching) {
        const selectedGeometry = get().selectedGeometry;

        if (selectedGeometry?.type !== "PolyLine") {
          return;
        }

        const smartPoints = smartMatching.enabled
          ? await smartMatch(selectedGeometry, smartMatching.profile as SmartMatchingProfile)
          : [];

        set((state) => {
          if (!state.selectedGeometry) {
            return;
          }

          state.actions.push({
            name: "updateLineSmartMatching",
            lineId: state.selectedGeometry.id,
            smartMatching,
            smartPoints,
          });
        });
      },
    },
  };
};

// 🧹 💨 🕳

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
