import { AnyAction } from 'redux-saga';
import { TPhaseAction } from '../actions/types';
import { TStateWithPhase } from '../state/types';

export interface IPhaseStateReducerMap<State> {
  clear?: (state: TStateWithPhase<State>, action: AnyAction) => State;
  pending?: (state: TStateWithPhase<State>, action: AnyAction) => State;
  rejected?: (state: TStateWithPhase<State>, action: AnyAction) => State;
  fulfilled?: (state: TStateWithPhase<State>, action: AnyAction) => State;
}

export interface IBuilderSagaPhasesAction {
  [action: string]: TPhaseAction<any, any>;
}
