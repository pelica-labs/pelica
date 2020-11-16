import React from "react";
import Modal from "react-modal";

import { CloseIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";

type Props = Modal.Props;

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
      todo Sarah
    </Modal>
  );
};
