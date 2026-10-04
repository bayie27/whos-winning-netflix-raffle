import { useEffect, useRef } from 'react';
import { playWinnerSound } from '../lib/winnerSound';
import { createRouletteTicks } from '../lib/rouletteTick';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const jitterBufferRef = useRef<AudioBuffer | null>(null);
  const stopWinnerRef = useRef<(() => void) | null>(null);
  const tickBuffersRef = useRef<AudioBuffer[]>([]);
  const lastTickTimeRef = useRef<number | null>(null);
  const tickIndexRef = useRef(0);

  useEffect(() => () => {
    stopWinnerRef.current?.();
    const context = audioCtxRef.current;
    if (context && context.state !== 'closed') void context.close();
    audioCtxRef.current = null;
    tickBuffersRef.current = [];
    lastTickTimeRef.current = null;
  }, []);

  const initCtx = async () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || ((window as unknown) as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  };

  const loadSound = async (
    path: string,
    bufferRef: React.MutableRefObject<AudioBuffer | null>
  ): Promise<AudioBuffer | null> => {
    try {
      await initCtx();
      if (!audioCtxRef.current) return null;
      if (bufferRef.current) return bufferRef.current;

      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
      bufferRef.current = decodedBuffer;
      return decodedBuffer;
    } catch {
      // Silent catch per requirements
      return null;
    }
  };

  const playBuffer = (buffer: AudioBuffer, volume: number = 1.0) => {
    if (!audioCtxRef.current) return;
    const source = audioCtxRef.current.createBufferSource();
    const gainNode = audioCtxRef.current.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  const playJitterStart = async () => {
    try {
      const buffer = await loadSound('/assets/sounds/jitter-start.mp3', jitterBufferRef);
      if (buffer) {
        playBuffer(buffer, 1.0);
      }
    } catch {
      // Silent catch per requirements
    }
  };

  const playWinnerLock = async (revealDelay = 0) => {
    try {
      await initCtx();
      if (!audioCtxRef.current) return;
      stopWinnerRef.current?.();
      stopWinnerRef.current = playWinnerSound(audioCtxRef.current, revealDelay);
    } catch {
      // Silent catch per requirements
    }
  };

  const playTick = async () => {
    try {
      await initCtx();
      const context = audioCtxRef.current;
      if (!context || context.state !== 'running') return;

      const now = context.currentTime;
      const interval = lastTickTimeRef.current === null ? 0.06 : now - lastTickTimeRef.current;
      // Keep rapid passes crisp, rather than stacking dozens of loud clicks.
      if (interval < 0.025) return;
      lastTickTimeRef.current = now;

      if (tickBuffersRef.current.length === 0) {
        tickBuffersRef.current = createRouletteTicks(context);
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = tickBuffersRef.current[tickIndexRef.current % tickBuffersRef.current.length];
      tickIndexRef.current++;
      source.playbackRate.value = 0.98 + Math.random() * 0.04;
      gain.gain.value = 0.42 + Math.min(interval / 0.16, 1) * 0.38;
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      source.start();
    } catch {
      // Silent catch
    }
  };

  const playWinner = playWinnerLock;

  return {
    prepareAudio: initCtx,
    playJitterStart,
    playWinnerLock,
    playTick,
    playWinner,
  };
}
export default useAudio;
