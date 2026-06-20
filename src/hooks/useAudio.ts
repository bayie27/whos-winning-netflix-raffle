import { useRef } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const jitterBufferRef = useRef<AudioBuffer | null>(null);
  const lockBufferRef = useRef<AudioBuffer | null>(null);

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

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  const playJitterStart = async () => {
    try {
      const buffer = await loadSound('/assets/sounds/jitter-start.mp3', jitterBufferRef);
      if (buffer) {
        playBuffer(buffer);
      }
    } catch {
      // Silent catch per requirements
    }
  };

  const playWinnerLock = async () => {
    try {
      const buffer = await loadSound('/assets/sounds/winner-lock.mp3', lockBufferRef);
      if (buffer) {
        playBuffer(buffer);
      }
    } catch {
      // Silent catch per requirements
    }
  };

  return {
    playJitterStart,
    playWinnerLock,
  };
}
export default useAudio;
