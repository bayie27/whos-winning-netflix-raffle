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
        const titleEl = parent.querySelector('h1');
        let titleHeight = 0;
        if (titleEl) {
          const rect = titleEl.getBoundingClientRect();
          const style = window.getComputedStyle(titleEl);
          const marginTop = parseFloat(style.marginTop || '0');
          const marginBottom = parseFloat(style.marginBottom || '0');
          titleHeight = rect.height + marginTop + marginBottom;
        }
        const parentStyle = window.getComputedStyle(parent);
        const paddingTop = parseFloat(parentStyle.paddingTop || '0');
        const paddingBottom = parseFloat(parentStyle.paddingBottom || '0');
        const paddingLeft = parseFloat(parentStyle.paddingLeft || '0');
        const paddingRight = parseFloat(parentStyle.paddingRight || '0');
        setDimensions({
          width: parent.clientWidth - paddingLeft - paddingRight,
          height: parent.clientHeight - titleHeight - paddingTop - paddingBottom,
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

  // Find the column count (from Math.min(C, N) up to 45) that maximizes the card size.
  // This automatically uses the horizontal space to make cards as large as possible.
  const startC = Math.min(C, N);
  let bestC = startC;
  let maxOptSize = -1;

  for (let testC = startC; testC <= Math.min(45, N); testC++) {
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

  const bestCardSize = maxOptSize;

  const minSize = N > 80 ? 35 : 60;
  const finalGap = N > 56 ? 12 : (N > 20 ? 16 : 24);
  let cardSize = Math.max(minSize, Math.min(220, bestCardSize));
  let finalC = bestC;

  // If the calculated size is smaller than the minimum size, the grid is height-constrained.
  // To avoid large side spacings and minimize vertical scrolling, we recalculate the column count
  // to fit as many columns of minSize as horizontally possible (capped at 50 columns).
  if (bestCardSize < minSize) {
    const maxCols = Math.floor((availableWidth + finalGap) / (minSize + finalGap));
    finalC = Math.max(startC, Math.min(50, Math.min(maxCols, N)));
    cardSize = minSize;
  }

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${finalC}, ${cardSize}px)`,
        gap: `${finalGap}px`,
        '--card-size': `${cardSize}px`,
      } as React.CSSProperties}
    >
      {participants.map((p, index) => (
        <ProfileCard
          key={p.id}
          participant={p}
          isFocused={p.id === focusedId}
          isRemoving={p.id === removingId}
          style={{ '--index': index } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

