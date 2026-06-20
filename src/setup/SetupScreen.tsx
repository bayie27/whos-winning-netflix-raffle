import React from 'react';
import { parseNames } from '../lib/parseNames';
import type { SessionConfig } from '../types';
import styles from './SetupScreen.module.css';

export interface SetupScreenProps {
  initialRawText: string;
  initialSuspenseDuration: number;
  onChangeRawText: (text: string) => void;
  onChangeSuspenseDuration: (duration: number) => void;
  onStart: (config: SessionConfig) => void;
}

export default function SetupScreen({
  initialRawText,
  initialSuspenseDuration,
  onChangeRawText,
  onChangeSuspenseDuration,
  onStart,
}: SetupScreenProps) {
  const participants = parseNames(initialRawText);
  const isValid = participants.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart({
        participants,
        suspenseDuration: initialSuspenseDuration,
      });
    }
  };

  return (
    <div className={styles.setupContainer}>
      <form onSubmit={handleSubmit} className={styles.setupForm}>
        <h1 className={styles.title}>Who's Winning?</h1>
        <p className={styles.subtitle}>Enter participant names to start the raffle</p>

        <div className={styles.inputGroup}>
          <label htmlFor="names-input" className={styles.label}>
            Names (one per line, minimum 2)
          </label>
          <textarea
            id="names-input"
            className={styles.textarea}
            value={initialRawText}
            onChange={(e) => onChangeRawText(e.target.value)}
            placeholder="Alice&#10;Bob&#10;Charlie..."
            rows={10}
          />
          <div className={styles.metaRow}>
            <span className={styles.validCount}>
              Valid names: <strong>{participants.length}</strong>
            </span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.sliderHeader}>
            <label htmlFor="suspense-slider" className={styles.label}>
              Suspense Duration
            </label>
            <span className={styles.sliderValue}>{initialSuspenseDuration.toFixed(1)}s</span>
          </div>
          <input
            id="suspense-slider"
            type="range"
            min={3}
            max={10}
            step={0.5}
            value={initialSuspenseDuration}
            onChange={(e) => onChangeSuspenseDuration(parseFloat(e.target.value))}
            className={styles.slider}
          />
        </div>

        <button
          type="submit"
          className={styles.startButton}
          disabled={!isValid}
          id="start-raffle-btn"
        >
          Start Raffle
        </button>
      </form>
    </div>
  );
}
