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
  const [imgFailed, setImgFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (phase !== 'reveal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: ConfettiParticle[] = [];

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };
    resizeCanvas();

    const colors = ['#E50914', '#ffffff', '#ffd700', '#ff3366', '#00d2fc', '#8b5cf6'];
    const count = 120;

    // Bottom left cannon
    for (let i = 0; i < count / 2; i++) {
      particles.push({
        x: 0,
        y: canvas.height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 15 + 10,
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
        speedX: -(Math.random() * 15 + 10),
        speedY: -(Math.random() * 20 + 15),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
      });
    }

    const gravity = 0.45;
    const drag = 0.98;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0 || p.y > canvas.height + 20) continue;

        alive = true;

        p.speedX *= drag;
        p.speedY += gravity;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.speedY > 0) {
          p.opacity -= 0.008;
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

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [phase]);

  if (phase === 'hidden' || !winner) return null;

  const isReveal = phase === 'reveal';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  };

  return (
    <div className={styles.overlayContainer} onClick={handleBackdropClick}>
      <canvas ref={canvasRef} className={styles.confettiCanvas} />
      <div
        className={`${styles.winnerCard} ${styles[phase]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.avatarWrapper}>
          {!winner.avatarUrl || imgFailed ? (
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
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <div className={`${styles.congratsLabel} ${isReveal ? styles.nameVisible : ''}`}>
          CONGRATULATIONS!
        </div>
        <div className={`${styles.winnerName} ${isReveal ? styles.nameVisible : ''}`}>
          {winner.name}
        </div>
      </div>
    </div>
  );
}
