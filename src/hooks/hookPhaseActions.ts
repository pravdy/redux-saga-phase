import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TPhaseAction } from '../actions/types';
import { ICreateHooksActions, PhaseSelectorMixin, ICreateHooksActionsMixin } from './types';

export const createHookDispachActionPending =
  <TPayload>(action: TPhaseAction<TPayload, undefined, Error>) =>
  () => {
    const dispatch = useDispatch();

    return useCallback((payload: TPayload) => dispatch(action.pending(payload)), [dispatch]);
  };

export const createHookDispachActionFulfilled =
  <TPayload>(action: TPhaseAction<TPayload, undefined, Error>) =>
  () => {
    const dispatch = useDispatch();

    return useCallback(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      (payload: TPayload) => dispatch(action.fulfilled(payload)),
      [dispatch],
    );
  };

export const createHookDispachActionRejected =
  <TPayload>(action: TPhaseAction<TPayload, undefined, Error>) =>
  () => {
    const dispatch = useDispatch();

    return useCallback(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      (payload: TPayload) => dispatch(action.rejected(payload)),
      [dispatch],
    );
  };

export const createHookDispachActionClear =
  <TPayload>(action: TPhaseAction<TPayload, undefined, Error>) =>
  () => {
    const dispatch = useDispatch();

    return useCallback(() => dispatch(action.clear()), [dispatch]);
  };

export function createHooksActions<Actions extends ICreateHooksActions>(
  actions: Actions,
  selectorsPhases: PhaseSelectorMixin<Actions, any>,
) {
  const initial: ICreateHooksActionsMixin<Actions> = {} as ICreateHooksActionsMixin<Actions>;

  return Object.keys(actions).reduce((hooks, key) => {
    const action = key as keyof Actions;
    const selector = key as keyof PhaseSelectorMixin<Actions, any>;

    const hook = () => {
      const hookAction = createHookDispachActionPending<Parameters<Actions[keyof Actions]>[0]>(actions[action]);
      const dispatch = hookAction();

      return dispatch;
    };
    hook.status = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const phases: IPhaseStateFlags & { error: unknown } = useSelector(selectorsPhases[selector]);

      return phases;
    };

    hook.clear = () => {
      const hookAction = createHookDispachActionClear(actions[action]);
      const dispatch = hookAction();

      return dispatch;
    };

    hook.fulfilled = () => {
      const hookAction = createHookDispachActionFulfilled(actions[action]);
      const dispatch = hookAction();

      return dispatch;
    };

    hook.rejected = () => {
      const hookAction = createHookDispachActionRejected(actions[action]);
      const dispatch = hookAction();

      return dispatch;
    };

    hooks[action] = hook;

    return hooks;
  }, initial);
}
