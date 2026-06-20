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

export default function OperatorControls({
  onDraw,
  onUndo,
  onCancel,
  canDraw,
  canUndo,
  isAnimating,
  isComplete,
}: OperatorControlsProps) {
  if (isComplete) {
    return (
      <div className={styles.hudContainer}>
        <div className={styles.completeMessage}>Raffle Complete</div>
      </div>
    );
  }

  return (
    <div className={styles.hudContainer}>
      <button
        onClick={onDraw}
        disabled={!canDraw}
        className={styles.button}
        id="draw-btn"
      >
        Draw
      </button>

      {isAnimating && (
        <button
          onClick={onCancel}
          className={`${styles.button} ${styles.cancelButton}`}
          id="cancel-btn"
        >
          Cancel
        </button>
      )}

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={styles.button}
        id="undo-btn"
      >
        Undo
      </button>
    </div>
  );
}
