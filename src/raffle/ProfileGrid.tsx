import { useState, useRef, useEffect } from 'react';
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
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const parent = gridRef.current?.parentElement;
      if (parent) {
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight,
        });
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    let resizeObserver: ResizeObserver | null = null;
    const parent = gridRef.current?.parentElement;
    if (parent && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(parent);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [participants.length]);

  const N = participants.length;
  const C = getColumnCount(N);

  const W = dimensions.width;
  const H = dimensions.height;

  // Grid paddings
  const paddingX = 40;
  const paddingY = 40;

  const availableWidth = Math.max(0, W - paddingX);
  const availableHeight = Math.max(0, H - paddingY);

  // Self-healing columns:
  // If default columns causes cards to scale below 60px (due to height limit),
  // try increasing columns up to 14.
  let bestC = C;
  let bestCardSize = 60;
  let found = false;

  for (let testC = C; testC <= 14; testC++) {
    const testR = Math.ceil(N / testC);
    const gap = N > 56 ? 12 : (N > 20 ? 16 : 24);
    const labelHeight = N > 56 ? 28 : 36;

    const maxW = (availableWidth - (testC - 1) * gap) / testC;
    const maxH = (availableHeight - (testR - 1) * gap) / testR - labelHeight;
    const size = Math.min(maxW, maxH);

    if (size >= 60) {
      bestC = testC;
      bestCardSize = size;
      found = true;
      break;
    }
  }

  if (!found) {
    let maxOptSize = -1;
    for (let testC = C; testC <= 14; testC++) {
      const testR = Math.ceil(N / testC);
      const gap = N > 56 ? 12 : (N > 20 ? 16 : 24);
      const labelHeight = N > 56 ? 28 : 36;

      const maxW = (availableWidth - (testC - 1) * gap) / testC;
      const maxH = (availableHeight - (testR - 1) * gap) / testR - labelHeight;
      const size = Math.min(maxW, maxH);

      if (size > maxOptSize) {
        maxOptSize = size;
        bestC = testC;
      }
    }
    // Allow scaling down to 45px if forced to prevent overflow, but clamp at 60px for standard sets.
    bestCardSize = Math.max(N > 80 ? 45 : 60, maxOptSize);
  }

  const finalGap = N > 56 ? 12 : (N > 20 ? 16 : 24);
  const cardSize = Math.max(N > 80 ? 45 : 60, Math.min(150, bestCardSize));

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${bestC}, ${cardSize}px)`,
        gap: `${finalGap}px`,
        '--card-size': `${cardSize}px`,
      } as React.CSSProperties}
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

