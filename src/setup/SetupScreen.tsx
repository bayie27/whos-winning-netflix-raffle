import React, { useRef, useState } from 'react';
import { parseNames } from '../lib/parseNames';
import { parseImportedNames } from '../lib/importNames';
import type { SessionConfig, RaffleType } from '../types';
import styles from './SetupScreen.module.css';

export interface SetupScreenProps {
  initialRawText: string;
  initialSuspenseDuration: number;
  initialRaffleType: RaffleType;
  onChangeRawText: (text: string) => void;
  onChangeSuspenseDuration: (duration: number) => void;
  onChangeRaffleType: (type: RaffleType) => void;
  onStart: (config: SessionConfig) => void;
}

export default function SetupScreen({
  initialRawText,
  initialSuspenseDuration,
  initialRaffleType,
  onChangeRawText,
  onChangeSuspenseDuration,
  onChangeRaffleType,
  onStart,
}: SetupScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const participants = parseNames(initialRawText);
  const isValid = participants.length >= 2;

  const handleRawTextChange = (text: string) => {
    setImportError('');
    setImportStatus('');
    onChangeRawText(text);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const names = parseImportedNames(await file.text());
      onChangeRawText(names.join('\n'));
      setImportError('');
      setImportStatus(`Imported ${names.length} student name${names.length === 1 ? '' : 's'}.`);
    } catch (error) {
      setImportStatus('');
      setImportError(error instanceof Error ? error.message : 'Could not import the selected file.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart({
        participants,
        suspenseDuration: initialSuspenseDuration,
        raffleType: initialRaffleType,
      });
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.logoContainer}>
        <img
          src="/assets/logo/JPCS_Netflix Logo.png"
          alt="JPCS-DLSL Logo"
          className={styles.logoImage}
        />
      </div>

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
            onChange={(e) => handleRawTextChange(e.target.value)}
            placeholder="Alice&#10;Bob&#10;Charlie..."
            rows={10}
          />
          <div className={styles.importRow}>
            <button
              type="button"
              className={styles.importButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className={styles.fileInput}
              aria-label="Import QR-GAAP student names JSON"
            />
            <span className={styles.importHint}>Replaces the current list</span>
          </div>
          {importStatus && <div className={styles.importStatus}>{importStatus}</div>}
          {importError && <div className={styles.importError}>{importError}</div>}
          <div className={styles.metaRow}>
            <span className={styles.validCount}>
              Valid names: <strong>{participants.length}</strong>
            </span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.sliderHeader}>
            <label htmlFor="suspense-slider" className={styles.label}>
              Duration
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

        <div className={styles.inputGroup}>
          <label className={styles.label}>Raffle Type</label>
          <div className={styles.radioGroup}>
            <label className={`${styles.radioLabel} ${initialRaffleType === 'default' ? styles.radioLabelActive : ''}`}>
              <input
                type="radio"
                name="raffleType"
                value="default"
                checked={initialRaffleType === 'default'}
                onChange={() => onChangeRaffleType('default')}
                className={styles.radioInput}
              />
              Default Selector
            </label>
            <label className={`${styles.radioLabel} ${initialRaffleType === 'roulette' ? styles.radioLabelActive : ''}`}>
              <input
                type="radio"
                name="raffleType"
                value="roulette"
                checked={initialRaffleType === 'roulette'}
                onChange={() => onChangeRaffleType('roulette')}
                className={styles.radioInput}
              />
              Roulette
            </label>
          </div>
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
