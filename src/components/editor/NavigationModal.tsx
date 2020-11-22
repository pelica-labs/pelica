import classNames from "classnames";
import Image from "next/image";
import React from "react";
import Modal from "react-modal";

import { CloseIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";

type Props = Modal.Props;

const Td: React.FC<{ className?: string }> = ({ children, className }) => {
  return <td className={classNames("p-4", className)}>{children}</td>;
};

const Th: React.FC<{ className?: string }> = ({ children, className }) => {
  return <td className={classNames(className)}>{children}</td>;
};

const SmallText: React.FC = ({ children }) => {
  return <span className="text-xs text-gray-400 leading-snug inline-block">{children}</span>;
};

const InteractionImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <div className="p-2 w-full">
      <div className="h-16 w-full relative">
        <Image alt={alt} layout="fill" objectFit="contain" src={src} />
      </div>
    </div>
  );
};

export const NavigationModal: React.FC<Props> = ({ ...props }) => {
  return (
    <Modal {...props}>
      <IconButton
        className="absolute top-0 right-0 m-px"
        onClick={(event) => {
          props.onRequestClose?.(event);
        }}
      >
        <CloseIcon className="w-4 h-4" />
      </IconButton>
      <h1 className="text-center font-semibold tracking-wide leading-none text-gray-800 mb-10">Navigating the map</h1>
      <table className="text-center table-fixed">
        <thead>
          <tr className="bg-orange-100 border h-12">
            <Th className="w-40"></Th>
            <Th className="w-64">Move the map</Th>
            <Th className="w-64">Zoom in and out</Th>
            <Th className="w-64">Tilt the map</Th>
          </tr>
        </thead>
        <tbody>
          <tr className="border">
            <Td>Trackpad</Td>
            <Td>
              2-finger pan <br />
              up/down left/right
              <InteractionImage
                alt="A hand on a touchpad moving 2 fingers left-right"
                src="/images/interactions/touchpad-move.svg"
              />
            </Td>
            <Td>
              2-finger pinch
              <InteractionImage
                alt="A hand on a touchpad stretching 2 fingers diagonally"
                src="/images/interactions/touchpad-zoom.svg"
              />
              <SmallText>You can also press CTRL and 2-finger pan vertically</SmallText>
            </Td>
            <Td>
              Press CTRL <br />
              and drag the map
              <InteractionImage
                alt="A finger pressing ans holding a touchpad with CTRL key pressed"
                src="/images/interactions/touchpad-tilt.svg"
              />
            </Td>
          </tr>
          <tr className="border">
            <Td>Mouse</Td>
            <Td>
              Scroll to move up/down <br /> or with SHIFT to move left/right
              <InteractionImage alt="TODO" src="/images/interactions/mouse-move.svg" />
            </Td>
            <Td>
              Press CTRL and scroll
              <InteractionImage alt="TODO" src="/images/interactions/mouse-zoom.svg" />
            </Td>
            <Td>
              Hold CTRL and drag the map
              <InteractionImage alt="TODO" src="/images/interactions/mouse-tilt.svg" />
            </Td>
          </tr>
          <tr className="align-top">
            <Td></Td>
            <Td>
              <SmallText>
                If move is selected, you can also click and move the map
                <br />
                Keyboard arrows also move the map
              </SmallText>
            </Td>
            <Td>
              <SmallText>You can also use keyboard keys + and -</SmallText>
            </Td>
            <Td>
              <SmallText>You can also hold right-click / 2-finger and drag the map</SmallText>
            </Td>
          </tr>
        </tbody>
      </table>
    </Modal>
  );
};
