import { IPhaseState, EPhaseState } from './types';

export const initialPhase: IPhaseState = { state: EPhaseState.clear };
export const clearPhase: IPhaseState = { state: EPhaseState.clear };
export const pendingPhase: IPhaseState = { state: EPhaseState.pending };
export const rejectedPhase: IPhaseState = { state: EPhaseState.rejected };
export const fulfilledPhase: IPhaseState = { state: EPhaseState.fulfilled };
