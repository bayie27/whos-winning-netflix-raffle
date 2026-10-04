// An original reveal cue, generated locally so it never waits for a download.
export function playWinnerSound(context: BaseAudioContext, revealDelay = 0) {
  const nodes: AudioNode[] = [];
  const sources: AudioScheduledSourceNode[] = [];
  const track = <T extends AudioNode>(node: T): T => {
    nodes.push(node);
    return node;
  };
  const start = context.currentTime + 0.015;
  const reveal = start + revealDelay;
  const resolve = reveal + 0.48;
  const end = resolve + 3.1;
  const master = track(context.createGain());
  master.gain.value = 0.7;
  const compressor = track(context.createDynamicsCompressor());
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.18;
  master.connect(compressor);
  compressor.connect(context.destination);

  const dry = track(context.createGain());
  dry.connect(master);

  // A short diffuse room adds depth without washing out the melody.
  const reverb = track(context.createConvolver());
  const impulse = context.createBuffer(2, Math.ceil(context.sampleRate * 1.2), context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const samples = impulse.getChannelData(channel);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3);
    }
  }
  reverb.buffer = impulse;
  const wet = track(context.createGain());
  wet.gain.value = 0.16;
  dry.connect(reverb);
  reverb.connect(wet);
  wet.connect(master);

  const echo = track(context.createDelay(0.5));
  echo.delayTime.value = 0.24;
  const echoGain = track(context.createGain());
  echoGain.gain.value = 0.14;
  dry.connect(echo);
  echo.connect(echoGain);
  echoGain.connect(master);

  const tone = (
    frequency: number,
    time: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
    detune = 0,
  ) => {
    const oscillator = track(context.createOscillator());
    const envelope = track(context.createGain());
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(dry);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
    sources.push(oscillator);
    return oscillator;
  };

  // Rounded low impact marks the lock, followed by a quiet upward shimmer.
  const impact = tone(110, start, 0.55, 0.42);
  impact.frequency.exponentialRampToValueAtTime(45, start + 0.35);
  tone(261.63, start, 0.65, 0.08, 'triangle');

  // C–E–G–C: crisp bell attacks with a softer upper partial.
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    const time = reveal + index * 0.12;
    tone(frequency, time, 0.95, 0.14, 'triangle');
    tone(frequency * 2, time, 0.45, 0.035);
  });

  // A spacious C6/9 resolution: bass foundation, gentle doubled harmony,
  // and a final high sparkle. Everything fades naturally within four seconds.
  tone(130.81, resolve, 1.6, 0.22);
  [261.63, 329.63, 392, 440, 587.33].forEach((frequency) => {
    tone(frequency, resolve, 1.8, 0.07, 'triangle', -4);
    tone(frequency, resolve + 0.015, 1.8, 0.045, 'sine', 4);
  });
  tone(1567.98, resolve + 0.12, 0.9, 0.055);
  tone(2093, resolve + 0.24, 0.8, 0.035);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    for (const source of sources) {
      source.stop();
    }
    for (const node of nodes) node.disconnect();
  };

  // Keep effect tails alive, then release the whole graph on the audio clock.
  const tail = track(context.createBufferSource());
  tail.buffer = context.createBuffer(1, 1, context.sampleRate);
  tail.connect(master);
  tail.onended = stop;
  tail.start(end);
  sources.push(tail);

  return stop;
}
