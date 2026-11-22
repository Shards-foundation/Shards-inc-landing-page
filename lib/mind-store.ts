import { create } from 'zustand';

export type MindStage = 'HERO' | 'THESIS' | 'KERNEL' | 'PLAYGROUND' | 'SYSTEMS' | 'VIDEO' | 'CONTACT';
export type KernelState = 'IDLE' | 'VALIDATING' | 'ARBITRATING' | 'AUDITING' | 'EXECUTING' | 'COMPLETED' | 'HALTED';
interface MindStore {
  stage: MindStage;
  progress: number;
  simulated: KernelState | null;
  setStage(stage: MindStage, progress: number): void;
  setSimulated(next: KernelState | null): void;
}
export const useMindStore = create<MindStore>((set) => ({
  stage: 'HERO', progress: 0, simulated: null,
  setStage: (stage, progress) => set({ stage, progress: Math.min(1, Math.max(0, progress)) }),
  setSimulated: (simulated) => set({simulated}),
}));
export const STATES: KernelState[] = [
  'IDLE', 'VALIDATING', 'ARBITRATING', 'AUDITING', 'EXECUTING', 'AUDITING', 'COMPLETED',
];
export function stageToState(stage: MindStage, progress: number): KernelState {
  if (stage === 'THESIS') return 'VALIDATING';
  if (stage === 'KERNEL') return STATES[Math.min(STATES.length - 1, Math.floor(progress * STATES.length))];
  return 'IDLE';
}
