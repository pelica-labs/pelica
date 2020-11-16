import React from "react";
import Modal from "react-modal";

import { CloseIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { Hotkey, HotkeyView } from "~/hooks/useHotkey";

type Props = Modal.Props;

export const HotkeysModal: React.FC<Props> = (props) => {
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

      <h1 className="text-center font-semibold tracking-wide leading-none text-gray-800">Pelica hotkeys</h1>
      <div className="flex mt-10 justify-around flex-wrap gap-4">
        <div className="flex flex-col">
          <HotkeyDescription hotkey={{ value: "a", meta: true }} label="Select all" />
          <HotkeyDescription hotkey={{ value: "c", meta: true }} label="Copy selection" />
          <HotkeyDescription hotkey={{ value: "x", meta: true }} label="Cut selection" />
          <HotkeyDescription hotkey={{ value: "v", meta: true }} label="Paste selection" />
          <HotkeyDescription hotkey={{ value: "z", meta: true }} label="Undo" />
          <HotkeyDescription hotkey={{ value: "z", meta: true, shift: true }} label="Redo" />
        </div>
        <div className="flex flex-col">
          <HotkeyDescription hotkey={{ value: "p", meta: true }} label="Search for places" />
          <div className="border-t border-gray-200 w-64 mt-2 pt-2" />
          <HotkeyDescription hotkey={{ value: "m" }} label="Move" />
          <HotkeyDescription hotkey={{ value: "s" }} label="Select" />
          <HotkeyDescription hotkey={{ value: "l" }} label="Line" />
          <HotkeyDescription hotkey={{ value: "r" }} label="Route" />
          <HotkeyDescription hotkey={{ value: "p" }} label="Pin" />
          <HotkeyDescription hotkey={{ value: "t" }} label="Text" />
          <HotkeyDescription hotkey={{ value: "y" }} label="Style" />
          <div className="border-t border-gray-200 w-64 mt-2 pt-2" />
          <HotkeyDescription hotkey={{ value: "e" }} label="Export" />
          <HotkeyDescription hotkey={{ value: "a" }} label="Share" />
        </div>
      </div>
    </Modal>
  );
};

type HotkeyDescriptionProps = {
  hotkey: Hotkey;
  label: string;
};

const HotkeyDescription: React.FC<HotkeyDescriptionProps> = ({ hotkey, label }) => {
  return (
    <div className="flex items-center w-64 mt-1">
      <span className="text-sm flex-1">{label}</span>
      <HotkeyView {...hotkey} />
    </div>
  );
};
