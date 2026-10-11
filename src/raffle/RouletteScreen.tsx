import { useState, useRef, useEffect } from 'react';
import type { SessionConfig, Participant, OverlayPhase } from '../types';
import RoulettePortrait from './RoulettePortrait';
import WinnerOverlay from './WinnerOverlay';
import styles from './RouletteScreen.module.css';
import { useAudio } from '../hooks/useAudio';

export interface RouletteScreenProps {
  config: SessionConfig;
  onBack: (remaining: Participant[]) => void;
}

interface ReelItem {
  participant: Participant;
  uniqueId: string;
}

const REEL_LENGTH = 150;

// Fisher-Yates, so every ordering is equally likely.
function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Built only on mount and when the pool changes, never during a spin.
function buildReel(participants: Participant[]): ReelItem[] {
  const items: ReelItem[] = [];
  if (participants.length === 0) return items;
  while (items.length < REEL_LENGTH) {
    shuffle(participants).forEach((p, index) => {
      items.push({ participant: p, uniqueId: `${p.id}-${items.length}-${index}` });
    });
  }
  return items.slice(0, REEL_LENGTH);
}

export default function RouletteScreen({ config, onBack }: RouletteScreenProps) {
  const { suspenseDuration } = config;
  const cardWidth = 150;
  const cardGap = 20;
  const cardFullWidth = cardWidth + cardGap;
  // Participants still in the running; winners are removed once their reveal is dismissed.
  const [participants, setParticipants] = useState<Participant[]>(config.participants);
  const [rouletteItems, setRouletteItems] = useState<ReelItem[]>(() => buildReel(config.participants));
  const isComplete = participants.length === 0;
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [sliderOffset, setSliderOffset] = useState(cardFullWidth * 8 + cardWidth / 2);
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('hidden');

  const { prepareAudio, playTick, playWinner } = useAudio();
  const trackRef = useRef<HTMLDivElement>(null);
  const rAFRef = useRef<number | null>(null);
  const lastPassedIndex = useRef<number>(-1);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monitorAnimation = () => {
    if (!trackRef.current) return;

    const style = window.getComputedStyle(trackRef.current);
    const transform = style.transform;
    let tx = 0;

    if (transform !== 'none') {
      const match = transform.match(/matrix\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        tx = parseFloat(values[4]);
      }
    }

    const centerScreen = window.innerWidth / 2;
    const offset = centerScreen - tx;
    const currentIndex = Math.floor((offset + (cardGap / 2)) / cardFullWidth);

    if (lastPassedIndex.current !== currentIndex && lastPassedIndex.current !== -1) {
      playTick();
    }

    lastPassedIndex.current = currentIndex;
    rAFRef.current = requestAnimationFrame(monitorAnimation);
  };

  useEffect(() => {
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const handleDismissWinner = () => {
    if (winner) {
      const remaining = participants.filter((p) => p.id !== winner.id);
      setParticipants(remaining);
      setRouletteItems(buildReel(remaining));
    }
    setWinner(null);
    setWinnerIndex(-1);
    setOverlayPhase('hidden');
    // The reel is rebuilt without the winner, so put it back at its resting position.
    setSliderOffset(cardFullWidth * 8 + cardWidth / 2);
  };

  const handleDraw = () => {
    if (isSpinning || isComplete) return;
    // Unlock sound from the button click before the animation begins.
    void prepareAudio().catch(() => {});

    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    lastPassedIndex.current = -1;

    // Reset immediately (no transition)
    setWinner(null);
    setWinnerIndex(-1);
    setOverlayPhase('hidden');

    // Start slightly off so it doesn't look completely static before spin
    const startOffset = cardFullWidth * 8 + Math.random() * cardFullWidth * 2;
    setSliderOffset(startOffset);

    // Double rAF ensures the DOM has updated with the reset offset before applying the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSpinning(true);

        // Pick a random winner towards the end to ensure a long spin
        const targetIndex = Math.floor(Math.random() * 30) + 100; // 100 to 129
        const targetParticipant = rouletteItems[targetIndex].participant;

        setWinnerIndex(targetIndex);

        // Land the selected portrait exactly inside the selection frame.
        const centerOffset = (targetIndex * cardFullWidth) + (cardWidth / 2);

        setSliderOffset(centerOffset);

        // Start monitoring for tick sounds
        lastPassedIndex.current = Math.floor((startOffset + (cardGap / 2)) / cardFullWidth);
        rAFRef.current = requestAnimationFrame(monitorAnimation);

        // Wait for animation to finish
        revealTimeoutRef.current = setTimeout(() => {
          setWinner(targetParticipant);
          setIsSpinning(false);
          setOverlayPhase('reveal');
          playWinner();
          if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        }, suspenseDuration * 1000);
      });
    });
  };

  return (
    <div className={`${styles.container} ${isSpinning ? styles.spinning : ''}`}>
      <header className={styles.header}>
        <button onClick={() => onBack(participants)} className={styles.backButton} disabled={isSpinning}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="m14 6-6 6 6 6M8 12h12" />
          </svg>
          Back to Setup
        </button>
      </header>

      <section className={styles.stage} aria-label="Roulette track">
        <div className={styles.selectionFrame} aria-hidden="true" />
        <div className={styles.pointer} aria-hidden="true" />
        <div className={styles.trackContainer}>
          <div
            ref={trackRef}
            className={styles.sliderTrack}
            style={{
              transform: `translateX(calc(50vw - ${sliderOffset}px))`,
              transition: isSpinning ? `transform ${suspenseDuration}s cubic-bezier(0.1, 0.85, 0.1, 1)` : 'none'
            }}
          >
            {rouletteItems.map((item, i) => {
              const isWinner = winnerIndex === i && !!winner;
              const isFaded = winner && !isWinner;

              return (
                <div
                  key={item.uniqueId}
                  className={`${styles.cardWrapper} ${isWinner ? styles.winnerCard : ''}`}
                  style={{
                    width: cardWidth,
                    marginRight: cardGap,
                    opacity: isFaded ? 0.3 : 1
                  }}
                >
                  <RoulettePortrait participant={item.participant} />
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.edgeShade} aria-hidden="true" />
      </section>

      {/* Consistent Winner Overlay with Confetti */}
      <WinnerOverlay
        winner={winner}
        phase={overlayPhase}
        onDismiss={handleDismissWinner}
      />

      <footer className={styles.controls}>
        <div className={styles.spinStatus} role="status" aria-live="polite">
          <span className={styles.statusLight} aria-hidden="true" />
          <span>
            {isComplete
              ? 'Raffle complete'
              : isSpinning
                ? 'Finding a winner…'
                : winner
                  ? `${winner.name} selected`
                  : `Ready to spin · ${participants.length} remaining`}
          </span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          {isSpinning && <div className={styles.progressFill} style={{ animationDuration: `${suspenseDuration}s` }} />}
        </div>
        <button onClick={handleDraw} className={styles.spinButton} disabled={isSpinning || isComplete}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {isSpinning ? <path d="M7 6h3v12H7zm7 0h3v12h-3z" /> : <path d="m8 5 11 7-11 7z" />}
          </svg>
          {isSpinning ? 'Spinning…' : isComplete ? 'No one left' : 'Spin Roulette'}
        </button>
      </footer>
    </div>
  );
}
