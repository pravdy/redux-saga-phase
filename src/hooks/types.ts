import { IPhaseState, EPhaseState } from '../state/types';
import { TPhaseAction } from '../actions/types';
import { Selector } from 'reselect';
import { initialPhase } from '../state/phaseStates';

export interface IPhaseStateFlags {
  isError: boolean;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
  isClear: boolean;
}
export interface IPhaseStateState extends IPhaseStateFlags {
  error?: Error;
  state: EPhaseState;
}
export type PhaseSelectorMixin<Actions, State> = {
  [K in keyof Actions]: (state: State) => IPhaseState;
};

export interface ICreateHooksActionsResult<Payload> {
  (): (payload: Payload) => void;
  status: () => IPhaseStateFlags & { error: unknown };
  clear: () => () => void;
}
export type ICreateHooksActionsMixin<Actions extends ICreateHooksActions> = {
  [name in keyof Actions]: ICreateHooksActionsResult<Parameters<Actions[name]>[0]>;
};

export interface ICreateHooksActions {
  [key: string]: TPhaseAction<any, any>;
}

export type ICreateHooksSelectrorsMixin<Selectors extends ICreateHooksSelectors> = {
  [name in keyof Selectors]: () => ReturnType<Selectors[name]>;
};

export interface ICreateHooksSelectors {
  [key: string]: Selector<any, any>;
}

export interface IClearAllStatePhases {
  [key: string]: IPhaseState;
}
export const clearAllStatePhases = (statePhases: IClearAllStatePhases) => {
  for (const communication in statePhases) {
    statePhases[communication] = initialPhase;
  }
};
