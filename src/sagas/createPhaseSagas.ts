import { all, put, takeEvery, takeLatest, takeLeading } from 'redux-saga/effects';
import { TPhaseAction } from '../actions/types';
import { ECreateSagaEfects, ForkEffect, TCreateSagaActionConfig, TCreateSagaEfectsHandle } from './types';

export function createPhaseSagas<Actions extends { [key: string]: TPhaseAction<any, any, any> }>(
  actions: Actions,
  config: {
    [Action in keyof Actions]?:
      | {
          saga?: TCreateSagaActionConfig<Actions[Action]['pending']>['saga'];
          effect?: TCreateSagaEfectsHandle | `${ECreateSagaEfects}`;
          controlled?: TCreateSagaActionConfig<Actions[Action]['pending']>['controlled'];
          pending?: TCreateSagaActionConfig<Actions[Action]['pending']>;
          clear?: TCreateSagaActionConfig<Actions[Action]['clear']>;
          fulfilled?: TCreateSagaActionConfig<Actions[Action]['fulfilled']>;
          rejected?: TCreateSagaActionConfig<Actions[Action]['rejected']>;
        }
      | TCreateSagaActionConfig<Actions[Action]['pending']>['saga'];
  },
  effects?: ForkEffect<never>[],
) {
  const actionsEffects: ForkEffect<never>[] = [];
  for (const action in config) {
    const configAction = config[action];
    const isFunc = typeof configAction === 'function';
    const getCommunicate = () => {
      if (isFunc) {
        return {
          pending: {
            saga: configAction,
            effect: ECreateSagaEfects.leading,
            controlled: false,
          },
        };
      } else {
        return {
          pending:
            configAction?.saga && configAction?.effect
              ? {
                  saga: configAction.saga,
                  effect: configAction.effect,
                  controlled: configAction?.controlled,
                }
              : configAction?.pending,
          fulfilled: configAction?.fulfilled,
          rejected: configAction?.rejected,
          clear: configAction?.clear,
        };
      }
    };
    if (configAction) {
      const comms = getCommunicate();

      Object.keys(comms).forEach((communicationString) => {
        const communication = communicationString as keyof typeof comms;

        const configPhase = comms[communication];
        if (configPhase?.effect && configPhase?.saga) {
          const actionPhase = actions[action][communication];

          const pattern = actionPhase.toString();
          const actionSaga = function* (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            payload: Parameters<typeof configPhase.saga>[number],
          ) {
            try {
              if (configPhase?.saga) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                yield call(configPhase.saga, payload);
              }
              if (!configPhase.controlled) {
                yield put(actions[action].fulfilled(payload));
              }
            } catch (error) {
              if (!configPhase.controlled) {
                console.debug(action, error);

                yield put(actions[action].rejected(error));
              }
            }
          };

          if (typeof configPhase.effect === 'function') {
            actionsEffects.push((configPhase.effect as TCreateSagaEfectsHandle)(pattern, actionSaga));
          } else {
            if (configPhase.effect === ECreateSagaEfects.every) {
              actionsEffects.push(takeEvery(pattern, actionSaga));
            }
            if (configPhase.effect === ECreateSagaEfects.latest) {
              actionsEffects.push(takeLatest(pattern, actionSaga));
            }
            if (configPhase.effect === ECreateSagaEfects.leading) {
              actionsEffects.push(takeLeading(pattern, actionSaga));
            }
          }
        }
      });
    }
  }

  return function* () {
    yield all([...actionsEffects, ...(effects || [])]);
  };
}
