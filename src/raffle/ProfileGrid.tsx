import { useState, useRef, useEffect } from 'react';
import type { Participant } from '../types';
import ProfileCard from './ProfileCard';
import styles from './ProfileGrid.module.css';

export interface ProfileGridProps {
  participants: Participant[];
  focusedId: string | null;
  removingId: string | null;
}

export default function ProfileGrid({ participants, focusedId, removingId }: ProfileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    const parent = gridRef.current?.parentElement;
    if (!parent) return;
    const measure = () => setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(parent);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const count = participants.length;
  const compact = count > 56;
  const gap = compact ? 10 : count > 20 ? 14 : 20;
  const captionHeight = compact ? 22 : 0;
  const minSize = compact ? 35 : 80;
  const width = Math.max(0, dimensions.width - 32);
  const height = Math.max(0, dimensions.height - 32);
  let columns = 1;
  let bestSize = 0;

  // Fit the largest portraits that show the whole pool when space permits.
  for (let candidate = 1; candidate <= Math.min(50, count); candidate++) {
    const rows = Math.ceil(count / candidate);
    const horizontal = (width - (candidate - 1) * gap) / candidate;
    const vertical = (height - (rows - 1) * gap) / rows - captionHeight;
    const size = Math.min(horizontal, vertical);
    if (size > bestSize) {
      bestSize = size;
      columns = candidate;
    }
  }

  let cardSize = Math.min(220, bestSize);
  if (cardSize < minSize) {
    // Small screens scroll vertically, never clip columns horizontally.
    columns = Math.max(1, Math.min(count, Math.floor((width + gap) / (minSize + gap))));
    cardSize = Math.min(minSize, Math.max(1, width));
  }

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{
        gridTemplateColumns: count ? `repeat(${columns}, ${cardSize}px)` : '1fr',
        gap: `${gap}px`,
        '--card-size': `${cardSize}px`,
      } as React.CSSProperties}
    >
      {count === 0 ? <p className={styles.emptyMessage}>All winners have been drawn.</p> : participants.map((participant) => (
        <ProfileCard
          key={participant.id}
          participant={participant}
          isFocused={participant.id === focusedId}
          isRemoving={participant.id === removingId}
          compact={compact}
        />
      ))}
    </div>
  );
}
