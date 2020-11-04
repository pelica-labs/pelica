import { Action, Handler, handlers } from "~/core/actions";
import { App } from "~/core/helpers";

export type History = {
  actions: Action[];
  redoStack: Action[];
};

export const historyInitialState: History = {
  actions: [],
  redoStack: [],
};

export const history = ({ mutate }: App) => ({
  ...historyInitialState,

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
      const lastAction = state.history.actions.pop();
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

      state.history.redoStack.push(lastAction);
    });
  },

  redo: () => {
    mutate((state) => {
      const lastUndoneAction = state.history.redoStack.pop();
      if (!lastUndoneAction) {
        return;
      }

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

  clear: () => {
    mutate((state) => {
      state.history.actions = [];
      state.history.redoStack = [];
      state.entities.items = [];
      state.entities.transientItems = [];
      state.selection.clear();
    });
  },
});
