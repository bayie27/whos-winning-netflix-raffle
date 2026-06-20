export interface Participant {
  id: string;
  name: string;
  avatarUrl: string;
  avatarColor: string;
}

export interface SessionConfig {
  participants: Participant[];
  suspenseDuration: number; // in seconds, typically 3-10
}

export type AnimationPhase = 'idle' | 'jitter' | 'decel' | 'zoom' | 'reveal' | 'done';

export type OverlayPhase = 'hidden' | 'zoom' | 'reveal';

export interface RaffleState {
  pool: Participant[];
  removed: Participant[];
  lastWinner: Participant | null;
  animationPhase: AnimationPhase;
  focusedId: string | null;
  cursorPos: { x: number; y: number };
  currentWinner: Participant | null;
}
