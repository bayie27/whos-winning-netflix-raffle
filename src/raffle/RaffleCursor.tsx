import { forwardRef } from 'react';
import styles from './RaffleCursor.module.css';

export interface RaffleCursorProps {
  visible: boolean;
}

export const RaffleCursor = forwardRef<HTMLDivElement, RaffleCursorProps>(
  ({ visible }, ref) => {
    if (!visible) return null;

    return (
      <div ref={ref} className={styles.cursor} id="raffle-cursor">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 3V19.12L9.41 14.21H17.5L4.5 3Z"
            fill="#E50914"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);

RaffleCursor.displayName = 'RaffleCursor';
export default RaffleCursor;
