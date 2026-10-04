import styles from './OperatorControls.module.css';

export interface OperatorControlsProps {
  onDraw: () => void;
  onUndo: () => void;
  onCancel: () => void;
  canDraw: boolean;
  canUndo: boolean;
  isAnimating: boolean;
  isComplete: boolean;
}

export default function OperatorControls({ onDraw, onUndo, onCancel, canDraw, canUndo, isAnimating, isComplete }: OperatorControlsProps) {
  return (
    <footer className={styles.controls}>
      <p className={styles.accessibleStatus} role="status" aria-live="polite">
        {isComplete ? 'Raffle complete' : isAnimating ? 'Selecting a winner' : canDraw ? 'Ready to draw' : 'Winner selected'}
      </p>
      {isComplete ? <p className={styles.completeMessage}>Raffle complete</p> : (
        <div className={styles.buttonRow}>
          <button onClick={onUndo} disabled={!canUndo} className={`${styles.secondaryButton} ${styles.undoButton}`} id="undo-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M8 4 3 9l5 5M3 9h10a6 6 0 0 1 0 12h-3" />
            </svg>
            Undo
          </button>
          <button onClick={onDraw} disabled={!canDraw} className={styles.drawButton} id="draw-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
            {isAnimating ? 'Selecting…' : 'Draw winner'}
          </button>
          <div className={styles.cancelSlot}>
            {isAnimating && <button onClick={onCancel} className={styles.secondaryButton} id="cancel-btn">Cancel</button>}
          </div>
        </div>
      )}
    </footer>
  );
}
