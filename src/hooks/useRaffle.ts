import { useState, useRef, useEffect } from 'react';
import type { SessionConfig, Participant, AnimationPhase, OverlayPhase } from '../types';
import useAudio from './useAudio';

export function useRaffle(config: SessionConfig) {
  const [pool, setPool] = useState<Participant[]>(() => {
    const arr = [...config.participants];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [lastWinner, setLastWinner] = useState<Participant | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  const [winnerOverlayPhase, setWinnerOverlayPhase] = useState<OverlayPhase>('hidden');
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);

  const { playJitterStart, playWinnerLock } = useAudio();

  // Refs for animation loop and timeouts
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const poolRef = useRef<Participant[]>(pool);
  const winnerRef = useRef<Participant | null>(null);

  // Timeouts references for safe cancellations
  const nextHopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync poolRef with pool state
  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);

  // Clean up timers on unmount
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (nextHopTimeoutRef.current) clearTimeout(nextHopTimeoutRef.current);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  const moveCursorToCard = (cardId: string, speedMs: number = 100) => {
    const cardEl = document.querySelector(`[data-id="${cardId}"]`);
    if (cardEl && cursorRef.current) {
      const rect = cardEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Apply inline transition duration for custom speed
      cursorRef.current.style.transition = `transform ${speedMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const draw = () => {
    if (pool.length === 0 || animationPhase !== 'idle') return;

    // Pre-select winner randomly before animation starts
    const selectedWinner = pool[Math.floor(Math.random() * pool.length)];
    winnerRef.current = selectedWinner;
    setCurrentWinner(selectedWinner);

    // Start audio and transition to jitter phase
    playJitterStart();
    setAnimationPhase('jitter');
    setWinnerOverlayPhase('hidden');

    const startTime = performance.now();
    const jitterDuration = config.suspenseDuration * 1000;
    
    let lastHopTime = 0;
    let nextHopDelay = 100; // start fast (100ms per hop during jitter)
    
    // Deceleration hop intervals (in ms) to create a dramatic, slow-down effect.
    // To make it run slower/longer or faster, add/remove steps or adjust the ms values below.
    const decelIntervals = [140, 190, 260, 350, 470, 620, 800, 1050];
    let decelStep = 0;
    let currentPhase: 'jitter' | 'decel' = 'jitter';

    const tick = (now: number) => {
      const elapsed = now - startTime;

      if (now - lastHopTime >= nextHopDelay) {
        lastHopTime = now;

        if (currentPhase === 'jitter') {
          if (elapsed >= jitterDuration) {
            currentPhase = 'decel';
            setAnimationPhase('decel');
            nextHopDelay = decelIntervals[0];
          } else {
            // Jitter: Hop to random card in pool
            const activePool = poolRef.current;
            const randCard = activePool[Math.floor(Math.random() * activePool.length)];
            moveCursorToCard(randCard.id, 100);
            if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
            highlightTimeoutRef.current = setTimeout(() => {
              setFocusedId(randCard.id);
            }, 100);
          }
        }

        if (currentPhase === 'decel') {
          if (decelStep < decelIntervals.length) {
            // Decel hop
            const activePool = poolRef.current;
            
            if (decelStep === decelIntervals.length - 1) {
              // Final lock hop onto the pre-selected winner
              moveCursorToCard(selectedWinner.id, decelIntervals[decelStep]);
              if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
              highlightTimeoutRef.current = setTimeout(() => {
                setFocusedId(selectedWinner.id);
              }, decelIntervals[decelStep]);
              
              // Wait for final hop slide to finish, then lock and zoom
              lockTimeoutRef.current = setTimeout(() => {
                playWinnerLock();
                setAnimationPhase('zoom');
                setWinnerOverlayPhase('zoom');
                
                // Fixed 800ms pause after zoom completes, then reveal name
                revealTimeoutRef.current = setTimeout(() => {
                  setWinnerOverlayPhase('reveal');
                }, 800);
              }, decelIntervals[decelStep] + 50);
            } else {
              // Intermediate decel hops (random cards)
              const randCard = activePool[Math.floor(Math.random() * activePool.length)];
              moveCursorToCard(randCard.id, decelIntervals[decelStep]);
              const currentDelay = decelIntervals[decelStep];
              if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
              highlightTimeoutRef.current = setTimeout(() => {
                setFocusedId(randCard.id);
              }, currentDelay);
            }
            
            nextHopDelay = decelIntervals[decelStep];
            decelStep++;
          }
        }
      }

      // Continue requestAnimationFrame loop if not locked/zoomed
      if (currentPhase === 'jitter' || (currentPhase === 'decel' && decelStep <= decelIntervals.length)) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    // Only allow cancellation during jitter/decel phases
    if (animationPhase !== 'jitter' && animationPhase !== 'decel') return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Clear all timeouts
    if (nextHopTimeoutRef.current) clearTimeout(nextHopTimeoutRef.current);
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);

    // Reset state without removing anyone
    setFocusedId(null);
    setAnimationPhase('idle');
    setWinnerOverlayPhase('hidden');
    setCurrentWinner(null);
    winnerRef.current = null;
  };

  const undo = () => {
    if (animationPhase !== 'idle' || !lastWinner) return;
    setPool((prev) => [...prev, lastWinner]);
    setLastWinner(null);
  };

  const dismissWinner = () => {
    if (winnerOverlayPhase !== 'reveal' && winnerOverlayPhase !== 'zoom') return;
    if (!currentWinner) return;

    let isEmpty = false;
    setPool((prev) => {
      const updated = prev.filter((p) => p.id !== currentWinner.id);
      isEmpty = updated.length === 0;
      return updated;
    });
    setLastWinner(currentWinner);
    setFocusedId(null);
    setWinnerOverlayPhase('hidden');
    setCurrentWinner(null);
    winnerRef.current = null;
    setAnimationPhase(isEmpty ? 'done' : 'idle');
  };

  const canDraw = pool.length > 0 && animationPhase === 'idle';
  const canUndo = lastWinner !== null && animationPhase === 'idle';
  const isComplete = pool.length === 0 && (animationPhase === 'idle' || animationPhase === 'done');

  return {
    participants: pool,
    focusedId,
    cursorRef,
    animationPhase,
    winnerOverlayPhase,
    currentWinner,
    canDraw,
    canUndo,
    isComplete,
    draw,
    cancel,
    undo,
    dismissWinner,
  };
}
export default useRaffle;
