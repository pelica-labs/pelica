import classNames from "classnames";
import Image from "next/image";
import React from "react";
import Modal from "react-modal";

import { CloseIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";

type Props = Modal.Props;

const Td: React.FC<{ className?: string; rowSpan?: number }> = ({ children, className, rowSpan }) => {
  return (
    <td className={classNames("p-3 pb-1", className)} rowSpan={rowSpan}>
      {children}
    </td>
  );
};

const Th: React.FC<{ className?: string }> = ({ children, className }) => {
  return <td className={classNames("font-bold", className)}>{children}</td>;
};

const SmallText: React.FC = ({ children }) => {
  return <span className="text-xs text-gray-400 leading-snug inline-block">{children}</span>;
};

const InteractionImage: React.FC<{ alt: string; src: string }> = ({ alt, src }) => {
  return (
    <td className="align-bottom">
      <div className="pb-6 w-full">
        <div className="h-16 w-full relative">
          <Image alt={alt} layout="fill" objectFit="contain" src={src} />
        </div>
      </div>
    </td>
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
          <tr className="h-12">
            <Th className="w-40"></Th>
            <Th className="w-64">Move the map</Th>
            <Th className="w-64">Zoom in and out</Th>
            <Th className="w-64">Tilt the map</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td className="font-bold" rowSpan={2}>
              Trackpad
            </Td>
            <Td className="align-top">2-finger pan vertically or horizontally</Td>
            <Td className="align-top">
              2-finger pinch
              <br />
              <SmallText>
                You can also hold <kbd>CTRL</kbd> and 2-finger pan vertically
              </SmallText>
            </Td>
            <Td className="align-top">
              Hold <kbd>CTRL</kbd> and drag the map
            </Td>
          </tr>
          <tr>
            <InteractionImage
              alt="A hand on a touchpad moving 2 fingers left-right"
              src="/images/interactions/touchpad-move.svg"
            />
            <InteractionImage
              alt="A hand on a touchpad stretching 2 fingers diagonally"
              src="/images/interactions/touchpad-zoom.svg"
            />
            <InteractionImage
              alt="A finger pressing ans holding a touchpad with CTRL key pressed"
              src="/images/interactions/touchpad-tilt.svg"
            />
          </tr>
          <tr>
            <Td className="font-bold" rowSpan={2}>
              Mouse
            </Td>
            <Td className="align-top">
              Scroll to move vertically <br /> or horizontally with <kbd>SHIFT</kbd>
            </Td>
            <Td className="align-top">
              Hold <kbd>CTRL</kbd> and scroll
            </Td>
            <Td className="align-top">
              Hold <kbd>CTRL</kbd> and drag the map
            </Td>
          </tr>
          <tr>
            <InteractionImage alt="TODO" src="/images/interactions/mouse-move.svg" />
            <InteractionImage alt="TODO" src="/images/interactions/mouse-zoom.svg" />
            <InteractionImage alt="TODO" src="/images/interactions/mouse-tilt.svg" />
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
              <SmallText>
                You can also use keyboard keys <kbd>+</kbd> and <kbd>-</kbd>
              </SmallText>
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
