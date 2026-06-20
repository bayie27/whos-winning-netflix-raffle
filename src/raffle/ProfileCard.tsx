import { useState } from 'react';
import type { Participant } from '../types';
import styles from './ProfileCard.module.css';

export interface ProfileCardProps {
  participant: Participant;
  isFocused: boolean;
  isRemoving: boolean;
  style?: React.CSSProperties;
}

export default function ProfileCard({ participant, isFocused, isRemoving, style }: ProfileCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const cardClassName = [
    styles.card,
    isFocused ? styles.focused : '',
    isRemoving ? styles.removing : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName} data-id={participant.id} style={style}>
      <div className={styles.avatarWrapper}>
        {!participant.avatarUrl || imgFailed ? (
          <div
            className={styles.initialsFallback}
            style={{ backgroundColor: participant.avatarColor }}
          >
            {getInitials(participant.name)}
          </div>
        ) : (
          <img
            src={participant.avatarUrl}
            alt={participant.name}
            className={styles.avatarImage}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className={styles.nameLabel}>{participant.name}</div>
    </div>
  );
}
