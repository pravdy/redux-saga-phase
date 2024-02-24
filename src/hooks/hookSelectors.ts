import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import { EPhaseState, IPhaseState, ICreateStateSagaPhases } from '../state/types';

import {
  IPhaseStateFlags,
  IPhaseStateState,
  PhaseSelectorMixin,
  ICreateHooksSelectrorsMixin,
  ICreateHooksSelectors,
} from './types';

export const getFlagsPhase = (state?: EPhaseState): IPhaseStateFlags => {
  return {
    isError: state === EPhaseState.rejected,
    isPending: state === EPhaseState.pending,
    isFulfilled: state === EPhaseState.fulfilled,
    isRejected: state === EPhaseState.rejected,
    isClear: state === EPhaseState.clear,
  };
};

export const getPhaseState = (phase: IPhaseState): IPhaseStateState => {
  const { state: phaseState, error } = phase;
  const flags = getFlagsPhase(phaseState);

  return { ...flags, error, state: phaseState };
};

export const phaseMemoizeOptions = {
  resultEqualityCheck: (a: IPhaseStateState, b: IPhaseStateState) => a.state === b.state,
};

export const createPhaseSelectors = <
  TGlobalState,
  TModuleState extends { [K in keyof Actions]: IPhaseState },
  Actions extends ICreateStateSagaPhases,
>(
  selectState: (state: TGlobalState) => TModuleState,
  actions: Actions,
) => {
  const initial: PhaseSelectorMixin<Actions, TGlobalState> = {} as PhaseSelectorMixin<Actions, TGlobalState>;

  return Object.keys(actions).reduce((phases, key) => {
    const action = key as keyof Actions;
    const selector = createSelector(
      selectState,
      (state) => {
        return getPhaseState(state[action]);
      },
      { memoizeOptions: phaseMemoizeOptions },
    );

    phases[action] = selector;

    return phases;
  }, initial);
};

export function createHooksSelectors<Selectors extends ICreateHooksSelectors>(selectors: Selectors) {
  const initial: ICreateHooksSelectrorsMixin<Selectors> = {} as ICreateHooksSelectrorsMixin<Selectors>;

  return Object.keys(selectors).reduce((hooks, key) => {
    const selector = key as keyof Selectors;
    if (selector !== 'actionPhases') {
      hooks[selector] = () => useSelector(selectors[selector]);
    }

    return hooks;
  }, initial);
}
