import produce from "immer";
import { GetState, State as ZustandState, StateCreator } from "zustand";

import { State } from "~/core/app";

export type App = {
  mutate: Mutate;
  get: Get;
};

export type Mutate = (fn: (draft: State) => void) => void;

export type Get = GetState<State>;

export const immer = <T extends ZustandState>(
  config: StateCreator<T, (fn: (draft: T) => void) => void>
): StateCreator<T> => (set, get, api) => config((fn) => set(produce(fn) as (state: T) => T), get, api);
