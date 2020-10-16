import { DirectionsResponse } from "@mapbox/mapbox-sdk/services/directions";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import BounceLoader from "react-spinners/BounceLoader";

import { Button } from "~/components/Button";
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
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { Coordinates } from "~/core/geometries";
import { Place } from "~/core/itineraries";
import { mapboxDirections } from "~/lib/mapbox";
import { theme } from "~/styles/tailwind";

type Profile = "walking" | "driving" | "cycling" | "direct";

type ProfileConfiguration = {
  name: string;
  icon: Icon;
  profile: Profile;
};

const Profiles: ProfileConfiguration[] = [
  { name: "Driving", icon: CarIcon, profile: "driving" },
  { name: "Cycling", icon: BicycleIcon, profile: "cycling" },
  { name: "Walking", icon: WalkingIcon, profile: "walking" },
  { name: "Direct", icon: HelicopterIcon, profile: "direct" },
];

type Props = {
  value: Place[];

  onStepAdded: (value: Place) => void;
  onStepUpdated: (index: number, place: Place | null) => void;
  onStepMoved: (from: number, to: number) => void;
  onStepDeleted: (index: number) => void;

  onLoadingRoute: () => void;
  onRouteFound: (value: Coordinates[]) => void;

  bias?: Coordinates;
};

export const ItineraryInput: React.FC<Props> = ({
  value,
  onStepAdded,
  onStepUpdated,
  onStepMoved,
  onStepDeleted,
  onLoadingRoute,
  onRouteFound,
  bias,
}) => {
  const [profile, setProfile] = useState<Profile>("driving");
  const [isComputing, setIsComputing] = useState(false);
  const [hasErrored, setHasErrored] = useState(false);

  const newInputContainer = useRef<HTMLDivElement>(null);

  const Icon = value.length ? PlusIcon : SearchIcon;

  const computeItinerary = async () => {
    if (profile === "direct") {
      return value.map((place) => {
        return {
          latitude: place.center[1],
          longitude: place.center[0],
        };
      });
    }

    const res = await mapboxDirections
      .getDirections({
        profile: profile,
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

    return directions.routes[0].legs.flatMap((leg) => {
      return leg.steps.map((step) => {
        const location = step.intersections[0].location;
        return {
          latitude: location[1],
          longitude: location[0],
        };
      });
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
  }, [value, profile]);

  return (
    <div className="flex flex-col bg-gray-800 rounded shadow pb-1 pt-1">
      <div className="flex items-center">
        <div className="w-8 flex mr-px justify-center">
          {isComputing && <BounceLoader color={theme.colors.orange[500]} size={8} />}
        </div>

        <div className="flex items-center bg-gray-900 rounded">
          {Profiles.map((profileConfiguration) => {
            return (
              <div key={profileConfiguration.profile}>
                <Button
                  outlined
                  active={profile === profileConfiguration.profile}
                  className="text-gray-200"
                  shadow={false}
                  onClick={() => {
                    setProfile(profileConfiguration.profile);
                  }}
                >
                  <profileConfiguration.icon className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
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
                "p-1 pb-0 rounded": true,
                "bg-gray-700": snapshot.isDraggingOver,
              })}
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
                          "bg-orange-800": snapshot.isDragging,
                        })}
                        {...provided.draggableProps}
                      >
                        <div
                          className={classNames({
                            "ml-1 mr-2 text-gray-500": true,
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
                          className="absolute right-0 mr-2 focus:outline-none hidden group-hover:block rounded-full border border-gray-700 bg-gray-900 hover:bg-orange-900 py-1"
                          tabIndex={-1}
                          onClick={() => {
                            onStepDeleted(index);
                          }}
                        >
                          <CloseIcon className="mx-1 w-3 h-3 text-gray-500" />
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
        <Icon className="mx-2 text-gray-500 w-4 h-4" />
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
