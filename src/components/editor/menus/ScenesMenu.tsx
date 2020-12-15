import { Menu } from "@headlessui/react";
import classNames from "classnames";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { StylePreview } from "~/components/saved-maps/StylePreview";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { CameraIcon, EyeIcon, PlayIcon, TimerIcon, TrashIcon, VerticalDotsIcon } from "~/components/ui/Icon";
import { app, getState, useStore } from "~/core/app";
import { Breakpoint } from "~/core/scenes";
import { getMap } from "~/core/selectors";
import { stringId } from "~/lib/id";
import { mapboxGeocoding } from "~/lib/mapbox";
import { staticImage } from "~/lib/staticImages";
import { theme } from "~/styles/tailwind";

export const ScenesMenu: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const breakpoints = useStore((store) => store.scenes.breakpoints);

  const onCaptureBreakpoint = async () => {
    const state = getState();

    if (!state.map.current) return;

    const res = await mapboxGeocoding
      .reverseGeocode({
        query: state.map.coordinates as [number, number],
        mode: "mapbox.places",
        types: ["country", "region", "place"],
      })
      .send();

    const sceneName = res.body.features[0]?.text ?? `Scene #${breakpoints.length + 1}`;
    // the mapbox types are not great..
    const { position, orientation } = (state.map.current.getFreeCameraOptions() as unknown) as {
      position: { x: number; y: number; z: number };
      orientation: number[];
    };

    app.scenes.addBreakpoint({
      id: stringId() as string,
      name: sceneName,
      coordinates: state.map.coordinates,
      zoom: state.map.zoom,
      bearing: state.map.bearing,
      pitch: state.map.pitch,
      position,
      orientation,
      duration: 4000,
    });
  };

  const onPlay = async () => {
    setIsPlaying(true);

    await app.scenes.play();

    setIsPlaying(false);
  };

  return (
    <MenuSection>
      <MenuSectionHeader className="justify-between">
        <Heading>Scenes</Heading>
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
                  return (
                    <div key={breakpoint.id}>
                      <Draggable draggableId={breakpoint.id} index={index}>
                        {(provided, snapshot) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              className={classNames({
                                "relative group flex flex-col items-stretch rounded mb-1": true,
                              })}
                              {...provided.draggableProps}
                            >
                              {index !== 0 && (
                                <BreakpointDurationInput breakpoint={breakpoint} isDragging={snapshot.isDragging} />
                              )}
                              <div
                                key={index}
                                className="h-20 flex flex-col items-stretch relative"
                                {...provided.dragHandleProps}
                              >
                                <SceneBreakpoint breakpoint={breakpoint} />
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    </div>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Button
        className="mt-6 py-2 text-center space-x-2 text-sm md:text-xs"
        onClick={() => {
          onCaptureBreakpoint();
        }}
      >
        <CameraIcon className="w-4 h-4" />
        <span className="flex-1 text-center">Capture scene</span>
      </Button>
    </MenuSection>
  );
};

type SceneBreakpointProps = {
  breakpoint: Breakpoint;
};

const SceneBreakpoint: React.FC<SceneBreakpointProps> = ({ breakpoint }) => {
  const style = useStore((store) => store.editor.style);

  const url = staticImage({
    coordinates: breakpoint.coordinates,
    zoom: breakpoint.zoom,
    pitch: breakpoint.pitch,
    bearing: breakpoint.bearing,
    height: 500,
    width: 1000,
    style,
  });

  const onSelectBreakpoint = () => {
    const map = getMap();

    map.setCenter(breakpoint.coordinates as [number, number]);
    map.setZoom(breakpoint.zoom);
    map.setBearing(breakpoint.bearing);
    map.setPitch(breakpoint.pitch);
  };

  const onDeleteBreakpoint = () => {
    app.scenes.deleteBreakpoint(breakpoint);
  };

  return (
    <div className="flex flex-col items-stretch h-full">
      <StylePreview hash={style.hash || null} src={url} />
      <div className="absolute bottom-0 left-0 right-0 m-1 truncate text-white rounded leading-tight">
        <span className="text-xs font-medium tracking-wide bg-gray-800 bg-opacity-50 rounded text-white py-px px-1 truncate max-w-full">
          {breakpoint.name}
        </span>
      </div>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              as="div"
              className="appearance-none absolute top-0 right-0 cursor-pointer text-white hover:text-orange-500"
            >
              <VerticalDotsIcon className="bg-gray-800 bg-opacity-50 rounded w-4 h-5 py-1 m-1" />
            </Menu.Button>

            {open && (
              <Menu.Items
                static
                className="absolute right-0 top-0 mt-6 mr-2 z-50 bg-white border md:rounded md:shadow outline-none py-1"
              >
                <div className="flex flex-col w-40">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        className={classNames({
                          "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                          "bg-orange-200": active,
                        })}
                        onClick={() => {
                          onSelectBreakpoint();
                        }}
                      >
                        <EyeIcon className="w-4 h-4" />

                        <span>Preview</span>
                      </a>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <a
                        className={classNames({
                          "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                          "bg-orange-200": active,
                        })}
                        onClick={() => {
                          onDeleteBreakpoint();
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />

                        <span>Delete</span>
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};

const BreakpointDurationInput: React.FC<{ breakpoint: Breakpoint; isDragging: boolean }> = ({
  breakpoint,
  isDragging,
}) => {
  const [showInput, setShowInput] = useState<boolean>(!!breakpoint.duration);

  return (
    <div
      className={classNames("my-1 h-12 border-gray-500 border-r p-2 justify-end items-center", {
        hidden: isDragging,
        flex: !isDragging,
      })}
    >
      {showInput && (
        <div className="w-full flex items-center">
          <span className="w-16 text-xs mr-2">{(breakpoint.duration || 4000) / 1000} s</span>
          <WidthSlider
            color={theme.colors.orange[400]}
            max={10000}
            min={100}
            step={100}
            value={breakpoint.duration || 4000}
            onChange={(value) => app.scenes.setBreakpointDuration(breakpoint.id, value)}
            onChangeComplete={(value) => app.scenes.setBreakpointDuration(breakpoint.id, value)}
          />
          <button
            className="text-xs uppercase tracked text-gray-500 mx-2"
            onClick={() => {
              app.scenes.setBreakpointDuration(breakpoint.id, null);
              setShowInput(false);
            }}
          >
            reset
          </button>
        </div>
      )}
      <button
        onClick={() => {
          if (!showInput) {
            app.scenes.setBreakpointDuration(breakpoint.id, 4000);
            setShowInput(true);
          }
        }}
      >
        <TimerIcon className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};
