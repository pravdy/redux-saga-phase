import { TPhaseAction } from '../actions/types';

export enum EPhaseState {
  clear,
  pending,
  rejected,
  fulfilled,
}

export interface IPhaseState {
  state: EPhaseState;
  error?: Error;
}

export interface IStateWithPhase {
  actionsPhases: { [key: string]: IPhaseState };
}

export type TStateWithPhase<State> = State & IStateWithPhase;

export type StateSagaPhasesMixin<T> = {
  [K in keyof T]: IPhaseState;
};

export interface ICreateStateSagaPhases {
  [key: string]: TPhaseAction<any, any>;
}

export type TStatePhases<Actions extends { [key: string]: TPhaseAction<any, any> }> = {
  [K in keyof Actions]: IPhaseState;
};
