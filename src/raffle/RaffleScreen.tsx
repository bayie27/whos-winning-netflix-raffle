import { useEffect, useState } from 'react';
import type { SessionConfig } from '../types';
import ProfileGrid from './ProfileGrid';
import styles from './RaffleScreen.module.css';

export interface RaffleScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

export default function RaffleScreen({ config, onBack }: RaffleScreenProps) {
  const [participants, setParticipants] = useState(config.participants);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Unload guard to prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // standard message trigger
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
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <span className={styles.logoText}>Who's Winning?</span>
      </header>

      <main className={styles.mainContent}>
        <ProfileGrid
          participants={participants}
          focusedId={focusedId}
          removingId={removingId}
        />
      </main>

      {/* Slots for cursor, overlay, controls - stubbed for now */}
      <div className={styles.controlsStub}>
        <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
          Controls HUD Stub | Participants Left: {participants.length}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => {
              if (participants.length > 0) {
                const randIndex = Math.floor(Math.random() * participants.length);
                setFocusedId(participants[randIndex].id);
              }
            }}
            className={styles.hudButton}
          >
            Random Focus
          </button>
          <button
            onClick={() => {
              if (focusedId) {
                setRemovingId(focusedId);
                setTimeout(() => {
                  setParticipants((prev) => prev.filter((p) => p.id !== focusedId));
                  setRemovingId(null);
                  setFocusedId(null);
                }, 300);
              }
            }}
            className={styles.hudButton}
            disabled={!focusedId}
          >
            Remove Focused
          </button>
        </div>
      </div>
    </div>
  );
}
