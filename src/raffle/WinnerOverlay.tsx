import { useState, useEffect, useRef } from 'react';
import type { Participant, OverlayPhase } from '../types';
import styles from './WinnerOverlay.module.css';

export interface WinnerOverlayProps {
  winner: Participant | null;
  phase: OverlayPhase;
  onDismiss: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function WinnerOverlay({ winner, phase, onDismiss }: WinnerOverlayProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const isOpen = phase !== 'hidden' && winner !== null;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'reveal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;

    let animationFrameId: number;
    const particles: ConfettiParticle[] = [];

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };
    resizeCanvas();

    const colors = ['#e50914', '#f2c879', '#fff4e8', '#b90820'];
    const count = 120;

    // Bottom left cannon
    for (let i = 0; i < count / 2; i++) {
      particles.push({
        x: 0,
        y: canvas.height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() * 15 + 10) * Math.min(canvas.width / 1200, 1),
        speedY: -(Math.random() * 20 + 15),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
      });
    }

    // Bottom right cannon
    for (let i = 0; i < count / 2; i++) {
      particles.push({
        x: canvas.width,
        y: canvas.height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: -(Math.random() * 15 + 10) * Math.min(canvas.width / 1200, 1),
        speedY: -(Math.random() * 20 + 15),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
      });
    }

    const gravity = 0.45;
    const drag = 0.98;
    let lastFrameTime: number | null = null;

    const updateAndDraw = (now: number) => {
      const step = lastFrameTime === null ? 1 : Math.min((now - lastFrameTime) / (1000 / 60), 2);
      lastFrameTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0 || p.y > canvas.height + 20) continue;

        alive = true;

        p.speedX *= Math.pow(drag, step);
        p.speedY += gravity * step;
        p.x += p.speedX * step;
        p.y += p.speedY * step;
        p.rotation += p.rotationSpeed * step;

        if (p.speedY > 0) {
          p.opacity -= 0.008 * step;
        }

        if (p.opacity < 0) p.opacity = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }

      if (alive) {
        animationFrameId = requestAnimationFrame(updateAndDraw);
      }
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    window.addEventListener('resize', resizeCanvas);
    const stopForReducedMotion = () => {
      if (!motionPreference.matches) return;
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    motionPreference.addEventListener('change', stopForReducedMotion);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      motionPreference.removeEventListener('change', stopForReducedMotion);
    };
  }, [phase, winner?.id]);

  if (phase === 'hidden' || !winner) return null;

  const isReveal = phase === 'reveal';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isReveal && e.target === e.currentTarget) {
      onDismiss();
    }
  };

  return (
    <div
      ref={dialogRef}
      className={styles.overlayContainer}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-heading"
      tabIndex={-1}
      onClick={handleBackdropClick}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isReveal) {
          event.preventDefault();
          onDismiss();
        }
        if (event.key === 'Tab') {
          event.preventDefault();
          const button = dialogRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
          if (button) button.focus();
          else dialogRef.current?.focus();
        }
      }}
    >
      <div className={styles.backdropWord} aria-hidden="true">Winner</div>
      <canvas ref={canvasRef} className={styles.confettiCanvas} aria-hidden="true" />
      <div
        className={`${styles.winnerCard} ${isReveal ? styles.reveal : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.portraitStage}>
          <div className={styles.avatarWrapper}>
            {!winner.avatarUrl || failedImageUrl === winner.avatarUrl ? (
              <div
                className={styles.initialsFallback}
                style={{ backgroundColor: winner.avatarColor }}
              >
                {getInitials(winner.name)}
              </div>
            ) : (
              <img
                src={winner.avatarUrl}
                alt={winner.name}
                className={styles.avatarImage}
                onError={() => setFailedImageUrl(winner.avatarUrl)}
              />
            )}
          </div>
        </div>
        <div className={styles.winnerDetails}>
          <p className={styles.congratsLabel}>Congratulations!</p>
          <h2 id="winner-heading" className={styles.winnerName}>{winner.name}</h2>
          <button
            type="button"
            className={styles.continueButton}
            onClick={onDismiss}
            disabled={!isReveal}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor" /></svg>
            Continue raffle
          </button>
        </div>
      </div>
    </div>
  );
}
