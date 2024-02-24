import { PayloadActionCreator } from '@reduxjs/toolkit/dist/createAction';
import { PayloadAction } from '@reduxjs/toolkit/dist/createAction';

export type ActionPalyoad<T extends (...args: any) => any> = PayloadAction<Parameters<T>[0]>;

export type TPhaseAction<Payload, Result, Err extends Error = Error> = {
  clear: PayloadActionCreator<void>;
  pending: PayloadActionCreator<Payload>;
  fulfilled: PayloadActionCreator<Result>;
  rejected: PayloadActionCreator<Err>;
} & PayloadActionCreator<Payload>;

export type TCreatePhaseActionsConfigAction<TPayload> = (type: string) => TPhaseAction<TPayload, void, Error>;

export interface ICreatePhaseActionsConfig {
  [key: string]: TCreatePhaseActionsConfigAction<any>;
}
