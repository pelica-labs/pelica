import { DirectionsResponse } from "@mapbox/mapbox-sdk/services/directions";
import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
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

const getListClasses = (isDragging: boolean) => {
  return classnames({
    "p-1 pb-0 rounded": true,
    "bg-gray-700": isDragging,
  });
};

const getHandleClasses = (places: Place[]) => {
  return classnames({
    "ml-1 mr-2 text-gray-500": true,
    "opacity-0": places.length === 1,
  });
};

const getItemClasses = (isDragging: boolean) => {
  return classnames({
    "flex items-center rounded mb-1": true,
    "bg-orange-800": isDragging,
  });
};

type Profile = "walking" | "driving" | "cycling" | "direct";

type ProfileConfiguration = {
  name: string;
  icon: Icon;
  profile: Profile;
};

const Profiles: ProfileConfiguration[] = [
  { name: "Walking", icon: WalkingIcon, profile: "walking" },
  { name: "Cycling", icon: BicycleIcon, profile: "cycling" },
  { name: "Driving", icon: CarIcon, profile: "driving" },
  { name: "Direct", icon: HelicopterIcon, profile: "direct" },
];

type Props = {
  value: Place[];
  onChange: (value: Place[]) => void;
  onRouteFound: (value: Coordinates[]) => void;
};

export const ItineraryInput: React.FC<Props> = ({ value, onChange, onRouteFound }) => {
  const [profile, setProfile] = useState<Profile>("walking");
  const [isComputing, setIsComputing] = useState(false);
  const [hasErrored, setHasErrored] = useState(false);

  const newInputContainer = useRef<HTMLDivElement>(null);

  const Icon = value.length ? PlusIcon : SearchIcon;

  const onAddPlace = (place: Place) => {
    const places = [...value];
    places.push(place);

    onChange(places);
  };

  const onChangePlace = (place: Place, index: number) => {
    const places = [...value];
    places[index] = place;

    onChange(places);
  };

  const onDeletePlace = (index: number) => {
    const places = [...value];
    places.splice(index, 1);

    onChange(places);
  };

  const onMovePlace = (result: DropResult | null) => {
    if (!result || !result.destination) {
      return;
    }

    const places = [...value];

    const [place] = places.splice(result.source.index, 1);
    places.splice(result.destination.index, 0, place);

    onChange(places);
  };

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
      return;
    }

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
        <div className="w-8 mr-1 flex justify-center">
          {isComputing && <BounceLoader color={theme.colors.orange[500]} size={8} />}
        </div>

        {Profiles.map((profileConfiguration) => {
          return (
            <div key={profileConfiguration.profile}>
              <Button
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

      <DragDropContext onDragEnd={onMovePlace}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              className={getListClasses(snapshot.isDraggingOver)}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {value.map((place, index) => {
                return (
                  <Draggable key={place.id} draggableId={place.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={getItemClasses(snapshot.isDragging)}
                        {...provided.draggableProps}
                      >
                        <div className={getHandleClasses(value)} {...provided.dragHandleProps} tabIndex={-1}>
                          <DragHandleIcon className="w-4 h-4" />
                        </div>

                        <div>
                          <PlaceAutocomplete
                            dense
                            clearable={false}
                            value={place}
                            onChange={(place) => {
                              if (place) {
                                onChangePlace(place, index);
                              }
                            }}
                          />
                        </div>
                        <button
                          className="focus:outline-none"
                          tabIndex={-1}
                          onClick={() => {
                            onDeletePlace(index);
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

      <div ref={newInputContainer} className="flex items-center mr-2">
        <Icon className="mx-2 text-gray-500 w-4 h-4" />
        <PlaceAutocomplete
          dense
          excludeRecentSearches={value.length ? [value[value.length - 1]] : []}
          leftIcon={null}
          value={null}
          onChange={(place) => {
            if (place) {
              onAddPlace(place);
            }
          }}
        />
      </div>

      {hasErrored && (
        <span className="mt-2 mb-1 ml-8 text-2xs text-red-500">
          Unable to compute directions. Route might be too long.
        </span>
      )}
    </div>
  );
};
