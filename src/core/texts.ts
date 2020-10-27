import { bbox, bboxPolygon, centerOfMass, lineString, Position } from "@turf/turf";
import { MercatorCoordinate } from "mapbox-gl";

import { nextEntityId } from "~/core/entities";
import { App } from "~/core/helpers";
import { OutlineType, Route } from "~/core/routes";
import { getSelectedEntity, getSelectedTexts } from "~/core/selectors";
import { MapSource } from "~/map/sources";

export const MIN_TEXT_SIZE = 6;
export const MAX_TEXT_SIZE = 72;

export type TextStyle = {
  color: string;
  width: number;
  label: string;
  outline: OutlineType;
};

export type Text = {
  id: number;
  source: MapSource;
  type: "Text";
  coordinates: Position;
  style: TextStyle & {
    target?: "Text";
  };
  transientStyle?: TextStyle;
};

type Texts = {
  nextPoint: Position | null;
  style: TextStyle;
};

export const textsInitialState: Texts = {
  nextPoint: null,
  style: {
    color: "#000000",
    width: 24,
    label: "Text",
    outline: "white",
  },
};

export const texts = ({ mutate, get }: App) => ({
  ...textsInitialState,

  setStyle: (style: Partial<TextStyle>) => {
    mutate((state) => {
      Object.assign(state.texts.style, style);

      const selectedEntity = getSelectedEntity(state);
      if (selectedEntity?.type === "Text") {
        Object.assign(selectedEntity.style, style);
      }
    });
  },

  updateNextPoint: (coordinates: Position | null) => {
    mutate((state) => {
      state.texts.nextPoint = coordinates;
    });
  },

  place: (coordinates: Position) => {
    const textId = nextEntityId();

    get().history.push({
      name: "placeText",
      text: {
        type: "Text",
        id: textId,
        source: MapSource.Texts,
        coordinates,
        style: get().texts.style,
      },
    });

    get().selection.selectEntity(textId);
  },

  attachToRoute: (route: Route, label: string) => {
    const center = centerOfMass(bboxPolygon(bbox(lineString(route.points))));
    if (!center.geometry) {
      return;
    }

    const textId = nextEntityId();

    get().history.push({
      name: "placeText",
      text: {
        type: "Text",
        id: textId,
        source: MapSource.Texts,
        coordinates: center.geometry.coordinates,
        style: {
          color: route.style.color,
          label,
          width: 32,
          outline: "dark",
        },
      },
    });

    get().selection.selectEntity(textId);
  },

  transientUpdateSelectedText: (style: Partial<TextStyle>) => {
    mutate((state) => {
      getSelectedTexts(state).forEach((text) => {
        if (!text.transientStyle) {
          text.transientStyle = text.style;
        }

        Object.assign(text.transientStyle, style);
      });
    });
  },

  updateSelectedText: (style: Partial<TextStyle>) => {
    mutate((state) => {
      getSelectedTexts(state).forEach((pin) => {
        delete pin.transientStyle;
      });
    });

    const selectedTexts = getSelectedTexts(get());
    get().history.push({
      name: "updateText",
      textIds: selectedTexts.map((text) => text.id),
      style,
    });
  },

  nudgeSelectedText: (direction: Position) => {
    const selectedText = getSelectedEntity(get()) as Text;

    const pointCoordinates = MercatorCoordinate.fromLngLat(selectedText.coordinates as [number, number], 0);
    const base = 2 ** (-get().map.zoom - 1);
    pointCoordinates.x += base * direction[0];
    pointCoordinates.y += base * direction[1];

    get().history.push({
      name: "moveText",
      textId: selectedText.id,
      coordinates: pointCoordinates.toLngLat().toArray(),
    });
  },
});
