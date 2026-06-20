import { useEffect } from 'react';
import type { SessionConfig } from '../types';
import ProfileGrid from './ProfileGrid';
import OperatorControls from './OperatorControls';
import useRaffle from '../hooks/useRaffle';
import styles from './RaffleScreen.module.css';

export interface RaffleScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

export default function RaffleScreen({ config, onBack }: RaffleScreenProps) {
  const {
    participants,
    focusedId,
    animationPhase,
    canDraw,
    canUndo,
    isComplete,
    draw,
    cancel,
    undo,
  } = useRaffle(config);

  // Unload guard to prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className={styles.raffleContainer}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton} disabled={animationPhase !== 'idle'}>
          ← Back
        </button>
        <span className={styles.logoText}>Who's Winning?</span>
      </header>

      <main className={styles.mainContent}>
        <ProfileGrid
          participants={participants}
          focusedId={focusedId}
          removingId={null}
        />
      </main>

      <OperatorControls
        onDraw={draw}
        onUndo={undo}
        onCancel={cancel}
        canDraw={canDraw}
        canUndo={canUndo}
        isAnimating={animationPhase === 'jitter' || animationPhase === 'decel'}
        isComplete={isComplete}
      />
    </div>
  );
}
