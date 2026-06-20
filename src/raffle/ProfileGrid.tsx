import type { Participant } from '../types';
import ProfileCard from './ProfileCard';
import { getColumnCount } from '../lib/getColumnCount';
import styles from './ProfileGrid.module.css';

export interface ProfileGridProps {
  participants: Participant[];
  focusedId: string | null;
  removingId: string | null;
}

export default function ProfileGrid({ participants, focusedId, removingId }: ProfileGridProps) {
  const columnCount = getColumnCount(participants.length);

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {participants.map((p) => (
        <ProfileCard
          key={p.id}
          participant={p}
          isFocused={p.id === focusedId}
          isRemoving={p.id === removingId}
        />
      ))}
    </div>
  );
}
