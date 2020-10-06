import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import produce from "immer";
import { useEffect } from "react";
import create, { GetState, State, StateCreator, StateSelector } from "zustand";
import shallow from "zustand/shallow";

import { Action, applyAction, DrawAction } from "~/lib/actions";
import { AspectRatio } from "~/lib/aspectRatio";
import { Coordinates, Geometry, nextGeometryId, Point, PolyLine, Position } from "~/lib/geometry";
import { parseGpx } from "~/lib/gpx";
import { ScreenDimensions } from "~/lib/screen";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/lib/sources";
import { isServer } from "~/lib/ssr";
import { defaultStyle, Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

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
  selectedGeometryId: number | null;
  draggedGeometryId: number | null;

  keyboard: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };

  screen: ScreenDimensions;
};

export type EditorMode = "move" | "draw" | "pin";

export type EditorPane = "styles" | "aspectRatio";

const initialState: MapState = {
  coordinates: {
    latitude: 48.856614,
    longitude: 2.3522219,
  },
  zoom: 9,
  bearing: 0,
  pitch: 0,

  editor: {
    strokeColor: theme.colors.red[500],
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
  selectedGeometryId: null,
  draggedGeometryId: null,

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
      getSelectedGeometry() {
        const { geometries, selectedGeometryId } = get();

        return geometries.find((geometry) => geometry.id === selectedGeometryId) as Point | PolyLine;
      },

      getDraggedGeometry() {
        const { geometries, draggedGeometryId } = get();

        return geometries.find((geometry) => geometry.id === draggedGeometryId) as Point;
      },

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
            state.selectedGeometryId = null;
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

          const allActions = [...state.actions];
          if (state.currentDraw) {
            allActions.push(state.currentDraw);
          }

          allActions.forEach((action) => {
            try {
              applyAction(state, action);
            } catch (err) {
              console.error(err);
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
        this.unselectGeometry();

        set((state) => {
          state.selectedGeometryId = feature.id as number;
        });
      },

      unselectGeometry() {
        set((state) => {
          state.selectedGeometryId = null;
        });
      },

      startDrag(feature: GeoJSON.Feature<GeoJSON.Geometry>) {
        set((state) => {
          state.draggedGeometryId = feature.id as number;
        });
      },

      dragSelectedPin(coordinates: Coordinates) {
        set((state) => {
          const draggedGeometry = state.geometries.find((geometry) => geometry.id === state.draggedGeometryId) as Point;

          draggedGeometry.coordinates = coordinates;
        });
      },

      endDragSelectedPin(coordinates: Coordinates) {
        set((state) => {
          const draggedGeometry = this.getDraggedGeometry();

          state.actions.push({
            name: "movePin",
            pinId: draggedGeometry.id,
            coordinates,
          });

          state.draggedGeometryId = null;
        });
      },

      editSelectedPinCoordinates(coordinates: Coordinates) {
        set((state) => {
          const selectedGeometry = state.geometries.find(
            (geometry) => geometry.id === state.selectedGeometryId
          ) as Point;

          selectedGeometry.coordinates = coordinates;
        });
      },

      endEditSelectedPinCoordinates(coordinates: Coordinates) {
        set((state) => {
          const selectedGeometry = this.getSelectedGeometry();

          if (selectedGeometry?.type !== "Point") {
            return;
          }

          state.actions.push({
            name: "movePin",
            pinId: selectedGeometry.id,
            coordinates,
          });
        });
      },

      moveSelectedPin(direction: Position) {
        set((state) => {
          const selectedGeometry = this.getSelectedGeometry();

          state.actions.push({
            name: "nudgePin",
            pinId: selectedGeometry.id,
            direction,
            zoom: state.zoom,
          });
        });
      },

      deleteSelectedGeometry() {
        set((state) => {
          const selectedGeometry = this.getSelectedGeometry();

          state.actions.push({
            name: "deleteGeometry",
            geometryId: selectedGeometry.id,
          });
        });
      },

      updateSelectedPin(strokeColor: string, strokeWidth: number) {
        set((state) => {
          const selectedGeometry = this.getSelectedGeometry();

          state.actions.push({
            name: "updatePin",
            pinId: selectedGeometry.id,
            strokeColor,
            strokeWidth,
          });
        });
      },

      updateSelectedLine(strokeColor: string, strokeWidth: number) {
        set((state) => {
          const selectedGeometry = this.getSelectedGeometry();

          state.actions.push({
            name: "updateLine",
            lineId: selectedGeometry.id,
            strokeColor,
            strokeWidth,
          });
        });
      },

      async updateSelectedLineSmartMatching(smartMatching: SmartMatching) {
        const selectedGeometry = this.getSelectedGeometry();

        if (selectedGeometry?.type !== "PolyLine") {
          return;
        }

        const smartPoints = smartMatching.enabled
          ? await smartMatch(selectedGeometry, smartMatching.profile as SmartMatchingProfile)
          : [];

        set((state) => {
          state.actions.push({
            name: "updateLineSmartMatching",
            lineId: selectedGeometry.id,
            smartMatching,
            smartPoints,
          });
        });
      },
    },
  };
};

// 🧹 💨 🕳

export type MapStore = ReturnType<typeof makeStore>;

const immer = <T extends State>(config: StateCreator<T, (fn: (draft: T) => void) => void>): StateCreator<T> => (
  set,
  get,
  api
) => config((fn) => set(produce(fn) as (state: T) => T), get, api);

export const useStore = create<MapStore>(immer(makeStore));

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
