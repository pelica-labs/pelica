import { last } from "lodash";

import { Action, Handler, handlers } from "~/core/actions";
import { App } from "~/core/helpers";

export type History = {
  actions: Action[];
  redoStack: Action[];
};

const initialState: History = {
  actions: [],
  redoStack: [],
};

export const history = ({ mutate }: App) => ({
  ...initialState,

  push: (action: Action) => {
    mutate((state) => {
      state.history.actions.push(action);

      try {
        const handler = handlers[action.name] as Handler<Action>;

        handler.apply(state, action);
      } catch (error) {
        console.error("Error when applying action", error);
        throw error;
      }

      state.history.redoStack = [];
    });
  },

  undo: () => {
    mutate((state) => {
      const { history } = state;
      const lastAction = history.actions.pop();
      if (!lastAction) {
        return;
      }

      const handler = handlers[lastAction.name] as Handler<Action>;

      try {
        handler.undo(state, lastAction as Required<typeof lastAction>);
      } catch (error) {
        console.error("Error when undoing action", error);
        throw error;
      }

      history.redoStack.push(lastAction);
    });
  },

  redo: () => {
    mutate((state) => {
      const lastUndoneAction = last(state.history.redoStack);
      if (!lastUndoneAction) {
        return;
      }

      state.history.redoStack.splice(state.history.redoStack.length - 1);

      state.history.actions.push(lastUndoneAction);

      try {
        const handler = handlers[lastUndoneAction.name] as Handler<Action>;

        handler.apply(state, lastUndoneAction);
      } catch (error) {
        console.error("Error when redoing action", error);
        throw error;
      }
    });
  },
});
