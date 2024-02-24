import { TPhaseAction, ICreatePhaseActionsConfig } from './types';
import { ICreateStateSagaPhases, StateSagaPhasesMixin } from '../state/types';

import { initialPhase } from '../state/phaseStates';
import { createAction } from '@reduxjs/toolkit';

export function createStateSagaPhases<Actions extends ICreateStateSagaPhases>(actions: Actions) {
  const initial: StateSagaPhasesMixin<Actions> = {} as StateSagaPhasesMixin<Actions>;

  return Object.keys(actions).reduce((phases, key) => {
    const action = key as keyof Actions;
    phases[action] = initialPhase;

    return phases;
  }, initial);
}

export function createPhaseAction<PayloadType = void, ResultType = void, ErrorType = Error | void>(
  typePrefix: string,
): TPhaseAction<PayloadType, ResultType> {
  const clear = createAction<void>(`${typePrefix}/clear`);
  const pending = createAction<PayloadType>(`${typePrefix}/pending`);
  const fulfilled = createAction<ResultType>(`${typePrefix}/fulfilled`);
  const rejected = createAction<ErrorType>(`${typePrefix}/rejected`);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return Object.assign(pending, {
    clear,
    pending,
    fulfilled,
    rejected,
  }) as typeof pending & {
    clear: typeof clear;
    pending: typeof pending;
    fulfilled: typeof fulfilled;
    rejected: typeof rejected;
  };
}

export const phaseAction =
  <TPayload = void, TResult = void, TError = void | Error>() =>
  (type: string) =>
    createPhaseAction<TPayload, TResult, TError>(type);

export function createPhaseActions<TActions extends ICreatePhaseActionsConfig>(
  prefix: string,
  actionsConfig: TActions,
) {
  const actions = {} as {
    [Action in keyof TActions]: ReturnType<TActions[Action]>;
  };

  for (const key in actionsConfig) {
    const action = actionsConfig[key];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    actions[key] = action(`${prefix}/${key}`);
  }

  return actions;
}
