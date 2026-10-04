import { useState } from 'react';
import type { Participant } from '../types';
import styles from './RouletteScreen.module.css';

export default function RoulettePortrait({ participant }: { participant: Participant }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = participant.name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join('').toUpperCase();

  return (
    <div className={styles.portrait}>
      {participant.avatarUrl && !imageFailed ? (
        <img src={participant.avatarUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <div className={styles.initials} style={{ backgroundColor: participant.avatarColor }}>
          {initials}
        </div>
      )}
      <div className={styles.portraitName} title={participant.name}>
        <span>{participant.name}</span>
      </div>
    </div>
  );
}
