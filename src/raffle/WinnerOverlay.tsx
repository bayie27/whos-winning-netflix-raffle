import { useState } from 'react';
import type { Participant, OverlayPhase } from '../types';
import styles from './WinnerOverlay.module.css';

export interface WinnerOverlayProps {
  winner: Participant | null;
  phase: OverlayPhase;
}

export default function WinnerOverlay({ winner, phase }: WinnerOverlayProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (phase === 'hidden' || !winner) return null;

  const isReveal = phase === 'reveal';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className={styles.overlayContainer}>
      <div className={`${styles.winnerCard} ${styles[phase]}`}>
        <div className={styles.avatarWrapper}>
          {!winner.avatarUrl || imgFailed ? (
            <div
              className={styles.initialsFallback}
              style={{ backgroundColor: winner.avatarColor }}
            >
              {getInitials(winner.name)}
            </div>
          ) : (
            <img
              src={winner.avatarUrl}
              alt={winner.name}
              className={styles.avatarImage}
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <div className={`${styles.winnerName} ${isReveal ? styles.nameVisible : ''}`}>
          {winner.name}
        </div>
      </div>
    </div>
  );
}
