import { ActionReducerMapBuilder, CaseReducer, Draft } from '@reduxjs/toolkit';
import { TypedActionCreator } from '@reduxjs/toolkit/dist/mapBuilders';
import { NoInfer } from 'react-redux';
import { AnyAction } from 'redux-saga';
import { TPhaseAction } from '../actions/types';
import {
  IStateWithPhase,
  TStateWithPhase,
  IPhaseState,
  clearPhase,
  pendingPhase,
  rejectedPhase,
  fulfilledPhase,
} from '../state';
import { IBuilderSagaPhasesAction, IPhaseStateReducerMap } from './types';

export function builderSagaPhases<State extends IStateWithPhase>(
  builder: ActionReducerMapBuilder<NoInfer<TStateWithPhase<State>>>,
  actions: IBuilderSagaPhasesAction,
) {
  Object.keys(actions).forEach((key) => {
    phaseChannel(actions[key], builder, key);
  });
}

export function phaseChannel<
  Returned,
  ThunkArg,
  State extends IStateWithPhase,
  ActionCreator extends TypedActionCreator<string>,
>(
  thunk: TPhaseAction<ThunkArg, Returned>,
  builder: ActionReducerMapBuilder<NoInfer<TStateWithPhase<State>>>,
  propName: keyof TStateWithPhase<State>['actionsPhases'],
  reducersMap?: IPhaseStateReducerMap<State>,
): void {
  const emptyReducerProxy = (state: TStateWithPhase<State>) => state;
  const clearReducerProxy = reducersMap?.clear || emptyReducerProxy;
  const pendingReducerProxy = reducersMap?.pending || emptyReducerProxy;
  const rejectedReducerProxy = reducersMap?.rejected || emptyReducerProxy;
  const fulfilledReducerProxy = reducersMap?.fulfilled || emptyReducerProxy;

  const updateState = (state: Draft<State>, phaseState: IPhaseState) =>
    ({
      ...state,
      actionsPhases: {
        ...state.actionsPhases,
        [propName]: phaseState,
      },
    } as State);

  const clearReducer: CaseReducer<State, ReturnType<ActionCreator>> = (state, action) =>
    clearReducerProxy(
      updateState(state, {
        ...clearPhase,
        error: undefined,
      }),
      action,
    );

  const pendingReducer: CaseReducer<State, ReturnType<ActionCreator>> = (state, action) =>
    pendingReducerProxy(updateState(state, pendingPhase), action);

  const rejectReducer: CaseReducer<State, ReturnType<ActionCreator>> = (state, action) =>
    rejectedReducerProxy(
      updateState(state, {
        ...rejectedPhase,
        error: (action as AnyAction).payload,
      }),
      action,
    );

  const fulfilledReducer: CaseReducer<State, ReturnType<ActionCreator>> = (state, action) => {
    return fulfilledReducerProxy(updateState(state, fulfilledPhase), action);
  };

  builder.addCase(thunk.pending.toString(), pendingReducer);
  builder.addCase(thunk.clear.toString(), clearReducer);
  builder.addCase(thunk.rejected.toString(), rejectReducer);
  builder.addCase(thunk.fulfilled.toString(), fulfilledReducer);
}
