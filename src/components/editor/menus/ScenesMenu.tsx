import { distance } from "@turf/turf";
import BezierEasing from "bezier-easing";
import { Promise } from "bluebird";
import classNames from "classnames";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { StylePreview } from "~/components/saved-maps/StylePreview";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { CameraIcon, PlayIcon } from "~/components/ui/Icon";
import { app, getState, useStore } from "~/core/app";
import { Breakpoint } from "~/core/scenes";
import { getMap } from "~/core/selectors";
import { stringId } from "~/lib/id";
import { mapboxGeocoding } from "~/lib/mapbox";
import { sleep } from "~/lib/promise";
import { staticImage } from "~/lib/staticImages";

export const ScenesMenu: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const breakpoints = useStore((store) => store.scenes.breakpoints);
  const style = useStore((store) => store.editor.style);

  const onCaptureBreakpoint = async () => {
    const state = getState();

    const res = await mapboxGeocoding
      .reverseGeocode({
        query: state.map.coordinates as [number, number],
        mode: "mapbox.places",
        types: ["country", "region", "place"],
      })
      .send();

    const sceneName = res.body.features[0]?.text ?? `Scene #${breakpoints.length + 1}`;

    app.scenes.addBreakpoint({
      id: stringId() as string,
      name: sceneName,
      coordinates: state.map.coordinates,
      zoom: state.map.zoom,
      bearing: state.map.bearing,
      pitch: state.map.pitch,
    });
  };

  const onSelectBreakpoint = (breakpoint: Breakpoint) => {
    const map = getMap();

    map.setCenter(breakpoint.coordinates as [number, number]);
    map.setZoom(breakpoint.zoom);
    map.setBearing(breakpoint.bearing);
    map.setPitch(breakpoint.pitch);
  };

  const onPlay = async () => {
    setIsPlaying(true);

    const map = getMap();
    const [start] = breakpoints;

    if (!start) {
      return;
    }

    map.setCenter(start.coordinates as [number, number]);
    map.setZoom(start.zoom);
    map.setBearing(start.bearing);
    map.setPitch(start.pitch);

    await sleep(1000);

    await Promise.each(breakpoints, async (breakpoint, index) => {
      if (index === 0) {
        return;
      }

      const distanceToBreakpoint = distance(breakpoints[index - 1].coordinates, breakpoint.coordinates, {
        units: "kilometers",
      });

      map.flyTo({
        center: breakpoint.coordinates as [number, number],
        zoom: breakpoint.zoom,
        bearing: breakpoint.bearing,
        pitch: breakpoint.pitch,
        animate: true,
        essential: true,
        duration: Math.max(4000, distanceToBreakpoint * 40),
        easing: BezierEasing(0.42, 0.0, 0.58, 1.0), // ease-in-out
      });

      await new Promise((resolve) => {
        map.once("moveend", () => {
          resolve();
        });
      });
    });

    setIsPlaying(false);
  };

  return (
    <MenuSection>
      <MenuSectionHeader className="justify-between">
        <Heading>Breakpoints</Heading>
        <Button
          className="text-sm md:text-xs space-x-2"
          disabled={!breakpoints.length || isPlaying}
          onClick={() => {
            onPlay();
          }}
        >
          <PlayIcon className="w-4 h-4" />
          <span>{isPlaying ? "Playing" : "Play"}</span>
        </Button>
      </MenuSectionHeader>

      <div
        className={classNames({
          "flex flex-col space-y-4": true,
          "mt-2": breakpoints.length,
        })}
      >
        <DragDropContext
          onDragEnd={(result) => {
            if (!result || !result.destination) {
              return;
            }

            app.scenes.moveBreakpoint(result.source.index, result.destination.index);
          }}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                className={classNames({
                  "p-1 pb-0 rounded": true,
                  "bg-gray-200": snapshot.isDraggingOver,
                })}
                style={{ margin: -4 }}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {breakpoints.map((breakpoint, index) => {
                  const url = staticImage({
                    coordinates: breakpoint.coordinates,
                    zoom: breakpoint.zoom,
                    pitch: breakpoint.pitch,
                    bearing: breakpoint.bearing,
                    height: 500,
                    width: 1000,
                    style,
                  });

                  return (
                    <Draggable key={breakpoint.id} draggableId={breakpoint.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          className={classNames({
                            "relative group flex flex-col items-stretch rounded mb-1": true,
                            "bg-orange-100": snapshot.isDragging,
                          })}
                          {...provided.draggableProps}
                        >
                          <div
                            key={index}
                            className="h-20 flex flex-col items-stretch relative"
                            {...provided.dragHandleProps}
                            onClick={() => {
                              onSelectBreakpoint(breakpoint);
                            }}
                          >
                            <StylePreview hash={style.hash || null} src={url} />
                            <div className="absolute bottom-0 left-0 right-0 m-1 truncate text-white rounded leading-tight">
                              <span className="text-xs font-medium tracking-wide bg-gray-800 bg-opacity-50 rounded text-white py-px px-1 truncate max-w-full">
                                {breakpoint.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Button
        className="mt-2 text-center space-x-2 text-sm md:text-xs"
        onClick={() => {
          onCaptureBreakpoint();
        }}
      >
        <CameraIcon className="w-4 h-4" />
        <span className="flex-1 text-center">Capture breakpoint</span>
      </Button>
    </MenuSection>
  );
};
