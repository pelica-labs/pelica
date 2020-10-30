import { DirectionsResponse } from "@mapbox/mapbox-sdk/services/directions";
import polyline from "@mapbox/polyline";
import { greatCircle, point, Position } from "@turf/turf";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import BounceLoader from "react-spinners/BounceLoader";

import {
  BicycleIcon,
  CarIcon,
  CloseIcon,
  DragHandleIcon,
  HelicopterIcon,
  Icon,
  PlusIcon,
  SearchIcon,
  WalkingIcon,
} from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { mapboxDirections } from "~/lib/mapbox";
import { theme } from "~/styles/tailwind";

type ProfileConfiguration = {
  name: string;
  icon: Icon;
  profile: ItineraryProfile;
};

const Profiles: ProfileConfiguration[] = [
  { name: "Driving", icon: CarIcon, profile: "driving" },
  { name: "Cycling", icon: BicycleIcon, profile: "cycling" },
  { name: "Walking", icon: WalkingIcon, profile: "walking" },
  { name: "Direct", icon: HelicopterIcon, profile: "direct" },
];

type Props = {
  value: Place[];
  profile: ItineraryProfile;

  onStepAdded: (value: Place) => void;
  onStepUpdated: (index: number, place: Place | null) => void;
  onStepMoved: (from: number, to: number) => void;
  onStepDeleted: (index: number) => void;
  onProfileUpdated: (profile: ItineraryProfile) => void;

  onLoadingRoute: () => void;
  onRouteFound: (value: Position[]) => void;

  canClose: boolean;
  onClose: () => void;

  bias?: Position;
};

export const ItineraryInput: React.FC<Props> = ({
  value,
  profile,
  onStepAdded,
  onStepUpdated,
  onStepMoved,
  onStepDeleted,
  onProfileUpdated,
  onLoadingRoute,
  onRouteFound,
  canClose,
  onClose,
  bias,
}) => {
  const [isComputing, setIsComputing] = useState(false);
  const [hasErrored, setHasErrored] = useState(false);

  const newInputContainer = useRef<HTMLDivElement>(null);

  const Icon = value.length ? PlusIcon : SearchIcon;

  const computeItinerary = async () => {
    if (profile === "direct") {
      return value.flatMap((place, i): Position[] => {
        if (value[i + 1]) {
          // great-circle is the shortest path between two points, which projects in mercator to a curve
          const lineString = greatCircle(point(place.center), point(value[i + 1].center));
          return lineString.geometry?.coordinates || [];
        } else {
          return [];
        }
      });
    }

    const res = await mapboxDirections
      .getDirections({
        profile: profile,
        overview: "simplified",
        steps: true,
        waypoints: value.map((place) => {
          return {
            coordinates: place.center,
          };
        }),
      })
      .send();

    const directions = res.body as DirectionsResponse;

    if (!directions.routes.length) {
      setHasErrored(true);
      return [];
    }

    // It's a polyline mistyped as LineString
    return polyline.decode((directions.routes[0].geometry as unknown) as string).map((coords) => {
      return [coords[1], coords[0]];
    });
  };

  useEffect(() => {
    if (value.length <= 1) {
      onRouteFound([]);
      return;
    }

    onLoadingRoute();
    setIsComputing(true);
    setHasErrored(false);

    computeItinerary()
      .then((points) => {
        onRouteFound(points);
      })
      .catch((error) => {
        setHasErrored(true);
        console.warn(error);
      })
      .finally(() => {
        setIsComputing(false);
      });

    // @todo: effect cleanup
  }, [value, profile]);

  return (
    <div className="flex flex-col bg-white rounded shadow p-2">
      <div className="flex items-center">
        <div className="w-8 flex mr-px justify-center">
          {isComputing && <BounceLoader color={theme.colors.orange[500]} size={8} />}
        </div>

        <div className="flex items-center bg-white gap-1">
          {Profiles.map((profileConfiguration) => {
            return (
              <div key={profileConfiguration.profile}>
                <IconButton
                  active={profile === profileConfiguration.profile}
                  className="text-gray-800"
                  onClick={() => {
                    onProfileUpdated(profileConfiguration.profile);
                  }}
                >
                  <profileConfiguration.icon className="w-6 h-6" />
                </IconButton>
              </div>
            );
          })}
        </div>

        {canClose && (
          <div className="ml-auto mr-2">
            <button
              className="focus:outline-none h-4 mt-1 text-gray-500"
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result || !result.destination) {
            return;
          }

          onStepMoved(result.source.index, result.destination.index);
        }}
      >
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              className={classNames({
                "p-1 pb-0 rounded overflow-y-auto": true,
                "bg-gray-200": snapshot.isDraggingOver,
              })}
              style={{
                maxHeight: 350,
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {value.map((place, index) => {
                return (
                  <Draggable key={place.id} draggableId={place.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={classNames({
                          "relative group flex items-center rounded mb-1": true,
                          "bg-orange-100": snapshot.isDragging,
                        })}
                        {...provided.draggableProps}
                      >
                        <div
                          className={classNames({
                            "ml-1 mr-2 text-gray-600": true,
                            "opacity-0": value.length === 1,
                          })}
                          {...provided.dragHandleProps}
                          tabIndex={-1}
                        >
                          <DragHandleIcon className="w-4 h-4" />
                        </div>

                        <div>
                          <PlaceAutocomplete
                            dense
                            bias={bias}
                            clearable={false}
                            value={place}
                            onChange={(place) => {
                              onStepUpdated(index, place);
                            }}
                          />
                        </div>

                        <button
                          className="absolute right-0 mr-2 focus:outline-none md:hidden group-hover:block rounded-full md:border border-gray-600 bg-white hover:bg-orange-100 py-1"
                          tabIndex={-1}
                          onClick={() => {
                            onStepDeleted(index);
                          }}
                        >
                          <CloseIcon className="mx-1 w-3 h-3 text-gray-600" />
                        </button>
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

      <div ref={newInputContainer} className="flex items-center mr-1">
        <Icon className="mx-2 text-gray-600 w-4 h-4" />
        <PlaceAutocomplete
          dense
          bias={bias}
          excludeRecentSearches={value.length ? [value[value.length - 1]] : []}
          leftIcon={null}
          value={null}
          onChange={(place) => {
            if (!place) {
              return;
            }

            onStepAdded(place);
          }}
        />
      </div>

      {hasErrored && (
        <span className="mt-2 mb-1 ml-8 pl-1 text-2xs text-red-500">
          Unable to compute directions.
          <br />
          Route might be too long.
        </span>
      )}
    </div>
  );
};
