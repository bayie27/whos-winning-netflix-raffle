import { useEffect, useState, useRef } from 'react';
import type { Participant, SessionConfig } from '../types';
import ProfileGrid from './ProfileGrid';
import OperatorControls from './OperatorControls';
import styles from './RaffleScreen.module.css';

export interface RaffleScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

export default function RaffleScreen({ config, onBack }: RaffleScreenProps) {
  const [pool, setPool] = useState<Participant[]>(config.participants);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [lastWinner, setLastWinner] = useState<Participant | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // References to keep track of asynchronous timeouts/intervals for safe cleanup
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unload guard to prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up any running timers on unmount
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  const handleDraw = () => {
    if (isAnimating || pool.length === 0) return;

    setIsAnimating(true);
    setRemovingId(null);
    setLastWinner(null);

    let hopCount = 0;
    const maxHops = 10;
    
    // Simulate cursor jitter across cards
    const runJitter = () => {
      if (hopCount < maxHops) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setFocusedId(pool[randomIndex].id);
        hopCount++;
        animationTimerRef.current = setTimeout(runJitter, 100);
      } else {
        // Lock onto a final winner
        const winnerIndex = Math.floor(Math.random() * pool.length);
        const winner = pool[winnerIndex];
        setFocusedId(winner.id);
        
        // Transition to removal after lock delay
        animationTimerRef.current = setTimeout(() => {
          setRemovingId(winner.id);
          
          removeTimerRef.current = setTimeout(() => {
            // Remove winner from pool
            setPool((prev) => prev.filter((p) => p.id !== winner.id));
            setLastWinner(winner);
            setFocusedId(null);
            setRemovingId(null);
            setIsAnimating(false);
          }, 300); // 300ms fade-out transition
        }, 800); // Wait 800ms locked before starting removal fade
      }
    };

    runJitter();
  };

  const handleCancel = () => {
    if (!isAnimating) return;

    // Clear active timers
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    if (removeTimerRef.current) {
      clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
    }

    // Reset animation state without removing anyone
    setFocusedId(null);
    setRemovingId(null);
    setIsAnimating(false);
  };

  const handleUndo = () => {
    if (isAnimating || !lastWinner) return;

    // Restore last winner to the end of the pool
    setPool((prev) => [...prev, lastWinner]);
    setLastWinner(null);
  };

  const canDraw = pool.length > 0 && !isAnimating;
  const canUndo = lastWinner !== null && !isAnimating;
  const isComplete = pool.length === 0 && !isAnimating;

  return (
    <div className={styles.raffleContainer}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton} disabled={isAnimating}>
          ← Back
        </button>
        <span className={styles.logoText}>Who's Winning?</span>
      </header>

      <main className={styles.mainContent}>
        <ProfileGrid
          participants={pool}
          focusedId={focusedId}
          removingId={removingId}
        />
      </main>

      <OperatorControls
        onDraw={handleDraw}
        onUndo={handleUndo}
        onCancel={handleCancel}
        canDraw={canDraw}
        canUndo={canUndo}
        isAnimating={isAnimating}
        isComplete={isComplete}
      />
    </div>
  );
}
