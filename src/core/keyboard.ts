import { App } from "~/core/helpers";

export type Keyboard = {
  available: boolean;

  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

const initialState: Keyboard = {
  available: true,

  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
};

export const keyboard = ({ mutate }: App) => ({
  ...initialState,

  initialize: () => {
    mutate((state) => {
      // @todo: this doesn't work for touch screens with keyboards (e.g: Surface)
      state.keyboard.available = !("ontouchstart" in document.documentElement);
    });
  },

  updateKeyboard: (event: Partial<Keyboard>) => {
    mutate(({ keyboard }) => {
      Object.assign(keyboard, event);
    });
  },
});
