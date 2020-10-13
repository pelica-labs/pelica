import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import classnames from "classnames";
import React, { useRef } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

import { CloseIcon, DragHandleIcon, PlusIcon, SearchIcon } from "~/components/Icon";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";

const getListClasses = (isDragging: boolean) => {
  return classnames({
    "p-1 pb-0 rounded": true,
    "bg-gray-700": isDragging,
  });
};

const getHandleClasses = (places: GeocodeFeature[]) => {
  return classnames({
    "ml-1 mr-2 text-gray-500": true,
    "opacity-0": places.length === 1,
  });
};

const getItemClasses = (isDragging: boolean) => {
  return classnames({
    "flex items-center rounded mb-1": true,
    "bg-green-800": isDragging,
  });
};

type Props = {
  value: GeocodeFeature[];
  onChange: (value: GeocodeFeature[]) => void;
};

export const ItineraryInput: React.FC<Props> = ({ value, onChange }) => {
  const newInputContainer = useRef<HTMLDivElement>(null);

  const Icon = value.length ? PlusIcon : SearchIcon;

  const onAddPlace = (place: GeocodeFeature) => {
    const places = [...value];
    places.push(place);

    onChange(places);
  };

  const onChangePlace = (place: GeocodeFeature, index: number) => {
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

  return (
    <div className="flex flex-col bg-gray-800 rounded shadow pb-1">
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
    </div>
  );
};
