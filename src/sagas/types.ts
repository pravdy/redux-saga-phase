import { ActionCreatorWithPayload, ActionCreatorWithoutPayload, PayloadActionCreator } from '@reduxjs/toolkit';
import { ForkEffect } from 'redux-saga/effects';

export { ForkEffect };

export enum ECreateSagaEfects {
  latest = 'latest',
  leading = 'leading',
  every = 'every',
}

export type TCreateSagaEfectsHandle = (
  action: string,
  saga: (action: any) => Generator<unknown, any, unknown>,
) => ForkEffect<never>;

export type TCreateSagaActionConfigPayload =
  | ActionCreatorWithPayload<any, any>
  | ActionCreatorWithoutPayload<any>
  | PayloadActionCreator<any>;

export type TCreateSagaActionConfig<Action extends TCreateSagaActionConfigPayload> = {
  effect: TCreateSagaEfectsHandle | `${ECreateSagaEfects}`;
  controlled: boolean;
  saga: (action: ReturnType<Action>) => Generator<any, any, any>;
};
