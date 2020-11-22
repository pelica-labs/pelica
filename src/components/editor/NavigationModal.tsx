import React from "react";
import Modal from "react-modal";

import { CloseIcon, HandIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { HotkeyView } from "~/hooks/useHotkey";

type Props = Modal.Props;

export const NavigationModal: React.FC<Props> = ({ ...props }) => {
  return (
    <Modal {...props} style={{ content: { padding: 0 } }}>
      <IconButton
        className="absolute top-0 right-0 m-px"
        onClick={(event) => {
          props.onRequestClose?.(event);
        }}
      >
        <CloseIcon className="w-4 h-4" />
      </IconButton>
      <h1 className="text-center font-semibold tracking-wide leading-none text-gray-800 mb-10 mt-4">
        Navigating the map
      </h1>

      <div className="flex flex-col">
        <div className="flex justify-between text-sm md:text-base whitespace-nowrap font-base md:font-medium gap-4 py-4 bg-orange-100 border-t border-b border-orange-200 px-4">
          <div className="hidden md:block w-32"></div>
          <div className="flex-1">Move the map</div>
          <div className="flex-1">Zoom in and out</div>
          <div className="flex-1">Tilt the map</div>
        </div>

        <div className="flex justify-between gap-4 py-6 px-4">
          <div className="hidden md:block w-32 font-light text-right pr-10">Trackpad</div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">Pan with 2 fingers</span>
            <img
              alt="A hand on a touchpad moving 2 fingers left-right"
              className="mt-auto"
              src="/images/interactions/touchpad-move.svg"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">Pinch with 2 fingers</span>
            <span className="hidden md:block text-xs text-gray-400 leading-snug">
              or hold <HotkeyView value="CTRL" /> and scroll vertically
            </span>
            <img
              alt="A hand on a touchpad stretching 2 fingers diagonally"
              className="mt-4"
              src="/images/interactions/touchpad-zoom.svg"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">
              <span className="hidden md:block">
                Hold <HotkeyView value="CTRL" /> and drag the map
              </span>
              <span className="block md:hidden">Pan with 3 fingers</span>
            </span>

            <img
              alt="A finger pressing and holding a touchpad with CTRL key pressed"
              className="hidden md:block mt-auto"
              src="/images/interactions/touchpad-tilt.svg"
            />
            <img
              alt="A hand on a touchpad moving 3 fingers top-bottom"
              className="block md:hidden mt-auto"
              // Todo: 3 fingers image
              src="/images/interactions/touchpad-move.svg"
            />
          </div>
        </div>

        <div className="hidden md:flex justify-between gap-4 border-t border-gray-200 py-6 px-4">
          <div className="w-32 font-light text-right pr-10">Mouse</div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">
              Scroll to move vertically or horizontally with <HotkeyView value="SHIFT" />
            </span>

            <img
              alt="A finger scrolling a mouse while SHIFT key is pressed"
              className="mt-4"
              src="/images/interactions/mouse-move.svg"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">
              Hold <HotkeyView value="CTRL" /> and scroll
            </span>

            <img
              alt="A finger scrolling a mouse while CTRL key is pressed"
              className="mt-auto"
              src="/images/interactions/mouse-zoom.svg"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-medium">
              Hold <HotkeyView value="CTRL" /> and drag the map
            </span>

            <img
              alt="A finger pressing and holding the mouse left button while CTRL key is pressed"
              className="mt-auto"
              src="/images/interactions/mouse-tilt.svg"
            />
          </div>
        </div>

        <div className="hidden md:flex justify-between gap-4 border-t border-gray-200 py-6 px-4 text-xs text-gray-400 leading-snug">
          <div className="w-32"></div>
          <div className="flex-1 flex flex-col">
            <span>
              In move mode (<HandIcon className="w-4 h-4 inline" />
              ), you can also click and drag the map
            </span>
          </div>
          <div className="flex-1">
            You can also use keyboard key <HotkeyView value="+" /> and <HotkeyView value="-" />
          </div>
          <div className="flex-1">You can also hold right-click and drag the map</div>
        </div>
      </div>
    </Modal>
  );
};
