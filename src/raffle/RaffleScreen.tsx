import { useEffect } from 'react';
import type { SessionConfig } from '../types';
import ProfileGrid from './ProfileGrid';
import OperatorControls from './OperatorControls';
import RaffleCursor from './RaffleCursor';
import WinnerOverlay from './WinnerOverlay';
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

  const isCursorVisible = animationPhase === 'jitter' || animationPhase === 'decel';

  return (
    <div className={styles.raffleContainer}>
      <div className={styles.logoContainer}>
        <img
          src="/assets/logo/JPCS_Netflix Logo.png"
          alt="JPCS-DLSL Logo"
          className={styles.logoImage}
        />
      </div>

      <main className={styles.mainContent}>
        <h1 className={styles.title}>Who's Winning?</h1>
        <ProfileGrid
          participants={participants}
          focusedId={focusedId}
          removingId={null}
        />
      </main>

      <RaffleCursor
        ref={cursorRef}
        visible={isCursorVisible}
      />

      <WinnerOverlay
        winner={currentWinner}
        phase={winnerOverlayPhase}
        onDismiss={dismissWinner}
      />

      <OperatorControls
        onDraw={draw}
        onUndo={undo}
        onCancel={cancel}
        onBack={onBack}
        canDraw={canDraw}
        canUndo={canUndo}
        isAnimating={isCursorVisible}
        isComplete={isComplete}
      />
    </div>
  );
}
