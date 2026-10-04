import { useState, useMemo, useRef, useEffect } from 'react';
import type { SessionConfig, Participant, OverlayPhase } from '../types';
import RoulettePortrait from './RoulettePortrait';
import WinnerOverlay from './WinnerOverlay';
import styles from './RouletteScreen.module.css';
import { useAudio } from '../hooks/useAudio';

export interface RouletteScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

export default function RouletteScreen({ config, onBack }: RouletteScreenProps) {
  const { participants, suspenseDuration } = config;
  const cardWidth = 150;
  const cardGap = 20;
  const cardFullWidth = cardWidth + cardGap;
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [sliderOffset, setSliderOffset] = useState(cardFullWidth * 8 + cardWidth / 2);
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('hidden');

  const { prepareAudio, playTick, playWinner } = useAudio();
  const trackRef = useRef<HTMLDivElement>(null);
  const rAFRef = useRef<number | null>(null);
  const lastPassedIndex = useRef<number>(-1);

  // Generate a long list of cards for the roulette
  const rouletteItems = useMemo(() => {
    const items: { participant: Participant; uniqueId: string }[] = [];
    while (items.length < 150) {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      shuffled.forEach((p, index) => {
        items.push({ participant: p, uniqueId: `${p.id}-${items.length}-${index}` });
      });
    }
    return items.slice(0, 150);
  }, [participants]);

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
    };
  }, []);

  const handleDraw = () => {
    if (isSpinning) return;
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
        setTimeout(() => {
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
        <button onClick={onBack} className={styles.backButton} disabled={isSpinning}>
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
        onDismiss={() => {
          setOverlayPhase('hidden');
        }}
      />

      <footer className={styles.controls}>
        <div className={styles.spinStatus} role="status" aria-live="polite">
          <span className={styles.statusLight} aria-hidden="true" />
          <span>{isSpinning ? 'Finding a winner…' : winner ? `${winner.name} selected` : 'Ready to spin'}</span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          {isSpinning && <div className={styles.progressFill} style={{ animationDuration: `${suspenseDuration}s` }} />}
        </div>
        <button onClick={handleDraw} className={styles.spinButton} disabled={isSpinning}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {isSpinning ? <path d="M7 6h3v12H7zm7 0h3v12h-3z" /> : <path d="m8 5 11 7-11 7z" />}
          </svg>
          {isSpinning ? 'Spinning…' : winner ? 'Spin Again' : 'Spin Roulette'}
        </button>
      </footer>
    </div>
  );
}
