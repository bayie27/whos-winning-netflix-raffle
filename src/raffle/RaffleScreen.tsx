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
    <div className={`${styles.raffleContainer} ${isCursorVisible ? styles.selecting : ''}`}>
      <header className={styles.header}>
        <img src="/assets/logo/JPCS_Netflix Logo.png" alt="JPCS-DLSL Logo" className={styles.logoImage} />
        <h1 className={styles.title}>Who's Winning?</h1>
        <button className={styles.backButton} onClick={onBack} disabled={animationPhase !== 'idle' && !isComplete}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="m14 6-6 6 6 6M8 12h12" />
          </svg>
          Back to Setup
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.portraitWall} data-profile-viewport aria-label="Participant portraits" role="region" tabIndex={0}>
          <ProfileGrid
            participants={participants}
            focusedId={focusedId}
            removingId={null}
          />
        </div>
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
        canDraw={canDraw}
        canUndo={canUndo}
        isAnimating={isCursorVisible}
        isComplete={isComplete}
      />
    </div>
  );
}
