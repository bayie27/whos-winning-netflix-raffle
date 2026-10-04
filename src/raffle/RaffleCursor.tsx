import { forwardRef } from 'react';
import styles from './RaffleCursor.module.css';

export interface RaffleCursorProps {
  visible: boolean;
}

export const RaffleCursor = forwardRef<HTMLDivElement, RaffleCursorProps>(
  ({ visible }, ref) => {
    if (!visible) return null;

    return (
      <div ref={ref} className={styles.cursor} id="raffle-cursor" aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 11V3h8m10 0h8v8m0 10v8h-8m-10 0H3v-8" stroke="#f2c879" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="#e50914" stroke="#fff4e8" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
);

RaffleCursor.displayName = 'RaffleCursor';
export default RaffleCursor;
