import { App } from "~/core/helpers";

export type Keyboard = {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

const initialState: Keyboard = {
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
};

export const keyboard = ({ mutate }: App) => ({
  ...initialState,

  updateKeyboard: (event: Keyboard) => {
    mutate(({ keyboard }) => {
      Object.assign(keyboard, event);
    });
  },
});
