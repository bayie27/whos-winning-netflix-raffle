import { useState } from 'react';
import type { SessionConfig, Participant, AnimationPhase, OverlayPhase } from '../types';

export function useRaffle(config: SessionConfig) {
  const [pool, setPool] = useState<Participant[]>(config.participants);
  const [lastWinner, setLastWinner] = useState<Participant | null>(null);

  const draw = () => {
    // Stubbed for TASK-014
  };

  const cancel = () => {
    // Stubbed for TASK-014
  };

  const undo = () => {
    if (!lastWinner) return;
    setPool((prev) => [...prev, lastWinner]);
    setLastWinner(null);
  };

  const canDraw = pool.length > 0;
  const canUndo = lastWinner !== null;
  const isComplete = pool.length === 0;

  return {
    participants: pool,
    focusedId: null as string | null,
    cursorPos: { x: 0, y: 0 },
    animationPhase: 'idle' as AnimationPhase,
    winnerOverlayPhase: 'hidden' as OverlayPhase,
    currentWinner: null as Participant | null,
    canDraw,
    canUndo,
    isComplete,
    draw,
    cancel,
    undo,
  };
}
export default useRaffle;
